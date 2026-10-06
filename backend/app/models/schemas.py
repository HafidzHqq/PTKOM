from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


# ── Enums ──────────────────────────────────────────────────

class Gender(str, Enum):
    male = "male"
    female = "female"


class ActivityLevel(str, Enum):
    sedentary = "sedentary"
    light = "light"
    moderate = "moderate"
    active = "active"


class MealType(str, Enum):
    breakfast = "breakfast"
    lunch = "lunch"
    dinner = "dinner"
    snack = "snack"


# ── Nutrition ──────────────────────────────────────────────

class NutritionInfo(BaseModel):
    calories: float = 0
    protein_g: float = 0
    fat_g: float = 0
    carbs_g: float = 0
    fiber_g: float = 0


class FoodItem(BaseModel):
    name: str
    name_en: str = ""
    portion_grams: float = 0
    confidence: float = 0
    nutrition: NutritionInfo


class FoodAnalysisResult(BaseModel):
    foods: list[FoodItem]
    total_nutrition: NutritionInfo
    health_notes: list[str] = []


# ── Requests ───────────────────────────────────────────────

class AnalyzeFoodRequest(BaseModel):
    image_base64: Optional[str] = Field(None, description="Base64 encoded food image")
    text: Optional[str] = Field(None, description="Text description of the food")


class BMRRequest(BaseModel):
    age: int = Field(..., ge=1, le=150)
    gender: Gender
    weight_kg: float = Field(..., gt=0)
    height_cm: float = Field(..., gt=0)
    activity_level: ActivityLevel


class RecommendationRequest(BaseModel):
    """Current nutrition intake + daily targets for generating recommendations."""
    current_calories: float = 0
    current_protein_g: float = 0
    current_fat_g: float = 0
    current_carbs_g: float = 0
    current_fiber_g: float = 0
    daily_calorie_target: int = 2000
    daily_protein_target: int = 60
    daily_fat_target: int = 65
    daily_carb_target: int = 300
    daily_fiber_target: int = 30
    max_price: Optional[int] = None
    category: Optional[str] = None


# ── Responses ──────────────────────────────────────────────

class BMRResponse(BaseModel):
    bmr: float
    tdee: float
    daily_calorie_target: int
    daily_protein_target: int
    daily_fat_target: int
    daily_carb_target: int
    daily_fiber_target: int


class LocalFood(BaseModel):
    name: str
    category: str
    avg_price_idr: int
    calories: float
    protein_g: float
    fat_g: float
    carbs_g: float
    fiber_g: float
    availability: str
    is_budget_friendly: bool = True


class RecommendationItem(BaseModel):
    food: LocalFood
    reason: str


class RecommendationResponse(BaseModel):
    deficiencies: list[str]
    recommendations: list[RecommendationItem]


class NutritionSearchResult(BaseModel):
    name: str
    brand: Optional[str] = None
    calories: Optional[float] = None
    protein_g: Optional[float] = None
    fat_g: Optional[float] = None
    carbs_g: Optional[float] = None
    fiber_g: Optional[float] = None
    source: str  # "openfoodfacts" or "usda"


class APIResponse(BaseModel):
    """Standard API response wrapper per SOP."""
    success: bool
    message: str
    data: Optional[dict | list] = None
