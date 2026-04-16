from fastapi import APIRouter

router = APIRouter(tags=["Health"])

@router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "Flowguard",      
        "version": "0.1.0",
        "python_support": True  
    }