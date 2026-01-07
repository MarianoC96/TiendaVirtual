import { NextResponse } from 'next/server';
import db from '@/lib/db';
import '@/lib/seed';

export async function GET() {
  try {
    const totalProducts = (db.prepare('SELECT COUNT(*) as count FROM products').get() as { count: number }).count;
    const totalOrders = (db.prepare('SELECT COUNT(*) as count FROM orders').get() as { count: number }).count;
    const totalRevenue = (db.prepare('SELECT COALESCE(SUM(total), 0) as sum FROM orders').get() as { sum: number }).sum;
    const totalCategories = (db.prepare('SELECT COUNT(*) as count FROM categories').get() as { count: number }).count;
    const activeCoupons = (db.prepare('SELECT COUNT(*) as count FROM coupons WHERE active = 1').get() as { count: number }).count;
    const lowStockProducts = (db.prepare('SELECT COUNT(*) as count FROM products WHERE stock < 10').get() as { count: number }).count;

    return NextResponse.json({
      totalProducts,
      totalOrders,
      totalRevenue,
      totalCategories,
      activeCoupons,
      lowStockProducts
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
