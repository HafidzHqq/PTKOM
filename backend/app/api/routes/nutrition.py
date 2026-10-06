import logging
from fastapi import APIRouter, Query, HTTPException
from app.services.nutrition import search_nutrition

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/nutrition/search")
async def search_nutrition_data(
    query: str = Query(..., min_length=1, description="Food name to search"),
    source: str = Query("all", description="Data source: all, openfoodfacts, usda"),
):
    """Search nutrition data from external APIs.

    Sources:
    - Open Food Facts (free, no auth) — PRD §13.2
    - USDA FoodData Central (free API key) — PRD §13.3
    """
    if source not in ("all", "openfoodfacts", "usda"):
        raise HTTPException(
            status_code=400,
            detail={"success": False, "message": "Source must be: all, openfoodfacts, or usda"},
        )

    try:
        results = await search_nutrition(query, source)
        return {
            "success": True,
            "message": f"Ditemukan {len(results)} hasil untuk '{query}'",
            "data": [r.model_dump() for r in results],
        }
    except Exception as e:
        logger.error(f"Nutrition search error: {e}")
        raise HTTPException(
            status_code=500,
            detail={"success": False, "message": f"Gagal mencari data nutrisi: {e}"},
        )
