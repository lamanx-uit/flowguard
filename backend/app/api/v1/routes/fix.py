from fastapi import APIRouter
from app.schemas.fix import SanitizeRequest, SanitizeResponse
from app.core.pipeline import fix_code_pipeline
from app.config import settings

router = APIRouter(tags=["Fix"])

@router.post("/fix", response_model=SanitizeResponse)
async def fix(request: SanitizeRequest):
    result = fix_code_pipeline(
        source_code=request.code,
        bug_report=[bug.model_dump() for bug in request.bug],
        fix_code_key=settings.OPENAI_API_KEY,
        model_name=request.model
    )
    
    return SanitizeResponse(**result)