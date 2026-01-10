import { NextResponse } from 'next/server';
import db from '@/lib/db';

interface OrderItem {
  product: {
    id: number;
    name: string;
    price: number;
    customization?: unknown;
  };
  quantity: number;
}

// GET: Listar pedidos (filtrados por userId si se proporciona)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    let query = db
      .from('orders')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data: orders, error } = await query;

    if (error) throw error;

    return NextResponse.json(orders || []);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Error al obtener pedidos' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const {
      userId,
      guestName,
      guestEmail,
      guestPhone,
      shippingAddress,
      items,
      subtotal,
      discount,
      total,
      couponCode,
      discountInfo
    } = await request.json();

    // Generate unique order code (P0000XXX format)
    // Get the last order to determine next code number
    const { data: lastOrder } = await db
      .from('orders')
      .select('order_code')
      .not('order_code', 'is', null)
      .order('id', { ascending: false })
      .limit(1)
      .single();

    let nextNumber = 1;
    if (lastOrder?.order_code) {
      const lastNumber = parseInt(lastOrder.order_code.replace('P', ''));
      if (!isNaN(lastNumber)) {
        nextNumber = lastNumber + 1;
      }
    }
    const orderCode = `P${nextNumber.toString().padStart(7, '0')}`;

    // Create order - try with discount_info first, fallback without if column doesn't exist
    const orderData: Record<string, unknown> = {
      order_code: orderCode,
      user_id: userId || null,
      guest_email: guestEmail || null,
      guest_name: guestName || null,
      guest_phone: guestPhone || null,
      shipping_address: shippingAddress || null,
      items_json: items,
      customization_json: items.some((i: OrderItem) => i.product.customization)
        ? items.filter((i: OrderItem) => i.product.customization).map((i: OrderItem) => i.product.customization)
        : null,
      subtotal,
      discount: discount || 0,
      total,
      coupon_code: couponCode || null,
      status: 'pending'
    };

    // Add discount_info if provided
    if (discountInfo) {
      orderData.discount_info = discountInfo;
    }

    let order;
    let orderError;

    // Try to create order
    const result = await db
      .from('orders')
      .insert(orderData)
      .select('id')
      .single();

    order = result.data;
    orderError = result.error;

    // If error is about discount_info column, retry without it
    if (orderError && orderError.message?.includes('discount_info')) {
      delete orderData.discount_info;
      const retryResult = await db
        .from('orders')
        .insert(orderData)
        .select('id')
        .single();
      order = retryResult.data;
      orderError = retryResult.error;
    }

    if (orderError) throw orderError;

    // Note: Stock is NOT reduced here. It will be reduced when the order status changes to 'delivered'
    // This allows for order cancellation/modification before delivery without affecting stock

    // Update coupon uses if a coupon was used
    if (couponCode) {
      const { data: coupon } = await db
        .from('coupons')
        .select('uses')
        .eq('code', couponCode)
        .single();

      if (coupon) {
        await db
          .from('coupons')
          .update({ uses: coupon.uses + 1 })
          .eq('code', couponCode);
      }
    }

    return NextResponse.json({
      success: true,
      orderId: order?.id,
      orderCode: orderCode
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
