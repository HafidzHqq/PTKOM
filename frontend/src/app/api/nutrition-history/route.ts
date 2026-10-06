import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const foodSchema = z.object({
  name: z.string().min(1),
  name_en: z.string().optional(),
  portion_grams: z.number().nonnegative(),
  nutrition: z.object({
    calories: z.number().nonnegative(),
    protein_g: z.number().nonnegative(),
    fat_g: z.number().nonnegative(),
    carbs_g: z.number().nonnegative(),
    fiber_g: z.number().nonnegative(),
  }),
});

const historySchema = z.object({
  foods: z.array(foodSchema),
  total_nutrition: z.object({
    calories: z.number().nonnegative(),
    protein_g: z.number().nonnegative(),
    fat_g: z.number().nonnegative(),
    carbs_g: z.number().nonnegative(),
    fiber_g: z.number().nonnegative(),
  }),
  health_notes: z.array(z.string()).default([]),
  metadata: z
    .object({
      provider: z.string(),
      model: z.string(),
      usage: z
        .object({
          promptTokens: z.number(),
          completionTokens: z.number(),
          totalTokens: z.number(),
        })
        .optional(),
    })
    .optional(),
});

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from("nutrition_history")
    .select(
      "id, foods, analysis_result, calories, protein_g, fat_g, carbs_g, fiber_g, logged_at",
    )
    .eq("user_id", user.id)
    .gte("logged_at", since)
    .order("logged_at", { ascending: false })
    .limit(100);

  if (error) {
    console.error("[GET /api/nutrition-history] Error:", error);
    return NextResponse.json(
      { error: "Gagal memuat riwayat gizi" },
      { status: 500 },
    );
  }

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON tidak valid" }, { status: 400 });
  }

  const parsed = historySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Format data gizi tidak valid" },
      { status: 400 },
    );
  }

  const { data: nutrition } = parsed;
  const { data, error } = await supabase
    .from("nutrition_history")
    .insert({
      user_id: user.id,
      foods: nutrition.foods,
      analysis_result: nutrition,
      ...nutrition.total_nutrition,
    })
    .select(
      "id, foods, analysis_result, calories, protein_g, fat_g, carbs_g, fiber_g, logged_at",
    )
    .single();

  if (error) {
    console.error("[POST /api/nutrition-history] Error:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan riwayat gizi" },
      { status: 500 },
    );
  }

  return NextResponse.json(data, { status: 201 });
}