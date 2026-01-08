import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    // Filter non-deleted coupons
    const { data: coupons, error } = await db
      .from('coupons')
      .select('*')
      .is('deleted_at', null)
      .order('id', { ascending: false });

    if (error) throw error;

    // Enrich with creator and deactivator details...
    // (Existing enrichment logic remains, just ensuring we filter deleted first)
    const enrichedCoupons = await Promise.all(
      (coupons || []).map(async (coupon) => {
        let creator_name = null;
        let deactivator_name = null;

        if (coupon.created_by) {
          const { data: creator } = await db
            .from('users')
            .select('name')
            .eq('id', coupon.created_by)
            .single();
          creator_name = creator?.name;
        }

        if (coupon.deactivated_by) {
          const { data: deactivator } = await db
            .from('users')
            .select('name')
            .eq('id', coupon.deactivated_by)
            .single();
          deactivator_name = deactivator?.name;
        }

        // Enrich target name if needed (optional optimization)
        let target_name = null;
        if (coupon.applies_to === 'product' && coupon.target_id) {
          const { data: p } = await db.from('products').select('name').eq('id', coupon.target_id).single();
          target_name = p?.name;
        } else if (coupon.applies_to === 'category' && coupon.target_id) {
          const { data: c } = await db.from('categories').select('name').eq('id', coupon.target_id).single();
          target_name = c?.name;
        }

        return { ...coupon, creator_name, deactivator_name, target_name };
      })
    );

    return NextResponse.json(enrichedCoupons);
  } catch (error) {
    console.error('Error fetching coupons:', error);
    return NextResponse.json({ error: 'Failed to fetch coupons' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const {
      code, name, discount_type, discount_value, min_purchase, max_uses, expires_at,
      applies_to, target_id, usage_limit_per_user
    } = await request.json();

    // TODO: Get user ID from session - for now use admin ID 1
    const createdBy = 1;

    const { data, error } = await db
      .from('coupons')
      .insert({
        code: code.toUpperCase(),
        name,
        discount_type,
        discount_value,
        min_purchase: min_purchase || 0,
        max_uses,
        expires_at, // Add expiration date support
        active: true,
        created_by: createdBy,
        applies_to: applies_to || 'cart_value',
        target_id: target_id || 0,
        usage_limit_per_user: usage_limit_per_user || 0
      })
      .select('id')
      .single();

    if (error) throw error;

    return NextResponse.json({ id: data?.id });
  } catch (error) {
    console.error('Error creating coupon:', error);
    return NextResponse.json({ error: 'Failed to create coupon' }, { status: 500 });
  }
}
