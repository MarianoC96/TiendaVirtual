import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { active } = await request.json();

    db.prepare('UPDATE coupons SET active = ? WHERE id = ?').run(active, id);

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
    
    // Soft delete: set deactivated_by and deactivated_at, set active = 0
    // TODO: Get user ID from session - for now use admin ID 1
    const deactivatedBy = 1;
    
    db.prepare(`
      UPDATE coupons 
      SET active = 0, deactivated_by = ?, deactivated_at = datetime('now')
      WHERE id = ?
    `).run(deactivatedBy, id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting coupon:', error);
    return NextResponse.json({ error: 'Failed to delete coupon' }, { status: 500 });
  }
}
