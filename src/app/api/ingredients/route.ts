import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const ingredients = await prisma.ingredient.findMany({
      orderBy: { name: 'asc' }
    });
    return NextResponse.json(ingredients);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const ingredient = await prisma.ingredient.create({
      data: {
        name: body.name,
        unit: body.unit,
        pricePerUnit: body.pricePerUnit,
        region: body.region || 'Bandar Lampung',
      }
    });
    return NextResponse.json(ingredient, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, pricePerUnit } = body;
    
    if (!id || pricePerUnit === undefined) {
      return NextResponse.json({ error: 'ID and pricePerUnit are required' }, { status: 400 });
    }

    const ingredient = await prisma.ingredient.update({
      where: { id },
      data: { 
        pricePerUnit,
        priceUpdatedAt: new Date()
      }
    });
    return NextResponse.json(ingredient);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    await prisma.ingredient.delete({
      where: { id }
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
