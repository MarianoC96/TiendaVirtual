import { NextResponse } from 'next/server';
import db from '@/lib/db';
import '@/lib/seed';

export async function GET() {
  try {
    const coupons = db.prepare(`
      SELECT 
        c.*,
        creator.name as creator_name,
        deactivator.name as deactivator_name
      FROM coupons c
      LEFT JOIN users creator ON c.created_by = creator.id
      LEFT JOIN users deactivator ON c.deactivated_by = deactivator.id
      ORDER BY c.id DESC
    `).all();
    return NextResponse.json(coupons);
  } catch (error) {
    console.error('Error fetching coupons:', error);
    return NextResponse.json({ error: 'Failed to fetch coupons' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { code, name, discount_type, discount_value, min_purchase, max_uses } = await request.json();

    // TODO: Get user ID from session - for now use admin ID 1
    const createdBy = 1;

    const result = db.prepare(`
      INSERT INTO coupons (code, name, discount_type, discount_value, min_purchase, max_uses, active, created_by)
      VALUES (?, ?, ?, ?, ?, ?, 1, ?)
    `).run(code, name, discount_type, discount_value, min_purchase || 0, max_uses, createdBy);

    return NextResponse.json({ id: result.lastInsertRowid });
  } catch (error) {
    console.error('Error creating coupon:', error);
    return NextResponse.json({ error: 'Failed to create coupon' }, { status: 500 });
  }
}
