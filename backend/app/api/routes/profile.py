from fastapi import APIRouter
from app.models.schemas import BMRRequest
from app.services.bmr import calculate_bmr

router = APIRouter()


@router.post("/profile/calculate-bmr")
async def calculate_user_bmr(request: BMRRequest):
    """Calculate BMR and daily nutrition targets.

    Uses Mifflin-St Jeor equation with activity factor.
    References AKG Indonesia (PMK No. 28/2019).
    Ref: PRD §5.4
    """
    result = calculate_bmr(request)
    return {
        "success": True,
        "message": "Kalkulasi BMR berhasil",
        "data": result.model_dump(),
    }
