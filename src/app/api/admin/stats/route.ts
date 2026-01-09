import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    // Get current date info
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const startOfMonth = new Date(currentYear, currentMonth, 1).toISOString();
    const endOfMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59).toISOString();

    // Get total products (non-deleted)
    const { count: totalProducts } = await db
      .from('products')
      .select('*', { count: 'exact', head: true })
      .is('deleted_at', null);

    // Get total orders
    const { count: totalOrders } = await db
      .from('orders')
      .select('*', { count: 'exact', head: true });

    // Get total revenue (all time) from delivered orders
    const { data: allOrders } = await db
      .from('orders')
      .select('total, created_at, status');

    const totalRevenue = allOrders?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;

    // Get monthly revenue
    const monthlyRevenue = allOrders?.reduce((sum, order) => {
      const orderDate = new Date(order.created_at);
      if (orderDate >= new Date(startOfMonth) && orderDate <= new Date(endOfMonth)) {
        return sum + (order.total || 0);
      }
      return sum;
    }, 0) || 0;

    // Get monthly sales data (last 12 months)
    const monthlySales: { month: string; revenue: number; orders: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentYear, currentMonth - i, 1);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);

      const monthData = allOrders?.filter(order => {
        const orderDate = new Date(order.created_at);
        return orderDate >= monthStart && orderDate <= monthEnd;
      }) || [];

      monthlySales.push({
        month: monthStart.toLocaleDateString('es-PE', { month: 'short' }),
        revenue: monthData.reduce((sum, o) => sum + (o.total || 0), 0),
        orders: monthData.length
      });
    }

    // Get total categories
    const { count: totalCategories } = await db
      .from('categories')
      .select('*', { count: 'exact', head: true })
      .is('deleted_at', null);

    // Get active coupons with details
    const { data: activeCoupons } = await db
      .from('coupons')
      .select('id, code, name, discount_type, discount_value, uses, max_uses')
      .eq('active', true)
      .is('deactivated_at', null)
      .order('created_at', { ascending: false })
      .limit(5);

    // Get active discounts with target details
    const { data: activeDiscountsRaw, error: discountsError } = await db
      .from('discounts')
      .select('*')
      .eq('active', true)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(5);

    if (discountsError) {
      console.error('Error fetching discounts:', discountsError);
    }

    // Enrich discounts with target names (same logic as discounts page)
    const activeDiscounts = await Promise.all(
      (activeDiscountsRaw || []).map(async (discount: any) => {
        let target_name = '';

        if (discount.applies_to === 'product' && discount.target_id) {
          const { data: product } = await db
            .from('products')
            .select('name')
            .eq('id', discount.target_id)
            .single();
          target_name = product?.name || '';
        } else if (discount.applies_to === 'category' && discount.target_id) {
          const { data: category } = await db
            .from('categories')
            .select('name')
            .eq('id', discount.target_id)
            .single();
          target_name = category?.name || '';
        } else if (discount.applies_to === 'cart_value') {
          target_name = `${discount.target_id || 0}`;
        }

        return { ...discount, target_name };
      })
    );

    // Get low stock products (stock <= 5)
    const { data: lowStockProducts } = await db
      .from('products')
      .select('id, name, stock, image_url')
      .lte('stock', 5)
      .is('deleted_at', null)
      .order('stock', { ascending: true })
      .limit(10);

    return NextResponse.json({
      totalProducts: totalProducts || 0,
      totalOrders: totalOrders || 0,
      totalRevenue,
      monthlyRevenue,
      totalCategories: totalCategories || 0,
      activeCoupons: activeCoupons || [],
      activeDiscounts: activeDiscounts || [],
      lowStockProducts: lowStockProducts || [],
      monthlySales
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
