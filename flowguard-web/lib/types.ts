export interface DataFlowPoint {
  line: number;
  variable: string;
}

export interface FunctionalityDetail {
  source_reasoning: string;
}

export interface ReachabilityDetail {
  wrong_flow_function?: string;
  wrong_flow_start_line?: number;
  wrong_flow_end_line?: number;
  reasoning: string;
}

export interface SanitizerResults {
  type_sanitize: boolean;
  functionality_sanitize: FunctionalityDetail;
  order_sanitize: boolean;
  reachability_sanitize: ReachabilityDetail;
}

export interface BugReport {
  data_flow_path: DataFlowPoint[];
  sanitizer_results: SanitizerResults;
  is_true_bug: boolean;
}

export interface ChangeDetail {
  line: number;
  description: string;
}

export interface FixResponse {
  original_code: string;
  fixed_code: string;
  changes: ChangeDetail[];
}

export interface StreamEvent {
  stage: string;
  timestamp?: number;
  message?: string;
  bug_count?: number;
  true_bug_count?: number;
  explanations?: string[];
  trace?: DataFlowPoint[];
  report?: BugReport;
  result?: boolean;
  reason?: {
    wrong_flow_function?: string;
    wrong_flow_start_line?: number;
    wrong_flow_end_line?: number;
    wrong_flow_response?: string;
    reasoning?: string;
  };
}
