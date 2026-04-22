from pydantic import BaseModel, Field
from typing import List, Optional

class AnalyzeRequest(BaseModel):
    code: str = Field(..., description="The source code snippet to analyze")
    model: str = Field(..., description="Model used")
    language: str = Field(..., description="Programming language of the code snippet")
    bug_type: str = Field(..., description="Bug type: dbz, npd, ci, xss, or apt")

class DataFlowPoint(BaseModel):
    line: int
    variable: str

class FunctionalityDetail(BaseModel):
    source_reasoning: str      

class ReachabilityDetail(BaseModel):
    wrong_flow_function: Optional[str] = None
    wrong_flow_start_line: Optional[int] = None
    wrong_flow_end_line: Optional[int] = None
    reasoning: str

class SanitizerResults(BaseModel):
    type_sanitize: bool
    functionality_sanitize: FunctionalityDetail
    order_sanitize: bool
    reachability_sanitize: ReachabilityDetail

class BugReport(BaseModel):
    data_flow_path: List[DataFlowPoint]
    sanitizer_results: SanitizerResults
    is_true_bug: bool
    
class AnalyzeResponse(BaseModel):
    bug_count: int
    true_bug_count: int
    reports: List[BugReport]