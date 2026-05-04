from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse
from app.schemas.analysis import AnalyzeRequest
from app.config import settings
from app.core.pipeline import stream_llmsan
import asyncio
import json
import time
import structlog
import sentry_sdk

logger = structlog.get_logger("flowguard.analysis")

router = APIRouter(tags=["Analyze"])

@router.post("/analyze")
async def analysis(http_request: Request, request: AnalyzeRequest):
    request_id = getattr(http_request.state, "request_id", None)
    bound_logger = logger.bind(request_id=request_id)

    async def generate_async():
        start = time.perf_counter()
        bound_logger.info("analysis started", bug_type=request.bug_type, model=request.model)

        loop = asyncio.get_event_loop()
        queue: asyncio.Queue = asyncio.Queue()

        def run_sync():
            try:
                for event in stream_llmsan(
                    source_code=request.code,
                    file_name=request.language + "_file",
                    code_in_support_files={},
                    detection_online_model_name=request.model,
                    detection_key=settings.OPENAI_API_KEY or "",
                    sanitization_online_model_name=request.model,
                    sanitization_key=settings.OPENAI_API_KEY or "",
                    bug_type=request.bug_type,
                    analysis_mode="eager",
                    neural_sanitize_strategy={
                        "functionality_sanitize": settings.NEURAL_SANITIZE_STRATEGY_FUNCTIONALITY,
                        "reachability_sanitize": settings.NEURAL_SANITIZE_STRATEGY_REACHABILITY,
                    },
                    is_measure_token_cost=False
                ):
                    loop.call_soon_threadsafe(queue.put_nowait, event)
            except Exception as e:
                loop.call_soon_threadsafe(queue.put_nowait, e)
            finally:
                loop.call_soon_threadsafe(queue.put_nowait, None)

        asyncio.ensure_future(loop.run_in_executor(None, run_sync))

        last_event = None
        try:
            while True:
                item = await queue.get()
                if item is None:
                    break
                if isinstance(item, Exception):
                    raise item
                last_event = item
                yield item

            completed = json.loads(last_event) if last_event else {}
            bound_logger.info("analysis complete",
                              bug_count=completed.get("bug_count", 0),
                              true_bug_count=completed.get("true_bug_count", 0),
                              duration_ms=(time.perf_counter() - start) * 1000)
        except Exception as e:
            sentry_sdk.capture_exception(e)
            bound_logger.error("analysis failed", error=str(e),
                               duration_ms=(time.perf_counter() - start) * 1000)
            yield json.dumps({"stage": "error", "detail": "Internal server error"}) + "\n"

    return StreamingResponse(generate_async(), media_type="application/x-ndjson")