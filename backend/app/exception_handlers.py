from fastapi import Request
from fastapi.exceptions import RequestValidationError
from openai import OpenAIError
from fastapi.responses import JSONResponse
import structlog

logger = structlog.get_logger("flowguard.requests")

async def handle_validation_error(request: Request, exc: RequestValidationError):   
    logger.error("Request validation error", detail=str(exc))
     
    return JSONResponse(
        status_code=422,
        content={"detail": "Invalid request data"},
    )

async def handle_openai_error(request: Request, exc: OpenAIError):
    logger.exception("OpenAI API error", detail=str(exc))

    return JSONResponse(
        status_code=502,
        content={"detail": "Error communicating upstream LLM service"},
    )
    
async def handle_unexpected_error(request: Request, exc: Exception):
    logger.exception("Unhandled error", detail=str(exc))
    
    return JSONResponse(
        status_code=500,
        content={"detail": "An unexpected error occurred. Please try again later."},
    )