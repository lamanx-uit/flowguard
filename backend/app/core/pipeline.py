from app.core.data.transform import *
from app.core.sanitizer.analyzer import *
from app.core.sanitizer.passes import *
from app.core.parser.parser import *
from app.core.model.detector import *
import time
import openai
import tiktoken
import json
import re
import signal
import os
from pathlib import Path
from typing import Dict, List, Tuple, Optional


def stream_llmsan(
    source_code: str, #
    file_name: str,
    code_in_support_files: Dict[str, str],
    detection_online_model_name: str, #
    detection_key: str, #
    sanitization_online_model_name: str, #
    sanitization_key: str, #
    bug_type: str,
    analysis_mode: str,
    neural_sanitize_strategy: Dict[str, bool],
    is_measure_token_cost: bool = False
) -> Dict[str, Any]:
    
    SPEC_MAP = {
        "dbz": "dbz.json",
        "xss": "xss.json",
        "npd": "npd.json",
        "ci": "ci.json",
        "apt": "apt.json"
    }
    
    spec_file_name = SPEC_MAP[bug_type]
    
    """
    Start the LLMsan process.
    :param java_file: Path to the Java file to analyze
    :param code_in_support_files: Dictionary of support files with their content
    :param detection_online_model_name: Name of the online model for detection
    :param detection_key: API key for the detection model
    :param sanitization_online_model_name: Name of the online model for sanitization
    :param sanitization_key: API key for the sanitization model
    :param spec_file_name: Name of the specification file
    :param analysis_mode: Analysis mode for the detection modelv (always eager for prec)
    :param neural_check_strategy: Dictionary of neural check strategies
    :param is_measure_token_cost: Flag to measure token cost
    :return: Dictionary containing the count of each type of sanitization
    """
    case_name = file_name
    print("-----------------------------------------------------------")
    print("Analyzing ", case_name)
    print("-----------------------------------------------------------")
    
    bug_report = []
    analyze_report = {
        "bug_count": 0,
        "true_bug_count": 0,
        "reports": []
    }
    true_bug_count = 0
    is_true_bug = False
    
    new_code = obfuscate(source_code)
    lined_new_code = add_line_numbers(new_code)
    
    total_traces = []

    if analysis_mode == "eager":
        detector = Detector(detection_online_model_name, detection_key, spec_file_name)
        json_file_name = case_name
        iterative_cnt = 0
        while True:
            output = detector.start_detection(
                case_name,
                source_code,
                lined_new_code,
                code_in_support_files,
                False,
                is_measure_token_cost
            )
            print("--------------------------")
            print("Detection output:")
            print("--------------------------")
            print(output)
            print("--------------------------")

            bug_num, traces, first_report = parse_bug_report(output)
            if len(traces) == bug_num:
                break
            iterative_cnt += 1
            if iterative_cnt > iterative_count_bound:
                bug_num = 0
                traces = []
                break
        total_traces = traces

    ts_analyzer = TSAnalyzer(case_name, source_code, new_code, code_in_support_files)
    passes = Passes(sanitization_online_model_name, sanitization_key, spec_file_name)

    history_trace_strs = set([])

    for trace in total_traces:
        if str(trace) in history_trace_strs:
            continue
        history_trace_strs.add(str(trace))

        # data sanitization
        # 1. syntactic sanitization
        syntactic_result = passes.type_sanitize(ts_analyzer, trace)

        # 2. functionality sanitization
        if neural_sanitize_strategy["functionality_sanitize"]:
            functionality_result, functionality_details = (
                passes.functionality_sanitize(ts_analyzer, trace, is_measure_token_cost))
        else:
            functionality_result, functionality_details = True, {}
        
        # flow sanitization
        # 3. order sanitization
        order_result = passes.order_sanitize(ts_analyzer, trace)

        # 4. reachability sanitization
        if neural_sanitize_strategy["reachability_sanitize"]:
            reachability_result, reachability_details = (
                passes.reachability_sanitize(ts_analyzer, trace, is_measure_token_cost)) 
        else:
            reachability_result, reachability_details = True, {}

        # If all 4 sanitization checks pass -> true bug:
        if syntactic_result and functionality_result and order_result and reachability_result:
            # report is a trug bug
            true_bug_count += 1
            is_true_bug = True
            
        bug_report.append({
            "data_flow_path": [
                {"line": point[0], "variable": point[1]}
                for point in trace
            ],
            "sanitizer_results": {
                "type_sanitize": syntactic_result,
                "functionality_sanitize": {
                    "source_reasoning": functionality_details.get("src response", "")
                },
                "order_sanitize": order_result,
                "reachability_sanitize": {
                    "wrong_flow_function": reachability_details.get("wrong_flow_function", None),
                    "wrong_flow_start_line": reachability_details.get("wrong_flow_start_line_number", None),
                    "wrong_flow_end_line": reachability_details.get("wrong_flow_end_line_number", None),
                    "reasoning": reachability_details.get("wrong_flow_response", "")
                }
            },
            "is_true_bug": is_true_bug
        })
        
    analyze_report = {
        "bug_count": len(total_traces) if total_traces else 0,
        "true_bug_count": true_bug_count if true_bug_count else 0,
        "reports": bug_report if bug_report else []
    }
        
    return analyze_report

def fix_code_pipeline(
    source_code: str,
    bug_report: List[Dict[str, Any]],
    fix_code_key: str,
    model_name: str,
):  
    
    original_code = source_code
    
    llm = LLM(online_model_name=model_name, openai_key=fix_code_key, temperature=0.3)
    
    prompt_file = Path(__file__).parent / "prompt" / "fix.json"
    
    with open(prompt_file, "r") as f:
        prompt_data = json.load(f)
    
    meta_prompts = prompt_data.get("meta_prompts", [])
    
    prompt_template = meta_prompts[0]

    prompt = prompt_template.format(
        original_code=original_code,
        bug_report=json.dumps(bug_report, indent=2)
    )

    raw_response, _, _ = llm.infer(prompt)

    try:
        parsed = json.loads(raw_response)
        fixed_code = parsed.get("fixed_code", source_code)
        changes = parsed.get("changes", [])
    except json.JSONDecodeError:
        cleaned = re.sub(r"^```(?:json)?\s*|\s*```$", "", raw_response.strip())
        try:
            parsed = json.loads(cleaned)
            fixed_code = parsed.get("fixed_code", source_code)
            changes = parsed.get("changes", [])
        except json.JSONDecodeError:
            fixed_code = raw_response
            changes = []

    return {
        "original_code": source_code,
        "fixed_code": fixed_code,
        "changes": [
            {"line": c["line"], "description": c["description"]}
            if isinstance(c, dict)
            else {"line": 0, "description": str(c)}
            for c in changes
        ]
    }