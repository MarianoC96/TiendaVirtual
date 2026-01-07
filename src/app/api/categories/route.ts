import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const { data: categories, error } = await db
      .from('categories')
      .select('*')
      .order('id');

    if (error) throw error;

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}
