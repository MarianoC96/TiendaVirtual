import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // First, mark orders older than 30 days as expired (soft delete)
    await db
      .from('orders')
      .update({
        deleted_at: now.toISOString(),
        deleted_by: 'system:auto_expire',
        deletion_reason: 'expired_30_days'
      })
      .is('deleted_at', null)
      .lt('created_at', thirtyDaysAgo.toISOString());

    // Fetch only non-deleted orders
    const { data: orders, error } = await db
      .from('orders')
      .select('*')
      .is('deleted_at', null)
      .order('id', { ascending: false });

    if (error) throw error;

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
