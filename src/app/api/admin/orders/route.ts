import { NextResponse } from 'next/server';
import db from '@/lib/db';
import '@/lib/seed';

export async function GET() {
  try {
    const orders = db.prepare('SELECT * FROM orders ORDER BY id DESC').all();
    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
