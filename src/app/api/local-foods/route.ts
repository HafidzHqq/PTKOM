import { NextRequest, NextResponse } from "next/server";
import { LOCAL_FOODS } from "@/lib/data/localFoods";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const category = searchParams.get("category");
    const maxPrice = searchParams.get("max_price");
    const availability = searchParams.get("availability");

    let results = LOCAL_FOODS;

    if (category) {
      results = results.filter((f) => f.category === category);
    }
    if (maxPrice) {
      const maxPriceNum = parseInt(maxPrice, 10);
      if (!isNaN(maxPriceNum)) {
        results = results.filter((f) => f.avg_price_idr <= maxPriceNum);
      }
    }
    if (availability) {
      results = results.filter((f) => f.availability === availability);
    }

    return NextResponse.json({
      success: true,
      message: "Data makanan lokal berhasil dimuat",
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
