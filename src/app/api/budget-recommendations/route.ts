import { NextResponse } from 'next/server';
import { getRecommendations } from '@/lib/recommendation';
import { recommendationSchema } from '@/lib/validators';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validasi input
    const result = recommendationSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: result.error.format() },
        { status: 400 }
      );
    }

    // Hitung rekomendasi
    const recommendations = await getRecommendations(result.data);
    
    return NextResponse.json(recommendations);
  } catch (error: any) {
    console.error('Recommendation API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}
