from fastapi import APIRouter
from app.services.round_robin import get_load_balancer

router = APIRouter()


@router.get("/health")
async def health_check():
    """Health check endpoint."""
    lb = get_load_balancer()
    return {
        "success": True,
        "message": "Dompet Gizi API is running",
        "data": {
            "status": "healthy",
            "ai_providers": lb.get_status(),
        },
    }
