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

    // Create order - try with discount_info first, fallback without if column doesn't exist
    const orderData: Record<string, unknown> = {
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

    // Reduce stock for each product
    for (const item of items as OrderItem[]) {
      await db.rpc('update_product_stock', {
        p_id: item.product.id,
        p_quantity: item.quantity
      }).then(async () => {
        // If RPC doesn't exist, use direct update
        const { data: product } = await db
          .from('products')
          .select('stock, total_sold')
          .eq('id', item.product.id)
          .single();

        if (product) {
          await db
            .from('products')
            .update({
              stock: product.stock - item.quantity,
              total_sold: product.total_sold + item.quantity
            })
            .eq('id', item.product.id);
        }
      });
    }

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
      orderId: order?.id
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
