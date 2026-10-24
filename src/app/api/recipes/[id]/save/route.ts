import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Silakan login terlebih dahulu untuk menyimpan resep" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const recipeId = parseInt(id, 10);
    if (isNaN(recipeId)) {
      return NextResponse.json({ success: false, message: "ID resep tidak valid" }, { status: 400 });
    }

    const recipe = await prisma.recipe.findUnique({
      where: { id: recipeId },
      select: { id: true, title: true },
    });

    if (!recipe) {
      return NextResponse.json({ success: false, message: "Resep tidak ditemukan" }, { status: 404 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { email: session.user.email || "" },
      select: { id: true },
    });

    if (!dbUser) {
      return NextResponse.json({ success: false, message: "Pengguna tidak ditemukan" }, { status: 404 });
    }

    // Cek apakah sudah pernah disimpan
    const existingSave = await prisma.savedRecipe.findUnique({
      where: {
        userId_recipeId: {
          userId: dbUser.id,
          recipeId: recipe.id,
        },
      },
    });

    if (existingSave) {
      // Hapus dari simpanan (Unsave)
      await prisma.savedRecipe.delete({
        where: { id: existingSave.id },
      });

      return NextResponse.json({
        success: true,
        saved: false,
        message: `Resep "${recipe.title}" dihapus dari daftar simpanan.`,
      });
    } else {
      // Simpan resep (Save)
      await prisma.savedRecipe.create({
        data: {
          userId: dbUser.id,
          recipeId: recipe.id,
        },
      });

      return NextResponse.json({
        success: true,
        saved: true,
        message: `Resep "${recipe.title}" berhasil disimpan ke daftar resep favoritmu!`,
      });
    }
  } catch (error) {
    console.error("[POST /api/recipes/[id]/save] Error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memproses penyimpanan resep" },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: true, saved: false });
    }

    const { id } = await params;
    const recipeId = parseInt(id, 10);
    if (isNaN(recipeId)) {
      return NextResponse.json({ success: false, message: "ID resep tidak valid" }, { status: 400 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { email: session.user.email || "" },
      select: { id: true },
    });

    if (!dbUser) {
      return NextResponse.json({ success: true, saved: false });
    }

    const existingSave = await prisma.savedRecipe.findUnique({
      where: {
        userId_recipeId: {
          userId: dbUser.id,
          recipeId,
        },
      },
    });

    return NextResponse.json({
      success: true,
      saved: Boolean(existingSave),
    });
  } catch (error) {
    console.error("[GET /api/recipes/[id]/save] Error:", error);
    return NextResponse.json({ success: false, message: "Gagal memeriksa status simpan" }, { status: 500 });
  }
}
