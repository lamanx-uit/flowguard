import time
import uuid
import structlog

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware

logger = structlog.get_logger("flowguard.requests")    

class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        client_request_id = request.headers.get("X-Request-ID")
        
        try:
            request_id = (
                str(uuid.UUID(client_request_id)) if client_request_id else str(uuid.uuid4())
            )
        except ValueError:                                                
            request_id = str(uuid.uuid4())
            
        request.state.request_id = request_id
        
        structlog.contextvars.bind_contextvars(request_id=request_id)

        start = time.perf_counter()
        
        try:
            response = await call_next(request)
        except Exception:
            duration_ms = (time.perf_counter() - start) * 1000
            logger.exception(
                "request failed",
                request_id=request_id,
                method=request.method,
                path=request.url.path,
                duration_ms=duration_ms,
            )
            structlog.contextvars.clear_contextvars()
            raise

        
        duration_ms = (time.perf_counter() - start) * 1000
        response.headers["X-Request-ID"] = request_id
        
        logger.info(
            "request completed",
            request_id=request_id,
            method=request.method,
            path=request.url.path,
            status_code=response.status_code,
            duration_ms=duration_ms,
        )
        
        structlog.contextvars.clear_contextvars()
                
        return response