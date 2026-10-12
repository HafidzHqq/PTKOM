import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const category = searchParams.get("category");
    const maxPrice = searchParams.get("max_price");
    const availability = searchParams.get("availability");

    const where: any = {};

    if (category) {
      where.category = category;
    }
    if (maxPrice) {
      const maxPriceNum = parseInt(maxPrice, 10);
      if (!isNaN(maxPriceNum)) {
        where.avgPriceIdr = { lte: maxPriceNum };
      }
    }
    if (availability) {
      where.availability = availability;
    }

    const rows = await prisma.localFood.findMany({
      where,
      orderBy: { id: "asc" },
    });

    const results = rows.map((f) => ({
      name: f.name,
      category: f.category,
      avg_price_idr: f.avgPriceIdr,
      calories: f.calories,
      protein_g: f.proteinG,
      fat_g: f.fatG,
      carbs_g: f.carbsG,
      fiber_g: f.fiberG,
      availability: f.availability,
      is_budget_friendly: f.isBudgetFriendly,
    }));

    return NextResponse.json({
      success: true,
      message: "Data makanan lokal berhasil dimuat dari database",
      data: results,
    });
  } catch (error: unknown) {
    console.error("[GET /api/local-foods] Error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memuat data makanan lokal" },
      { status: 500 }
    );
  }
}
