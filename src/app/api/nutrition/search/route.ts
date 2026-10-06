import { NextRequest, NextResponse } from "next/server";

const OFF_BASE_URL = "https://world.openfoodfacts.org";
const USDA_BASE_URL = "https://api.nal.usda.gov/fdc/v1";

interface NutritionSearchResult {
  name: string;
  brand?: string;
  calories?: number;
  protein_g?: number;
  fat_g?: number;
  carbs_g?: number;
  fiber_g?: number;
  source: string;
}

async function searchOpenFoodFacts(query: string): Promise<NutritionSearchResult[]> {
  try {
    const url = new URL(`${OFF_BASE_URL}/cgi/search.pl`);
    url.searchParams.set("search_terms", query);
    url.searchParams.set("search_simple", "1");
    url.searchParams.set("action", "process");
    url.searchParams.set("json", "1");
    url.searchParams.set("page_size", "5");

    const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const data = await res.json();

    interface OffProduct {
      product_name?: string;
      brands?: string;
      nutriments?: {
        "energy-kcal_100g"?: number;
        proteins_100g?: number;
        fat_100g?: number;
        carbohydrates_100g?: number;
        fiber_100g?: number;
      };
    }

    return (data.products || []).slice(0, 5).map((product: OffProduct) => {
      const nutriments = product.nutriments || {};
      return {
        name: product.product_name || "Unknown",
        brand: product.brands,
        calories: nutriments["energy-kcal_100g"],
        protein_g: nutriments.proteins_100g,
        fat_g: nutriments.fat_100g,
        carbs_g: nutriments.carbohydrates_100g,
        fiber_g: nutriments.fiber_100g,
        source: "openfoodfacts",
      };
    });
  } catch (err) {
    console.error("Open Food Facts search error:", err);
    return [];
  }
}

async function searchUSDA(query: string): Promise<NutritionSearchResult[]> {
  const apiKey = process.env.USDA_API_KEY;
  if (!apiKey) return [];

  try {
    const url = new URL(`${USDA_BASE_URL}/foods/search`);
    url.searchParams.set("api_key", apiKey);
    url.searchParams.set("query", query);
    url.searchParams.set("pageSize", "5");

    const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const data = await res.json();

    interface UsdaFood {
      description?: string;
      brandName?: string;
      foodNutrients?: Array<{ nutrientName?: string; value?: number }>;
    }

    return (data.foods || []).slice(0, 5).map((food: UsdaFood) => {
      const nutrients: Record<string, number> = {};
      (food.foodNutrients || []).forEach((n) => {
        if (n.nutrientName) nutrients[n.nutrientName] = n.value ?? 0;
      });

      return {
        name: food.description || "Unknown",
        brand: food.brandName,
        calories: nutrients["Energy"],
        protein_g: nutrients["Protein"],
        fat_g: nutrients["Total lipid (fat)"],
        carbs_g: nutrients["Carbohydrate, by difference"],
        fiber_g: nutrients["Fiber, total dietary"],
        source: "usda",
      };
    });
  } catch (err) {
    console.error("USDA search error:", err);
    return [];
  }
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get("query");
    const source = searchParams.get("source") || "all";

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: "Query parameter is required" },
        { status: 400 }
      );
    }

    const results: NutritionSearchResult[] = [];

    if (source === "all" || source === "openfoodfacts") {
      const offResults = await searchOpenFoodFacts(query);
      results.push(...offResults);
    }

    if (source === "all" || source === "usda") {
      const usdaResults = await searchUSDA(query);
      results.push(...usdaResults);
    }

    return NextResponse.json({
      success: true,
      message: `Ditemukan ${results.length} hasil untuk '${query}'`,
      data: results,
    });
  } catch (error: unknown) {
    console.error("[GET /api/nutrition/search] Error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mencari data nutrisi" },
      { status: 500 }
    );
  }
}
