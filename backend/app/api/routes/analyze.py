import logging
from fastapi import APIRouter, HTTPException
from app.models.schemas import AnalyzeFoodRequest
from app.services.round_robin import get_load_balancer

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/analyze-food")
async def analyze_food(request: AnalyzeFoodRequest):
    """Analyze food photo or text using round-robin AI providers.

    Accepts a base64-encoded image or text, sends it to an AI provider,
    and returns nutritional analysis.
    Ref: PRD §5.1
    """
    try:
        if not request.image_base64 and not request.text:
            raise HTTPException(status_code=400, detail="Either image_base64 or text must be provided")

        lb = get_load_balancer()
        
        if request.image_base64:
            # Strip data URL prefix if present
            image = request.image_base64
            if "," in image:
                image = image.split(",", 1)[1]
            result = await lb.analyze_food(image_base64=image)
        else:
            result = await lb.analyze_food(text=request.text)

        return {
            "success": True,
            "message": "Analisis makanan berhasil",
            "data": result.model_dump(),
        }
    except RuntimeError as e:
        logger.error(f"All AI providers failed: {e}")
        raise HTTPException(
            status_code=503,
            detail={"success": False, "message": str(e)},
        )
    except Exception as e:
        logger.error(f"Food analysis error: {e}")
        raise HTTPException(
            status_code=500,
            detail={"success": False, "message": f"Gagal menganalisis makanan: {e}"},
        )
