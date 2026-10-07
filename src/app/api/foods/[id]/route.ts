import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateCookCost } from '@/lib/recommendation';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const food = await prisma.food.findUnique({
      where: { id },
      include: {
        recipeItems: { include: { ingredient: true } },
        places: { include: { place: true } }
      }
    });

    if (!food) {
      return NextResponse.json({ error: 'Food not found' }, { status: 404 });
    }

    let calculatedPrice = food.pricePerPortion;
    let cookDetails = null;

    if (food.type === 'MASAK') {
      try {
        cookDetails = await calculateCookCost(food.id);
        calculatedPrice = cookDetails.costPerPortion;
      } catch (e) {
        console.error(e);
      }
    }

    return NextResponse.json({
      ...food,
      calculatedPrice,
      cookDetails
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
