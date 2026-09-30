from typing import Optional
from fastapi import APIRouter, Query
from app.data.seed_foods import LOCAL_FOODS

router = APIRouter()


@router.get("/local-foods")
async def list_local_foods(
    category: Optional[str] = Query(None, description="Filter: lauk, sayur, pokok, snack, paket"),
    max_price: Optional[int] = Query(None, description="Max price in IDR"),
    availability: Optional[str] = Query(None, description="Filter: warteg, kantin, minimarket, masak_sendiri"),
):
    """List local budget-friendly foods with optional filters.

    Returns seed data of common Indonesian foods found at warteg/kantin.
    Ref: PRD §12
    """
    results = LOCAL_FOODS

    if category:
        results = [f for f in results if f["category"] == category]
    if max_price:
        results = [f for f in results if f["avg_price_idr"] <= max_price]
    if availability:
        results = [f for f in results if f["availability"] == availability]

    return {
        "success": True,
        "message": "Data makanan lokal berhasil dimuat",
        "data": results,
    }
