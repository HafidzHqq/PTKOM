import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateCookCost } from '@/lib/recommendation';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Cari makanan berdasarkan ID
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

    // Jika makanan ini tipe BELI, kita cari versi MASAK-nya (berdasarkan nama yang mirip)
    // Jika makanan ini tipe MASAK, kita cari versi BELI-nya
    
    let beliVersion = null;
    let masakVersion = null;
    let cookDetails = null;

    if (food.type === 'BELI') {
      beliVersion = food;
      // Cari versi masak
      const similarMasak = await prisma.food.findFirst({
        where: {
          type: 'MASAK',
          name: { contains: food.name.split(' ')[0] } // Cari kata pertama
        },
        include: { recipeItems: { include: { ingredient: true } } }
      });
      
      if (similarMasak) {
        masakVersion = similarMasak;
        cookDetails = await calculateCookCost(similarMasak.id);
      }
    } else {
      masakVersion = food;
      cookDetails = await calculateCookCost(food.id);
      
      // Cari versi beli
      const similarBeli = await prisma.food.findFirst({
        where: {
          type: 'BELI',
          name: { contains: food.name.split(' ')[0] }
        },
        include: { places: { include: { place: true } } }
      });
      
      if (similarBeli) {
        beliVersion = similarBeli;
      }
    }

    if (!beliVersion || !masakVersion) {
      return NextResponse.json({ 
        error: 'Tidak dapat membandingkan. Versi beli atau masak tidak ditemukan untuk makanan ini.' 
      }, { status: 400 });
    }

    const beliPrice = beliVersion.pricePerPortion || 0;
    const masakPrice = cookDetails?.costPerPortion || 0;
    const savings = beliPrice - masakPrice;
    const savingsPercentage = (savings / beliPrice) * 100;

    return NextResponse.json({
      foodName: food.name,
      comparison: {
        beli: {
          id: beliVersion.id,
          name: beliVersion.name,
          pricePerPortion: beliPrice,
          places: beliVersion.places
        },
        masak: {
          id: masakVersion.id,
          name: masakVersion.name,
          pricePerPortion: masakPrice,
          cookDetails
        },
        savings: {
          amount: savings,
          percentage: savingsPercentage,
          isCheaperToCook: savings > 0
        }
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
