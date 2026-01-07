import { NextResponse } from 'next/server';
import db from '@/lib/db';

interface OrderItem {
  product: {
    id: number;
  };
  quantity: number;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { status } = await request.json();
    
    // Get current order
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(id) as { status: string; items_json: string } | undefined;
    
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const oldStatus = order.status;
    const items: OrderItem[] = JSON.parse(order.items_json);

    // If cancelling an order that wasn't already cancelled, restore stock
    if (status === 'cancelled' && oldStatus !== 'cancelled') {
      const restoreStock = db.prepare('UPDATE products SET stock = stock + ?, total_sold = total_sold - ? WHERE id = ?');
      for (const item of items) {
        restoreStock.run(item.quantity, item.quantity, item.product.id);
      }
    }

    // If un-cancelling an order (rare but possible), reduce stock again
    if (oldStatus === 'cancelled' && status !== 'cancelled') {
      const reduceStock = db.prepare('UPDATE products SET stock = stock - ?, total_sold = total_sold + ? WHERE id = ?');
      for (const item of items) {
        reduceStock.run(item.quantity, item.quantity, item.product.id);
      }
    }

    // Update order status
    db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
    
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}
