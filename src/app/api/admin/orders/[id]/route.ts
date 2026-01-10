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
    const { data: order, error: orderError } = await db
      .from('orders')
      .select('*')
      .eq('id', parseInt(id))
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const oldStatus = order.status;
    const items: OrderItem[] = order.items_json;

    // Stock management based on 'delivered' status
    // When order becomes 'delivered' -> reduce stock
    // When order leaves 'delivered' status -> restore stock

    const isBecomingDelivered = status === 'delivered' && oldStatus !== 'delivered';
    const isLeavingDelivered = oldStatus === 'delivered' && status !== 'delivered';

    // If order is becoming delivered, reduce stock
    if (isBecomingDelivered) {
      for (const item of items) {
        const { data: product } = await db
          .from('products')
          .select('stock, total_sold')
          .eq('id', item.product.id)
          .single();

        if (product) {
          await db
            .from('products')
            .update({
              stock: Math.max(0, product.stock - item.quantity),
              total_sold: (product.total_sold || 0) + item.quantity
            })
            .eq('id', item.product.id);
        }
      }
    }

    // If order is leaving delivered status (e.g., cancelled or reverted), restore stock
    if (isLeavingDelivered) {
      for (const item of items) {
        const { data: product } = await db
          .from('products')
          .select('stock, total_sold')
          .eq('id', item.product.id)
          .single();

        if (product) {
          await db
            .from('products')
            .update({
              stock: product.stock + item.quantity,
              total_sold: Math.max(0, (product.total_sold || 0) - item.quantity)
            })
            .eq('id', item.product.id);
        }
      }
    }

    // Update order status
    const { error: updateError } = await db
      .from('orders')
      .update({ status })
      .eq('id', parseInt(id));

    if (updateError) throw updateError;

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

    const { data: order, error } = await db
      .from('orders')
      .select('*')
      .eq('id', parseInt(id))
      .is('deleted_at', null)
      .single();

    if (error || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get admin ID and reason from request body
    let deletedBy = 'admin:1';
    let deletionReason = 'Sin motivo especificado';
    try {
      const body = await request.json();
      if (body.adminId) {
        deletedBy = `admin:${body.adminId}`;
      }
      if (body.reason) {
        deletionReason = body.reason;
      }
    } catch {
      // No body provided, use defaults
    }

    // Soft delete the order
    const { error } = await db
      .from('orders')
      .update({
        deleted_at: new Date().toISOString(),
        deleted_by: deletedBy,
        deletion_reason: deletionReason
      })
      .eq('id', parseInt(id));

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting order:', error);
    return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 });
  }
}

