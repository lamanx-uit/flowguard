from fastapi import Request
from fastapi.exceptions import RequestValidationError
from openai import OpenAIError
from fastapi.responses import JSONResponse
import structlog

logger = structlog.get_logger("flowguard.requests")

async def requestValidationError(request: Request, exc: RequestValidationError):   
    logger.error("Request validation error", detail=str(exc))
     
    return JSONResponse(
        status_code=422,
        content={"detail": "Invalid request data"},
    )

async def openAIError(request: Request, exc: OpenAIError):
    logger.error("OpenAI API error", detaul=str(exc))

    return JSONResponse(
        status_code=502,
        content={"detail": "Error communicating upstream LLM service"},
    )
    
async def genericExceptionHandler(request: Request, exc: Exception):
    logger.error("Unhandled error", detail=str(exc))
    
    return JSONResponse(
        status_code=500,
        content={"detail": "An unexpected error occurred. Please try again later."},
    )