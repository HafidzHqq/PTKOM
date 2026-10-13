import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const bmrRequestSchema = z.object({
  gender: z.enum(["male", "female"]),
  age: z.number().int().min(1, "Umur minimal 1").max(120, "Umur maksimal 120"),
  weight_kg: z.number().min(20, "Berat minimal 20 kg").max(300, "Berat maksimal 300 kg"),
  height_cm: z.number().min(100, "Tinggi minimal 100 cm").max(250, "Tinggi maksimal 250 cm"),
  activity_level: z.enum(["sedentary", "light", "moderate", "active"]),
  save_to_profile: z.boolean().optional().default(true),
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

    if (data.save_to_profile) {
      try {
        const session = await getServerSession(authOptions);
        const userId = Number(session?.user?.id ?? 1);
        await prisma.user.upsert({
          where: { id: userId },
          update: {
            gender: data.gender,
            age: data.age,
            weightKg: data.weight_kg,
            heightCm: data.height_cm,
            activityLevel: data.activity_level,
            dailyCalorieTarget: result.daily_calorie_target,
            dailyProteinTarget: result.daily_protein_target,
            dailyFatTarget: result.daily_fat_target,
            dailyCarbTarget: result.daily_carb_target,
            dailyFiberTarget: result.daily_fiber_target,
            bmr: result.bmr,
            tdee: result.tdee,
            profileUpdatedAt: new Date(),
          },
          create: {
            id: userId,
            name: "Teman Kost",
            gender: data.gender,
            age: data.age,
            weightKg: data.weight_kg,
            heightCm: data.height_cm,
            activityLevel: data.activity_level,
            dailyCalorieTarget: result.daily_calorie_target,
            dailyProteinTarget: result.daily_protein_target,
            dailyFatTarget: result.daily_fat_target,
            dailyCarbTarget: result.daily_carb_target,
            dailyFiberTarget: result.daily_fiber_target,
            bmr: result.bmr,
            tdee: result.tdee,
            profileUpdatedAt: new Date(),
          },
        });
      } catch (dbErr) {
        console.error("[POST /api/profile/calculate-bmr] DB Save Error:", dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Kalkulasi BMR berhasil disimpan",
      data: result,
    });
  } catch (error: any) {
    console.error("[POST /api/profile/calculate-bmr] Error:", error);
    if (error?.name === "ZodError") {
      return NextResponse.json(
        {
          success: false,
          message: "Data input tidak valid",
          errors: error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { success: false, message: "Gagal mengkalkulasi BMR" },
      { status: 400 },
    );
  }
}
