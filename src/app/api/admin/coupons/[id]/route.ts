import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Construct update data dynamically
    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.code !== undefined) updateData.code = body.code.toUpperCase();
    if (body.discount_type !== undefined) updateData.discount_type = body.discount_type;
    if (body.discount_value !== undefined) updateData.discount_value = body.discount_value;
    if (body.min_purchase !== undefined) updateData.min_purchase = body.min_purchase;
    if (body.max_uses !== undefined) updateData.max_uses = body.max_uses;
    if (body.active !== undefined) updateData.active = body.active;
    if (body.expires_at !== undefined) updateData.expires_at = body.expires_at;
    if (body.applies_to !== undefined) updateData.applies_to = body.applies_to;
    if (body.target_id !== undefined) updateData.target_id = body.target_id;
    if (body.usage_limit_per_user !== undefined) updateData.usage_limit_per_user = body.usage_limit_per_user;

    const { error } = await db
      .from('coupons')
      .update(updateData)
      .eq('id', parseInt(id));

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating coupon:', error);
    return NextResponse.json({ error: 'Failed to update coupon' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Soft delete using deleted_at
    // TODO: Get user ID from session - for now use admin ID 1
    const deletedBy = 1;

    const { error } = await db
      .from('coupons')
      .update({
        active: false, // Also deactivate it
        deleted_by: deletedBy, // Changed from deactivated_by to deleted_by for proper soft delete
        deleted_at: new Date().toISOString(), // Use deleted_at for hard filtering
        deletion_reason: 'manual' // Track that it was manually deleted by admin
      })
      .eq('id', parseInt(id));

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting coupon:', error);
    return NextResponse.json({ error: 'Failed to delete coupon' }, { status: 500 });
  }
}
