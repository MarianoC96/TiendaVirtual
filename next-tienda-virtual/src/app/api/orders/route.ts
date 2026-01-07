import { NextResponse } from 'next/server';
import db from '@/lib/db';
import '@/lib/seed';

interface OrderItem {
  product: {
    id: number;
    name: string;
    price: number;
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
    const result = db.prepare(`
      INSERT INTO orders (
        user_id, guest_email, guest_name, guest_phone, shipping_address, items_json, 
        customization_json, subtotal, discount, total, coupon_code, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
    `).run(
      userId || null,
      guestEmail || null,
      guestName || null,
      guestPhone || null,
      shippingAddress || null,
      JSON.stringify(items),
      items.some((i: { product: { customization?: unknown } }) => i.product.customization) 
        ? JSON.stringify(items.filter((i: { product: { customization?: unknown } }) => i.product.customization).map((i: { product: { customization?: unknown } }) => i.product.customization)) 
        : null,
      subtotal,
      discount || 0,
      total,
      couponCode || null
    );

    // Reduce stock for each product
    const updateStock = db.prepare('UPDATE products SET stock = stock - ?, total_sold = total_sold + ? WHERE id = ?');
    for (const item of items as OrderItem[]) {
      updateStock.run(item.quantity, item.quantity, item.product.id);
    }

    // Update coupon uses if a coupon was used
    if (couponCode) {
      db.prepare('UPDATE coupons SET uses = uses + 1 WHERE code = ?').run(couponCode);
    }

    return NextResponse.json({ 
      success: true, 
      orderId: result.lastInsertRowid 
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
