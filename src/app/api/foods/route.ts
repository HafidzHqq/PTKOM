import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const type = searchParams.get('type') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');

  const skip = (page - 1) * limit;

  const where: any = {};
  if (search) {
    where.name = { contains: search };
  }
  if (category) {
    where.category = category;
  }
  if (type) {
    where.type = type;
  }

  try {
    const [foods, total] = await Promise.all([
      prisma.food.findMany({
        where,
        skip,
        take: limit,
        include: {
          recipeItems: { include: { ingredient: true } },
          places: { include: { place: true } }
        }
      }),
      prisma.food.count({ where })
    ]);

    return NextResponse.json({
      data: foods,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
