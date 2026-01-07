import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
    try {
        const now = new Date().toISOString();

        // Get active cart_value discounts
        const { data: discounts, error } = await db
            .from('discounts')
            .select('*')
            .eq('applies_to', 'cart_value')
            .eq('active', true)
            .or(`start_date.is.null,start_date.lte.${now}`)
            .or(`end_date.is.null,end_date.gte.${now}`)
            .order('discount_value', { ascending: false })
            .limit(1);

        if (error) throw error;

        // Return the best active cart discount (highest value)
        const discount = discounts && discounts.length > 0 ? {
            id: discounts[0].id,
            name: discounts[0].name,
            discount_type: discounts[0].discount_type,
            discount_value: discounts[0].discount_value,
            min_cart_value: discounts[0].target_id
        } : null;

        return NextResponse.json(discount);
    } catch (error) {
        console.error('Error fetching cart discount:', error);
        return NextResponse.json(null);
    }
}
