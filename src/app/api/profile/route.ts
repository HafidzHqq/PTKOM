import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const profileUpdateSchema = z.object({
  gender: z.enum(["male", "female"]),
  age: z.number().int().min(1, "Umur minimal 1").max(120, "Umur maksimal 120"),
  weight_kg: z.number().min(20, "Berat minimal 20 kg").max(300, "Berat maksimal 300 kg"),
  height_cm: z.number().min(100, "Tinggi minimal 100 cm").max(250, "Tinggi maksimal 250 cm"),
  activity_level: z.enum(["sedentary", "light", "moderate", "active"]),
  monthly_food_budget: z.number().int().min(0).optional(),
  // BMR results (calculated client-side or server-side)
  daily_calorie_target: z.number().int().min(0).optional(),
  daily_protein_target: z.number().int().min(0).optional(),
  daily_fat_target: z.number().int().min(0).optional(),
  daily_carb_target: z.number().int().min(0).optional(),
  daily_fiber_target: z.number().int().min(0).optional(),
  bmr: z.number().min(0).optional(),
  tdee: z.number().min(0).optional(),
});

function formatUser(u: any) {
  if (!u) return null;
  return {
    id: u.id,
    email: u.email || "guest@gizikost.local",
    name: u.name || "Teman Kost",
    image: u.image || null,
    gender: u.gender || "male",
    age: u.age ?? 20,
    weight_kg: u.weightKg ?? 60,
    height_cm: u.heightCm ?? 170,
    activity_level: u.activityLevel || "light",
    daily_calorie_target: u.dailyCalorieTarget ?? 2250,
    daily_protein_target: u.dailyProteinTarget ?? 84,
    daily_fat_target: u.dailyFatTarget ?? 62,
    daily_carb_target: u.dailyCarbTarget ?? 337,
    daily_fiber_target: u.dailyFiberTarget ?? 25,
    bmr: u.bmr ?? 1540,
    tdee: u.tdee ?? 2117.5,
    monthly_food_budget: u.monthlyFoodBudget ?? 900000,
    profile_updated_at: u.profileUpdatedAt || null,
  };
}

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({
      success: true,
      data: {
        id: null,
        email: null,
        name: "Teman Kost",
        gender: "male",
        age: 20,
        weight_kg: 60,
        height_cm: 170,
        activity_level: "light",
        daily_calorie_target: 2250,
        daily_protein_target: 84,
        daily_fat_target: 62,
        daily_carb_target: 337,
        daily_fiber_target: 25,
        bmr: 1540,
        tdee: 2117.5,
        monthly_food_budget: 200000,
        profile_updated_at: null,
      },
    });
  }
  
  let userId = Number(session?.user?.id);
  if (!userId || isNaN(userId) || userId <= 0 || userId > 2147483647) {
    if (session?.user?.email) {
      try {
        const dbUser = await prisma.user.findUnique({
          where: { email: session.user.email },
          select: { id: true },
        });
        if (dbUser) userId = dbUser.id;
      } catch (e) {
        console.error("[GET /api/profile] dbUser lookup error:", e);
      }
    }
  }

  try {
    let user = userId
      ? await prisma.user.findUnique({
          where: { id: userId },
        })
      : null;

    if (!user && session?.user?.email) {
      user = await prisma.user.findUnique({
        where: { email: session.user.email },
      });
    }

    if (!user) {
      return NextResponse.json({
        success: true,
        data: {
          id: null,
          email: session?.user?.email || null,
          name: session?.user?.name || "Teman Kost",
          gender: "male",
          age: 20,
          weight_kg: 60,
          height_cm: 170,
          activity_level: "light",
          daily_calorie_target: 2250,
          daily_protein_target: 84,
          daily_fat_target: 62,
          daily_carb_target: 337,
          daily_fiber_target: 25,
          bmr: 1540,
          tdee: 2117.5,
          monthly_food_budget: 200000,
          profile_updated_at: null,
        },
      });
    }

    return NextResponse.json({ success: true, data: formatUser(user) });
  } catch (error) {
    console.error("[GET /api/profile] Error:", error);
    return NextResponse.json({
      success: true,
      data: {
        id: 1,
        email: session?.user?.email || "guest@gizikost.local",
        name: session?.user?.name || "Teman Kost",
        gender: "male",
        age: 20,
        weight_kg: 60,
        height_cm: 170,
        activity_level: "light",
        daily_calorie_target: 2250,
        daily_protein_target: 84,
        daily_fat_target: 62,
        daily_carb_target: 337,
        daily_fiber_target: 25,
        bmr: 1540,
        tdee: 2117.5,
        monthly_food_budget: 900000,
        profile_updated_at: null,
      },
    });
  }
}

export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  let userId = Number(session?.user?.id);
  if (!userId || isNaN(userId) || userId <= 0 || userId > 2147483647) {
    if (session?.user?.email) {
      try {
        const dbUser = await prisma.user.findUnique({
          where: { email: session.user.email },
          select: { id: true },
        });
        if (dbUser) userId = dbUser.id;
      } catch (e) {
        console.error("[PUT /api/profile] dbUser lookup error:", e);
      }
    }
  }

  if (!userId || isNaN(userId) || userId <= 0 || userId > 2147483647) {
    userId = 1;
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON tidak valid" }, { status: 400 });
  }

  const parsed = profileUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Data profil tidak valid",
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 422 },
    );
  }

  const d = parsed.data;

  try {
    const updated = await prisma.user.upsert({
      where: { id: userId },
      update: {
        gender: d.gender,
        age: d.age,
        weightKg: d.weight_kg,
        heightCm: d.height_cm,
        activityLevel: d.activity_level,
        ...(d.monthly_food_budget !== undefined ? { monthlyFoodBudget: d.monthly_food_budget } : {}),
        ...(d.daily_calorie_target !== undefined ? { dailyCalorieTarget: d.daily_calorie_target } : {}),
        ...(d.daily_protein_target !== undefined ? { dailyProteinTarget: d.daily_protein_target } : {}),
        ...(d.daily_fat_target !== undefined ? { dailyFatTarget: d.daily_fat_target } : {}),
        ...(d.daily_carb_target !== undefined ? { dailyCarbTarget: d.daily_carb_target } : {}),
        ...(d.daily_fiber_target !== undefined ? { dailyFiberTarget: d.daily_fiber_target } : {}),
        ...(d.bmr !== undefined ? { bmr: d.bmr } : {}),
        ...(d.tdee !== undefined ? { tdee: d.tdee } : {}),
        profileUpdatedAt: new Date(),
      },
      create: {
        email: session?.user?.email || "guest@gizikost.local",
        name: session?.user?.name || "Teman Kost",
        gender: d.gender,
        age: d.age,
        weightKg: d.weight_kg,
        heightCm: d.height_cm,
        activityLevel: d.activity_level,
        monthlyFoodBudget: d.monthly_food_budget ?? 900000,
        dailyCalorieTarget: d.daily_calorie_target ?? 2250,
        dailyProteinTarget: d.daily_protein_target ?? 84,
        dailyFatTarget: d.daily_fat_target ?? 62,
        dailyCarbTarget: d.daily_carb_target ?? 337,
        dailyFiberTarget: d.daily_fiber_target ?? 25,
        bmr: d.bmr,
        tdee: d.tdee,
        profileUpdatedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, data: formatUser(updated) });
  } catch (error) {
    console.error("[PUT /api/profile] Error:", error);
    return NextResponse.json({ error: "Gagal menyimpan profil" }, { status: 500 });
  }
}
