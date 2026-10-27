import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const recipeId = parseInt(id, 10);
    if (isNaN(recipeId)) {
      return NextResponse.json({ success: false, message: "ID resep tidak valid" }, { status: 400 });
    }

    // Ambil session user aktif jika ada
    const session = await getServerSession(authOptions);
    let currentDbUserId: number | null = null;
    if (session?.user?.email) {
      const dbUser = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true },
      });
      if (dbUser) currentDbUserId = dbUser.id;
    }

    const recipe = await prisma.recipe.findUnique({
      where: { id: recipeId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            email: true,
          },
        },
        savedBy: currentDbUserId
          ? {
              where: { userId: currentDbUserId },
              select: { id: true },
            }
          : false,
        _count: {
          select: { savedBy: true },
        },
      },
    });

    if (!recipe) {
      return NextResponse.json({ success: false, message: "Resep tidak ditemukan" }, { status: 404 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = recipe as any;

    return NextResponse.json({
      success: true,
      data: {
        ...data,
        isSaved: Boolean(data.savedBy && data.savedBy.length > 0),
        saveCount: data._count?.savedBy || 0,
        savedBy: undefined,
        _count: undefined,
      },
      currentUserId: currentDbUserId,
    });
  } catch (error) {
    console.error("[GET /api/recipes/[id]] Error:", error);
    return NextResponse.json({ success: false, message: "Gagal mengambil data resep" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const recipeId = parseInt(id, 10);
    if (isNaN(recipeId)) {
      return NextResponse.json({ success: false, message: "ID resep tidak valid" }, { status: 400 });
    }

    const existing = await prisma.recipe.findUnique({
      where: { id: recipeId },
      select: { id: true, userId: true },
    });

    if (!existing) {
      return NextResponse.json({ success: false, message: "Resep tidak ditemukan" }, { status: 404 });
    }

    // Cek kepemilikan: hanya pengupload resep yang berhak menghapus
    const dbUser = await prisma.user.findUnique({
      where: { email: session.user.email || "" },
      select: { id: true },
    });

    if (!dbUser) {
      return NextResponse.json({ success: false, message: "Pengguna tidak ditemukan" }, { status: 404 });
    }

    if (!existing.userId || existing.userId !== dbUser.id) {
      return NextResponse.json(
        { success: false, message: "Anda hanya berhak menghapus resep yang pernah Anda upload sendiri." },
        { status: 403 }
      );
    }

    await prisma.recipe.delete({
      where: { id: recipeId },
    });

    return NextResponse.json({ success: true, message: "Resep berhasil dihapus" });
  } catch (error) {
    console.error("[DELETE /api/recipes/[id]] Error:", error);
    return NextResponse.json({ success: false, message: "Gagal menghapus resep" }, { status: 500 });
  }
}
