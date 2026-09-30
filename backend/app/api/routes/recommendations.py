from fastapi import APIRouter
from app.models.schemas import RecommendationRequest
from app.services.recommendation import get_recommendations

router = APIRouter()


@router.post("/recommendations")
async def recommend_food(request: RecommendationRequest):
    """Get food recommendations based on nutritional deficiencies.

    Analyzes current nutrition intake vs daily targets and recommends
    cheap, nutritious local foods from warteg/kantin.
    Ref: PRD §5.3
    """
    result = get_recommendations(request)
    return {
        "success": True,
        "message": "Rekomendasi berhasil dibuat",
        "data": result.model_dump(),
    }
