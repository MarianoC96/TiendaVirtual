import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const { data: orders, error } = await db
      .from('orders')
      .select('*')
      .order('id', { ascending: false });

    if (error) throw error;

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
