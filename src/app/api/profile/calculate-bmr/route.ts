import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const bmrRequestSchema = z.object({
  gender: z.enum(["male", "female"]),
  age: z.number().min(1).max(120),
  weight_kg: z.number().min(20).max(300),
  height_cm: z.number().min(100).max(250),
  activity_level: z.enum(["sedentary", "light", "moderate", "active"]),
});

const AKG_REFERENCE = {
  male: {
    calories: 2650,
    protein_g: 65,
    fat_g: 75,
    carbs_g: 430,
    fiber_g: 37,
  },
  female: {
    calories: 2250,
    protein_g: 60,
    fat_g: 65,
    carbs_g: 360,
    fiber_g: 32,
  },
};

const ACTIVITY_FACTORS = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = bmrRequestSchema.parse(body);

    let bmr = 0;
    if (data.gender === "male") {
      bmr = 10 * data.weight_kg + 6.25 * data.height_cm - 5 * data.age + 5;
    } else {
      bmr = 10 * data.weight_kg + 6.25 * data.height_cm - 5 * data.age - 161;
    }

    const activityFactor = ACTIVITY_FACTORS[data.activity_level];
    const tdee = bmr * activityFactor;

    const calorieTarget = Math.round(tdee);
    const proteinTarget = Math.round((tdee * 0.175) / 4);
    const fatTarget = Math.round((tdee * 0.275) / 9);
    const carbTarget = Math.round((tdee * 0.55) / 4);

    const akg = AKG_REFERENCE[data.gender];
    const fiberTarget = akg.fiber_g;

    const result = {
      bmr: Math.round(bmr * 10) / 10,
      tdee: Math.round(tdee * 10) / 10,
      daily_calorie_target: calorieTarget,
      daily_protein_target: proteinTarget,
      daily_fat_target: fatTarget,
      daily_carb_target: carbTarget,
      daily_fiber_target: fiberTarget,
    };

    return NextResponse.json({
      success: true,
      message: "Kalkulasi BMR berhasil",
      data: result,
    });
  } catch (error: unknown) {
    console.error("[POST /api/profile/calculate-bmr] Error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengkalkulasi BMR" },
      { status: 400 }
    );
  }
}
