import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const { data: products, error } = await db
      .from('products')
      .select(`
        *,
        categories!inner(name)
      `)
      .eq('is_featured', true)
      .order('total_sold', { ascending: false })
      .limit(10);

    if (error) throw error;

    // Transform to match expected format
    const transformedProducts = products?.map(p => ({
      ...p,
      category_name: p.categories?.name
    })) || [];

    return NextResponse.json(transformedProducts);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
