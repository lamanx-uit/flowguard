"use client";

import { TabResult } from "@/components/tab-result";
import { StreamEvent } from "@/lib/types";

const now = Date.now();

const fakeResults: StreamEvent[] = [
  { stage: "started", timestamp: now },
  {
    stage: "detection",
    bug_count: 1,
    timestamp: now + 1000,
    explanations: [
      "In the file Java_file, the value of x at line 7 is produced by the return value of Integer.parseInt, which can be 0 if the input argument is \"0\". This value of x is then used as the second argument in the divide function at line 8, making the second operand of the division operation at line 3 potentially equal to 0. Hence, there is a divide-by-zero bug at line 3 when the input is \"0\".",
    ],
  },
  {
    stage: "analyzing_trace",
    timestamp: now + 2000,
    trace: [
      { line: 7, variable: "x" },
      { line: 8, variable: "x" },
      { line: 3, variable: "b" },
    ],
  },
  { stage: "type_sanitize", result: true, timestamp: now + 3000 },
  { stage: "functionality_sanitize", result: true, timestamp: now + 4000 },
  {
    stage: "reachability_sanitize",
    result: true,
    reason: { wrong_flow_function: "", wrong_flow_start_line: -1, wrong_flow_end_line: -1 },
    timestamp: now + 5000,
  },
  {
    stage: "trace_result",
    timestamp: now + 6000,
    report: {
      data_flow_path: [
        { line: 7, variable: "x" },
        { line: 8, variable: "x" },
        { line: 3, variable: "b" },
      ],
      sanitizer_results: {
        type_sanitize: true,
        functionality_sanitize: { source_reasoning: "parseInt can return 0 when input is \"0\"." },
        order_sanitize: true,
        reachability_sanitize: { wrong_flow_function: "", wrong_flow_start_line: -1, wrong_flow_end_line: -1, reasoning: "" },
      },
      is_true_bug: true,
    },
  },
  { stage: "completed", bug_count: 1, true_bug_count: 1, timestamp: now + 7000 },
];

export default function TestPage() {
  return (
    <div className="max-w-2xl mx-auto p-8">
      <TabResult
        type="dbz"
        results={fakeResults}
        isAnalyzing={false}
        model="gpt-4.1-mini"
        code=""
        language="java"
        handleChangeFixResult={() => {}}
        handleChangeActiveTab={() => {}}
      />
    </div>
  );
}
