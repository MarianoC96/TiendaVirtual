import { NextResponse } from 'next/server';
import db from '@/lib/db';

/**
 * Cron endpoint to auto-expire coupons and discounts
 * Call this periodically (e.g., daily) to mark expired items
 * 
 * Coupons: expired if expires_at < now
 * Discounts: expired if end_date < now
 */
export async function POST() {
    try {
        const now = new Date().toISOString();
        let expiredCoupons = 0;
        let expiredDiscounts = 0;

        // 1. Expire coupons where expires_at has passed
        const { data: couponsToExpire, error: couponsError } = await db
            .from('coupons')
            .select('id')
            .is('deleted_at', null)
            .not('expires_at', 'is', null)
            .lt('expires_at', now);

        if (couponsError) {
            console.error('Error fetching expired coupons:', couponsError);
        } else if (couponsToExpire && couponsToExpire.length > 0) {
            const couponIds = couponsToExpire.map((c: { id: number }) => c.id);

            const { error: updateError } = await db
                .from('coupons')
                .update({
                    active: false,
                    deleted_at: now,
                    deleted_by: 'system',
                    deletion_reason: 'expired'
                })
                .in('id', couponIds);

            if (updateError) {
                console.error('Error expiring coupons:', updateError);
            } else {
                expiredCoupons = couponIds.length;
            }
        }

        // 2. Expire discounts where end_date has passed
        const { data: discountsToExpire, error: discountsError } = await db
            .from('discounts')
            .select('id')
            .is('deleted_at', null)
            .not('end_date', 'is', null)
            .lt('end_date', now);

        if (discountsError) {
            console.error('Error fetching expired discounts:', discountsError);
        } else if (discountsToExpire && discountsToExpire.length > 0) {
            const discountIds = discountsToExpire.map((d: { id: number }) => d.id);

            const { error: updateError } = await db
                .from('discounts')
                .update({
                    active: false,
                    deleted_at: now,
                    deleted_by: 'system',
                    deletion_reason: 'expired'
                })
                .in('id', discountIds);

            if (updateError) {
                console.error('Error expiring discounts:', updateError);
            } else {
                expiredDiscounts = discountIds.length;
            }
        }

        return NextResponse.json({
            success: true,
            expired: {
                coupons: expiredCoupons,
                discounts: expiredDiscounts
            },
            timestamp: now
        });
    } catch (error) {
        console.error('Error in expire-promotions cron:', error);
        return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
    }
}

// Allow GET for easy testing in browser
export async function GET() {
    return POST();
}
