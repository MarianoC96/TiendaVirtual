import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    // Get total products
    const { count: totalProducts } = await db
      .from('products')
      .select('*', { count: 'exact', head: true });

    // Get total orders
    const { count: totalOrders } = await db
      .from('orders')
      .select('*', { count: 'exact', head: true });

    // Get total revenue
    const { data: revenueData } = await db
      .from('orders')
      .select('total');
    const totalRevenue = revenueData?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;

    // Get total categories
    const { count: totalCategories } = await db
      .from('categories')
      .select('*', { count: 'exact', head: true });

    // Get active coupons
    const { count: activeCoupons } = await db
      .from('coupons')
      .select('*', { count: 'exact', head: true })
      .eq('active', true);

    // Get low stock products
    const { count: lowStockProducts } = await db
      .from('products')
      .select('*', { count: 'exact', head: true })
      .lt('stock', 10);

    return NextResponse.json({
      totalProducts: totalProducts || 0,
      totalOrders: totalOrders || 0,
      totalRevenue,
      totalCategories: totalCategories || 0,
      activeCoupons: activeCoupons || 0,
      lowStockProducts: lowStockProducts || 0
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
