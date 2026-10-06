import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const requestSchema = z.object({
  day_start: z.string().datetime(),
  day_end: z.string().datetime(),
});

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

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Rentang tanggal tidak valid" },
      { status: 400 },
    );
  }

  const dayStart = new Date(parsed.data.day_start);
  const dayEnd = new Date(parsed.data.day_end);
  const dayDuration = dayEnd.getTime() - dayStart.getTime();
  if (dayDuration <= 0 || dayDuration > 28 * 60 * 60 * 1000) {
    return NextResponse.json(
      { error: "Rentang tanggal harus satu hari" },
      { status: 400 },
    );
  }

  const { data: entries, error: historyError } = await supabase
    .from("nutrition_history")
    .select("calories, protein_g, fat_g, carbs_g, fiber_g")
    .eq("user_id", user.id)
    .gte("logged_at", dayStart.toISOString())
    .lt("logged_at", dayEnd.toISOString());

  if (historyError) {
    console.error("[POST /api/recommendations] History error:", historyError);
    return NextResponse.json(
      { error: "Gagal memuat asupan gizi hari ini" },
      { status: 500 },
    );
  }

  const currentNutrition = (entries || []).reduce(
    (total, entry) => ({
      current_calories: total.current_calories + Number(entry.calories),
      current_protein_g: total.current_protein_g + Number(entry.protein_g),
      current_fat_g: total.current_fat_g + Number(entry.fat_g),
      current_carbs_g: total.current_carbs_g + Number(entry.carbs_g),
      current_fiber_g: total.current_fiber_g + Number(entry.fiber_g),
    }),
    {
      current_calories: 0,
      current_protein_g: 0,
      current_fat_g: 0,
      current_carbs_g: 0,
      current_fiber_g: 0,
    },
  );

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
  let backendResponse: Response;
  try {
    backendResponse = await fetch(`${backendUrl}/api/recommendations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...currentNutrition,
        daily_calorie_target: 2000,
        daily_protein_target: 60,
        daily_fat_target: 65,
        daily_carb_target: 300,
        daily_fiber_target: 30,
      }),
      cache: "no-store",
    });
  } catch (error) {
    console.error("[POST /api/recommendations] Backend unavailable:", error);
    return NextResponse.json(
      { error: "Layanan rekomendasi tidak dapat dihubungi" },
      { status: 502 },
    );
  }

  const responseData = await backendResponse.json().catch(() => null);
  if (!backendResponse.ok || !responseData?.data) {
    return NextResponse.json(
      { error: responseData?.detail || "Gagal membuat rekomendasi" },
      { status: 502 },
    );
  }

  return NextResponse.json({
    ...responseData.data,
    current_nutrition: currentNutrition,
  });
}