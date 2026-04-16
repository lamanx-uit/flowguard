from fastapi import APIRouter
from app.schemas.analysis import AnalyzeReqest, AnalyzeResponse, BugReport, DataFlowPoint, SanitizerResults, FunctionalityDetail, ReachabilityDetail
from app.config import settings
from app.core.pipeline import stream_llmsan
import asyncio
import structlog

logger = structlog.get_logger("flowguard.analysis")

router = APIRouter(tags=["Analyze"])

@router.post("/analyze", response_model=AnalyzeResponse)
async def analysis(request: AnalyzeReqest):
    logger.info("analysis started", bug_types=request.bug_types, model=request.model)
    result = await asyncio.to_thread(stream_llmsan,
        source_code=request.code,
        file_name=request.language + "_file",
        code_in_support_files={},
        detection_online_model_name=request.model,
        detection_key=settings.OPENAI_API_KEY,
        sanitization_online_model_name=request.model,
        sanitization_key=settings.OPENAI_API_KEY,
        bug_type=request.bug_types,
        analysis_mode="eager",
        neural_sanitize_strategy={
            "functionality_sanitize": settings.NEURAL_SANITIZE_STRATEGY_FUNCTIONALITY,
            "reachability_sanitize": settings.NEURAL_SANITIZE_STRATEGY_REACHABILITY,
        },
        is_measure_token_cost=False
    )
    
    logger.info("analysis complete", bug_count=result["bug_count"], true_bug_count=result["true_bug_count"])
    return AnalyzeResponse(**result)