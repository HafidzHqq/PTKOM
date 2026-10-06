"""External nutrition API lookup services.

Integrates with Open Food Facts and USDA FoodData Central.
Ref: PRD §13.2 and §13.3
"""

import logging

import httpx

from app.core.config import get_settings
from app.models.schemas import NutritionSearchResult

logger = logging.getLogger(__name__)

OFF_BASE_URL = "https://world.openfoodfacts.org"
USDA_BASE_URL = "https://api.nal.usda.gov/fdc/v1"


async def search_open_food_facts(query: str) -> list[NutritionSearchResult]:
    """Search Open Food Facts for nutrition data.

    Ref: PRD §13.2
    """
    results: list[NutritionSearchResult] = []

    async with httpx.AsyncClient(timeout=10) as client:
        try:
            response = await client.get(
                f"{OFF_BASE_URL}/cgi/search.pl",
                params={
                    "search_terms": query,
                    "search_simple": 1,
                    "action": "process",
                    "json": 1,
                    "page_size": 5,
                },
            )
            response.raise_for_status()
            data = response.json()

            for product in data.get("products", [])[:5]:
                nutriments = product.get("nutriments", {})
                results.append(
                    NutritionSearchResult(
                        name=product.get("product_name", "Unknown"),
                        brand=product.get("brands"),
                        calories=nutriments.get("energy-kcal_100g"),
                        protein_g=nutriments.get("proteins_100g"),
                        fat_g=nutriments.get("fat_100g"),
                        carbs_g=nutriments.get("carbohydrates_100g"),
                        fiber_g=nutriments.get("fiber_100g"),
                        source="openfoodfacts",
                    )
                )
        except httpx.HTTPError as e:
            logger.error(f"Open Food Facts API error: {e}")

    return results


async def search_usda(query: str) -> list[NutritionSearchResult]:
    """Search USDA FoodData Central for nutrition data.

    Ref: PRD §13.3
    """
    settings = get_settings()
    if not settings.USDA_API_KEY:
        logger.warning("USDA_API_KEY not configured, skipping USDA search")
        return []

    results: list[NutritionSearchResult] = []

    async with httpx.AsyncClient(timeout=10) as client:
        try:
            response = await client.get(
                f"{USDA_BASE_URL}/foods/search",
                params={
                    "api_key": settings.USDA_API_KEY,
                    "query": query,
                    "pageSize": 5,
                },
            )
            response.raise_for_status()
            data = response.json()

            for food in data.get("foods", [])[:5]:
                nutrients = {
                    n["nutrientName"]: n.get("value", 0)
                    for n in food.get("foodNutrients", [])
                }
                results.append(
                    NutritionSearchResult(
                        name=food.get("description", "Unknown"),
                        brand=food.get("brandName"),
                        calories=nutrients.get("Energy"),
                        protein_g=nutrients.get("Protein"),
                        fat_g=nutrients.get("Total lipid (fat)"),
                        carbs_g=nutrients.get("Carbohydrate, by difference"),
                        fiber_g=nutrients.get("Fiber, total dietary"),
                        source="usda",
                    )
                )
        except httpx.HTTPError as e:
            logger.error(f"USDA API error: {e}")

    return results


async def search_nutrition(
    query: str, source: str = "all"
) -> list[NutritionSearchResult]:
    """Search for nutrition data from specified source(s)."""
    results: list[NutritionSearchResult] = []

    if source in ("all", "openfoodfacts"):
        results.extend(await search_open_food_facts(query))
    if source in ("all", "usda"):
        results.extend(await search_usda(query))

    return results
