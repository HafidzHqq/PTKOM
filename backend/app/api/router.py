"""Central API router that aggregates all route modules."""

from fastapi import APIRouter
from app.api.routes import health, analyze, recommendations, profile, local_foods, nutrition

api_router = APIRouter(prefix="/api")

api_router.include_router(health.router, tags=["Health"])
api_router.include_router(analyze.router, tags=["Food Analysis"])
api_router.include_router(recommendations.router, tags=["Recommendations"])
api_router.include_router(profile.router, tags=["Profile"])
api_router.include_router(local_foods.router, tags=["Local Foods"])
api_router.include_router(nutrition.router, tags=["Nutrition Lookup"])
