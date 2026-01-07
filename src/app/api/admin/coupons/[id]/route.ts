import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { active } = await request.json();

    const { error } = await db
      .from('coupons')
      .update({ active })
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
    
    // Soft delete: set deactivated_by and deactivated_at, set active = false
    // TODO: Get user ID from session - for now use admin ID 1
    const deactivatedBy = 1;
    
    const { error } = await db
      .from('coupons')
      .update({
        active: false,
        deactivated_by: deactivatedBy,
        deactivated_at: new Date().toISOString()
      })
      .eq('id', parseInt(id));

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting coupon:', error);
    return NextResponse.json({ error: 'Failed to delete coupon' }, { status: 500 });
  }
}
