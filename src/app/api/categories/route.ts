import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const { data: categories, error } = await db
      .from('categories')
      .select('*, products!inner(id)')
      .order('id');

    if (error) throw error;

    // Filter out the products array from the response as it's only needed for filtering
    const filteredCategories = categories.map(({ products, ...category }) => category);

    return NextResponse.json(filteredCategories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}
