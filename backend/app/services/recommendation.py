"""Food recommendation engine.

Recommends cheap & nutritious local foods based on nutritional deficiencies.
Ref: PRD §5.3
"""

from app.models.schemas import (
    RecommendationRequest,
    RecommendationResponse,
    RecommendationItem,
    LocalFood,
)
from app.data.seed_foods import LOCAL_FOODS


def get_recommendations(req: RecommendationRequest) -> RecommendationResponse:
    """Generate food recommendations based on current nutritional deficiencies."""

    # 1. Identify deficiencies
    deficiencies: list[str] = []
    deficit_map: dict[str, float] = {}

    cal_pct = (req.current_calories / req.daily_calorie_target * 100) if req.daily_calorie_target else 100
    pro_pct = (req.current_protein_g / req.daily_protein_target * 100) if req.daily_protein_target else 100
    fat_pct = (req.current_fat_g / req.daily_fat_target * 100) if req.daily_fat_target else 100
    carb_pct = (req.current_carbs_g / req.daily_carb_target * 100) if req.daily_carb_target else 100
    fiber_pct = (req.current_fiber_g / req.daily_fiber_target * 100) if req.daily_fiber_target else 100

    threshold = 70  # Below 70% = deficient

    if pro_pct < threshold:
        deficiencies.append(f"Protein rendah ({pro_pct:.0f}% AKG)")
        deficit_map["protein_g"] = req.daily_protein_target - req.current_protein_g
    if fiber_pct < threshold:
        deficiencies.append(f"Serat rendah ({fiber_pct:.0f}% AKG)")
        deficit_map["fiber_g"] = req.daily_fiber_target - req.current_fiber_g
    if cal_pct < threshold:
        deficiencies.append(f"Kalori rendah ({cal_pct:.0f}% AKG)")
        deficit_map["calories"] = req.daily_calorie_target - req.current_calories
    if carb_pct < threshold:
        deficiencies.append(f"Karbohidrat rendah ({carb_pct:.0f}% AKG)")
        deficit_map["carbs_g"] = req.daily_carb_target - req.current_carbs_g
    if fat_pct < threshold:
        deficiencies.append(f"Lemak rendah ({fat_pct:.0f}% AKG)")
        deficit_map["fat_g"] = req.daily_fat_target - req.current_fat_g

    # 2. Score & rank local foods
    scored_foods: list[tuple[float, dict, str]] = []

    for food in LOCAL_FOODS:
        # Apply filters
        if req.max_price and food["avg_price_idr"] > req.max_price:
            continue
        if req.category and food["category"] != req.category:
            continue

        score = 0.0
        reasons: list[str] = []

        # Score based on deficiencies
        if "protein_g" in deficit_map and food["protein_g"] >= 10:
            score += food["protein_g"] * 2
            reasons.append(f"Tinggi protein ({food['protein_g']}g)")
        if "fiber_g" in deficit_map and food["fiber_g"] >= 2:
            score += food["fiber_g"] * 3
            reasons.append(f"Sumber serat ({food['fiber_g']}g)")
        if "calories" in deficit_map:
            score += food["calories"] / 100
        if "carbs_g" in deficit_map:
            score += food["carbs_g"] / 10
        if "fat_g" in deficit_map:
            score += food["fat_g"] / 10

        # Bonus for budget-friendly
        if food["avg_price_idr"] <= 5000:
            score += 5
            reasons.append(f"Murah (Rp {food['avg_price_idr']:,})")
        elif food["avg_price_idr"] <= 10000:
            score += 2
            reasons.append(f"Terjangkau (Rp {food['avg_price_idr']:,})")

        # If no specific deficiency, recommend balanced foods
        if not deficit_map:
            score = food["protein_g"] + food["fiber_g"] - (food["avg_price_idr"] / 5000)
            reasons = ["Makanan bergizi seimbang"]

        reason_str = "; ".join(reasons) if reasons else "Rekomendasi umum"
        scored_foods.append((score, food, reason_str))

    # 3. Sort by score descending and take top 5
    scored_foods.sort(key=lambda x: x[0], reverse=True)
    top_foods = scored_foods[:5]

    recommendations = [
        RecommendationItem(
            food=LocalFood(**food_data),
            reason=reason,
        )
        for _, food_data, reason in top_foods
    ]

    if not deficiencies:
        deficiencies = ["Asupan gizi cukup baik! Berikut rekomendasi makanan bergizi."]

    return RecommendationResponse(
        deficiencies=deficiencies,
        recommendations=recommendations,
    )
