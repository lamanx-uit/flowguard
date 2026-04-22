from fastapi import FastAPI, Request

import sentry_sdk
import structlog

from app.middleware import RequestLoggingMiddleware
from fastapi.middleware.cors import CORSMiddleware

from app.exception_handlers import (
    handle_validation_error,
    handle_openai_error,
    handle_unexpected_error,)
from fastapi.exceptions import RequestValidationError
from openai import OpenAIError

from app.api.v1.routes.health import router as health
from app.api.v1.routes.analysis import router as analysis
from app.api.v1.routes.fix import router as fix
from app.logging_config import setup_logging
from app.config import settings

sentry_sdk.init(
    dsn=settings.SENTRY_DSN,
    send_default_pii=False,
    traces_sample_rate=settings.SENTRY_TRACES_SAMPLE_RATE,
)

setup_logging()

logger = structlog.get_logger("flowguard.app")

app = FastAPI(
    title="Flowguard",
    description="LLMSAN-powered bug detection web app",
    version="0.1.0"
)

@app.on_event("startup")
async def startup():
      logger.info("Flowguard started", version="0.1.0")

app.add_middleware(RequestLoggingMiddleware)
app.add_middleware(CORSMiddleware, 
                   allow_origins=["*"], 
                   allow_methods=["*"], 
                   allow_headers=["*"], 
                   allow_credentials=False,
                   expose_headers=["X-Request-ID"])

app.include_router(health, prefix="/api/v1")
app.include_router(analysis, prefix="/api/v1")
app.include_router(fix, prefix="/api/v1")

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return await handle_validation_error(request, exc)

@app.exception_handler(OpenAIError)
async def openai_exception_handler(request: Request, exc: OpenAIError):
    return await handle_openai_error(request, exc)

@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    return await handle_unexpected_error(request, exc)