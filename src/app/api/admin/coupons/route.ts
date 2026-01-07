import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    // Note: Supabase doesn't support complex JOINs in the same way
    // We'll fetch coupons and then enrich with user data
    const { data: coupons, error } = await db
      .from('coupons')
      .select('*')
      .order('id', { ascending: false });

    if (error) throw error;

    // Enrich with creator and deactivator names
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

        return { ...coupon, creator_name, deactivator_name };
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
    const { code, name, discount_type, discount_value, min_purchase, max_uses } = await request.json();

    // TODO: Get user ID from session - for now use admin ID 1
    const createdBy = 1;

    const { data, error } = await db
      .from('coupons')
      .insert({
        code,
        name,
        discount_type,
        discount_value,
        min_purchase: min_purchase || 0,
        max_uses,
        active: true,
        created_by: createdBy
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
