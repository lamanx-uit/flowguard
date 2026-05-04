from app.core.data.transform import *
from app.core.sanitizer.analyzer import *
from app.core.sanitizer.passes import *
from app.core.parser.parser import *
from app.core.model.detector import *
import json
import re
from pathlib import Path
from typing import Dict, Iterator, List


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
) -> Iterator[str]:
    SPEC_MAP = {
        "dbz": "dbz.json",
        "xss": "xss.json",
        "npd": "npd.json",
        "ci": "ci.json",
        "apt": "apt.json"
    }

    spec_file_name = SPEC_MAP[bug_type]
    case_name = file_name
    true_bug_count = 0

    new_code = obfuscate(source_code)
    lined_new_code = add_line_numbers(new_code)
    total_traces = []

    yield json.dumps({"stage": "started"}) + "\n"

    if analysis_mode == "eager":
        detector = Detector(detection_online_model_name, detection_key, spec_file_name)
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
            bug_num, traces, first_report = parse_bug_report(output)
            if len(traces) == bug_num:
                break
            iterative_cnt += 1
            if iterative_cnt > iterative_count_bound:
                bug_num = 0
                traces = []
                break
        total_traces = traces

        explanations = []
        for line in first_report.split("\n"):
            if line.startswith("- ") and "[Explanation:" in line:
                start = line.find("[Explanation:") + 13
                end = line.find("]", start)
                if end > start:
                    explanations.append(line[start:end].strip())

        yield json.dumps({
            "stage": "detection",
            "bug_count": len(total_traces),
            "explanations": explanations
        }) + "\n"
            
    ts_analyzer = TSAnalyzer(case_name, source_code, new_code, code_in_support_files)
    passes = Passes(sanitization_online_model_name, sanitization_key, spec_file_name)
    history_trace_strs = set()

    for trace in total_traces:
        if str(trace) in history_trace_strs:
            continue
        history_trace_strs.add(str(trace))

        is_true_bug = False

        yield json.dumps({
            "stage": "analyzing_trace",
            "trace": [{"line": point[0], "variable": point[1]} for point in trace]
        }) + "\n"

        syntactic_result = passes.type_sanitize(ts_analyzer, trace)
        yield json.dumps({"stage": "type_sanitize", "result": syntactic_result}) + "\n"

        if neural_sanitize_strategy["functionality_sanitize"]:
            functionality_result, functionality_details = (
                passes.functionality_sanitize(ts_analyzer, trace, is_measure_token_cost))
        else:
            functionality_result, functionality_details = True, {}
        yield json.dumps({
            "stage": "functionality_sanitize",
            "result": functionality_result,
        }) + "\n"

        order_result = passes.order_sanitize(ts_analyzer, trace)

        if neural_sanitize_strategy["reachability_sanitize"]:
            reachability_result, reachability_details = (
                passes.reachability_sanitize(ts_analyzer, trace, is_measure_token_cost))
        else:
            reachability_result, reachability_details = True, {}
        yield json.dumps({
            "stage": "reachability_sanitize",
            "result": reachability_result,
            "reason": {
                "wrong_flow_function": reachability_details.get("wrong_flow_function", None),
                "wrong_flow_start_line": reachability_details.get("wrong_flow_start_line_number", None),
                "wrong_flow_end_line": reachability_details.get("wrong_flow_end_line_number", None),
            }
        }) + "\n"

        if syntactic_result and functionality_result and order_result and reachability_result:
            true_bug_count += 1
            is_true_bug = True

        yield json.dumps({
            "stage": "trace_result",
            "report": {
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
            }
        }) + "\n"

    yield json.dumps({
        "stage": "completed",
        "bug_count": len(total_traces),
        "true_bug_count": true_bug_count
    }) + "\n"

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