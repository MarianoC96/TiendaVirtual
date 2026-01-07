import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const categoria = searchParams.get('categoria');

    let supabaseQuery = db
      .from('products')
      .select(`
        *,
        categories!inner(name)
      `)
      .order('is_featured', { ascending: false })
      .order('total_sold', { ascending: false });

    if (query) {
      supabaseQuery = supabaseQuery.or(`name.ilike.%${query}%,description.ilike.%${query}%`);
    }

    if (categoria) {
      supabaseQuery = supabaseQuery.eq('category', categoria);
    }

    const { data: products, error } = await supabaseQuery;

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
