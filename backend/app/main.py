from fastapi import FastAPI
from app.api.v1.routes.health import router as health
from app.api.v1.routes.analysis import router as analysis
from app.api.v1.routes.fix import router as fix

app = FastAPI(
    title="BuGuard",
    description="LLMSAN-powered bug detection web app",
    version="0.1.0"
)

app.include_router(health, prefix="/api/v1")
app.include_router(analysis, prefix="/api/v1")
app.include_router(fix, prefix="/api/v1")
