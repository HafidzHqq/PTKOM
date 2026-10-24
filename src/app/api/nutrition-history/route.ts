import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const foodSchema = z.object({
  name: z.string().min(1),
  name_en: z.string().nullish(),
  portion_grams: z.coerce.number().nonnegative().catch(0),
  nutrition: z.object({
    calories: z.coerce.number().nonnegative().catch(0),
    protein_g: z.coerce.number().nonnegative().catch(0),
    fat_g: z.coerce.number().nonnegative().catch(0),
    carbs_g: z.coerce.number().nonnegative().catch(0),
    fiber_g: z.coerce.number().nonnegative().catch(0),
  }).catch({ calories: 0, protein_g: 0, fat_g: 0, carbs_g: 0, fiber_g: 0 }),
});

const historySchema = z.object({
  foods: z.array(foodSchema).catch([]),
  total_nutrition: z.object({
    calories: z.coerce.number().nonnegative().catch(0),
    protein_g: z.coerce.number().nonnegative().catch(0),
    fat_g: z.coerce.number().nonnegative().catch(0),
    carbs_g: z.coerce.number().nonnegative().catch(0),
    fiber_g: z.coerce.number().nonnegative().catch(0),
  }).catch({ calories: 0, protein_g: 0, fat_g: 0, carbs_g: 0, fiber_g: 0 }),
  logged_at: z.string().optional(),
});

export async function GET(request: NextRequest) {
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
        console.error("[GET /api/nutrition-history] dbUser lookup error:", e);
      }
    }
  }

  // Jika tidak login / belum terotentikasi, jangan kembalikan catatan user lain
  if (!userId || isNaN(userId) || userId <= 0 || userId > 2147483647) {
    return NextResponse.json([]);
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const daysParam = searchParams.get("days");
    const limitParam = searchParams.get("limit");

    const where: { userId: number; loggedAt?: { gte: Date } } = { userId };

    if (daysParam) {
      const days = parseInt(daysParam, 10);
      if (!isNaN(days) && days > 0) {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);
        where.loggedAt = { gte: cutoff };
      }
    }

    const takeLimit = limitParam ? parseInt(limitParam, 10) : 200;
    const take = !isNaN(takeLimit) && takeLimit > 0 ? takeLimit : 200;

    const rows = await prisma.nutritionHistory.findMany({
      where,
      orderBy: {
        loggedAt: "desc",
      },
      take,
    });

    const data = rows.map((row) => ({
      id: row.id,
      user_id: row.userId,
      foods: typeof row.foods === "string" ? JSON.parse(row.foods) : row.foods,
      calories: row.calories,
      protein_g: row.proteinG,
      fat_g: row.fatG,
      carbs_g: row.carbsG,
      fiber_g: row.fiberG,
      logged_at: row.loggedAt.toISOString(),
    }));

    return NextResponse.json(data);
  } catch (error) {
    console.error("[GET /api/nutrition-history] Error:", error);
    // Kembalikan array kosong agar halaman riwayat dan dashboard tidak crash / error merah
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
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
        console.error("[POST /api/nutrition-history] dbUser lookup error:", e);
      }
    }
  }

  // Jika tidak login, jangan simpan diari ke database
  if (!userId || isNaN(userId) || userId <= 0 || userId > 2147483647) {
    return NextResponse.json(
      { error: "Silakan login terlebih dahulu untuk menyimpan catatan diari." },
      { status: 401 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON tidak valid" }, { status: 400 });
  }

  const parsed = historySchema.safeParse(body);
  if (!parsed.success) {
    console.error("[POST /api/nutrition-history] Validation error:", parsed.error.format());
    return NextResponse.json(
      { error: "Format data gizi tidak valid", details: parsed.error.format() },
      { status: 400 },
    );
  }

  const { data: nutrition } = parsed;

  try {
    const loggedAtDate = nutrition.logged_at ? new Date(nutrition.logged_at) : new Date();

    const row = await prisma.nutritionHistory.create({
      data: {
        userId,
        foods: JSON.stringify(nutrition.foods),
        calories: nutrition.total_nutrition.calories,
        proteinG: nutrition.total_nutrition.protein_g,
        fatG: nutrition.total_nutrition.fat_g,
        carbsG: nutrition.total_nutrition.carbs_g,
        fiberG: nutrition.total_nutrition.fiber_g,
        loggedAt: isNaN(loggedAtDate.getTime()) ? new Date() : loggedAtDate,
      },
    });

    const data = {
      id: row.id,
      user_id: row.userId,
      foods: typeof row.foods === "string" ? JSON.parse(row.foods) : row.foods,
      calories: row.calories,
      protein_g: row.proteinG,
      fat_g: row.fatG,
      carbs_g: row.carbsG,
      fiber_g: row.fiberG,
      logged_at: row.loggedAt.toISOString(),
    };

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("[POST /api/nutrition-history] Error:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan riwayat gizi" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
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
        console.error("[DELETE /api/nutrition-history] dbUser lookup error:", e);
      }
    }
  }

  // Jika tidak login, tolak penghapusan diari
  if (!userId || isNaN(userId) || userId <= 0 || userId > 2147483647) {
    return NextResponse.json(
      { error: "Silakan login terlebih dahulu." },
      { status: 401 }
    );
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const idParam = searchParams.get("id");

    if (idParam) {
      const entryId = parseInt(idParam, 10);
      if (!isNaN(entryId)) {
        const deleted = await prisma.nutritionHistory.deleteMany({
          where: { id: entryId, userId },
        });

        if (deleted.count === 0) {
          return NextResponse.json(
            { error: "Catatan tidak ditemukan atau bukan milik Anda" },
            { status: 404 }
          );
        }

        return NextResponse.json({
          success: true,
          message: "Catatan kuliner berhasil dihapus.",
          id: entryId,
        });
      }
    }

    await prisma.nutritionHistory.deleteMany({
      where: { userId },
    });

    return NextResponse.json({
      success: true,
      message: "Semua riwayat kuliner berhasil dikosongkan.",
    });
  } catch (error) {
    console.error("[DELETE /api/nutrition-history] Error:", error);
    return NextResponse.json(
      { error: "Gagal mengosongkan riwayat kuliner" },
      { status: 500 },
    );
  }
}

