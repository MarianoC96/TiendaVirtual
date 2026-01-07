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
      couponCode 
    } = await request.json();

    // Create order
    const { data: order, error: orderError } = await db
      .from('orders')
      .insert({
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
      })
      .select('id')
      .single();

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
