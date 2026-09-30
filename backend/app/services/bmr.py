"""BMR (Basal Metabolic Rate) & AKG Calculator.

Based on Mifflin-St Jeor equation and AKG Indonesia (PMK No. 28/2019).
Ref: PRD §5.4
"""

from app.models.schemas import BMRRequest, BMRResponse, Gender, ActivityLevel

# AKG Indonesia (PMK No. 28/2019) — reference values
AKG_REFERENCE = {
    Gender.male: {
        "calories": 2650,
        "protein_g": 65,
        "fat_g": 75,
        "carbs_g": 430,
        "fiber_g": 37,
    },
    Gender.female: {
        "calories": 2250,
        "protein_g": 60,
        "fat_g": 65,
        "carbs_g": 360,
        "fiber_g": 32,
    },
}

# Activity factor multipliers
ACTIVITY_FACTORS = {
    ActivityLevel.sedentary: 1.2,
    ActivityLevel.light: 1.375,
    ActivityLevel.moderate: 1.55,
    ActivityLevel.active: 1.725,
}


def calculate_bmr(data: BMRRequest) -> BMRResponse:
    """Calculate BMR using Mifflin-St Jeor equation, then derive daily targets."""

    # Mifflin-St Jeor Equation
    if data.gender == Gender.male:
        bmr = 10 * data.weight_kg + 6.25 * data.height_cm - 5 * data.age + 5
    else:
        bmr = 10 * data.weight_kg + 6.25 * data.height_cm - 5 * data.age - 161

    # TDEE = BMR × Activity Factor
    activity_factor = ACTIVITY_FACTORS[data.activity_level]
    tdee = bmr * activity_factor

    # Macro targets based on TDEE
    # Protein: ~17.5% of calories → /4 cal per gram
    # Fat: ~27.5% of calories → /9 cal per gram
    # Carbs: ~55% of calories → /4 cal per gram
    calorie_target = round(tdee)
    protein_target = round((tdee * 0.175) / 4)
    fat_target = round((tdee * 0.275) / 9)
    carb_target = round((tdee * 0.55) / 4)

    # Fiber target from AKG reference
    akg = AKG_REFERENCE[data.gender]
    fiber_target = akg["fiber_g"]

    return BMRResponse(
        bmr=round(bmr, 1),
        tdee=round(tdee, 1),
        daily_calorie_target=calorie_target,
        daily_protein_target=protein_target,
        daily_fat_target=fat_target,
        daily_carb_target=carb_target,
        daily_fiber_target=fiber_target,
    )
