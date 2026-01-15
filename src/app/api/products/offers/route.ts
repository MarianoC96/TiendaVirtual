import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { checkDiscountActivePeru } from '@/lib/timezone';

interface Discount {
    id: number;
    name: string;
    discount_type: string;
    discount_value: number;
    applies_to: string;
    target_id: number;
    active: boolean;
}

interface SupabaseProduct {
    id: number;
    name: string;
    price: number;
    category_id: number;
    discount_percentage: number;
    categories?: {
        name: string;
    };
    // other fields we just spread, but these are needed for logic
}

export async function GET() {
    try {
        const nowIso = new Date().toISOString();
        const now = new Date();

        // 1. Get active discounts (Category and Product based)
        // Filter active, not deleted. We filter by date in JS to ensure consistency with products API
        const { data: discounts, error: discountError } = await db
            .from('discounts')
            .select('*')
            .eq('active', true)
            .is('deleted_at', null);

        if (discountError) throw discountError;

        const activeDiscounts = (discounts || []) as any[];
        const categoryDiscounts = activeDiscounts.filter(d => d.applies_to === 'category');

        // 2. Fetch all products with their categories
        const { data: products, error: productError } = await db
            .from('products')
            .select(`
                *,
                categories!inner(id, name, slug)
            `);

        if (productError) throw productError;

        // Helper for date validation
        const isValidDate = (d: any) => {
            // Fix timezone offset issue. "2026-01-14" should last until 23:59:59 Peru Time (-05:00)
            // Server might be UTC.
            const startDate = d.start_date;
            const endDate = d.end_date;

            // We append -05:00 to force the parsing to treat the input as Peru time
            // If d.start_date is "2026-11-01", we want "2026-11-01T00:00:00-05:00"

            const checkStart = !startDate ||
                (startDate.length === 10
                    ? now >= new Date(`${startDate}T00:00:00-05:00`)
                    : now >= new Date(startDate));

            const checkEnd = !endDate ||
                (endDate.length === 10
                    ? now <= new Date(`${endDate}T23:59:59-05:00`)
                    : now <= new Date(endDate));

            return checkStart && checkEnd;
        };

        // 3. Prepare Banners for Category Discounts
        const enrichedBanners = await Promise.all(categoryDiscounts.map(async (d) => {
            if (!checkDiscountActivePeru(d.start_date, d.end_date)) return null;

            const { data: cat } = await db
                .from('categories')
                .select('name, slug, icon')
                .eq('id', d.target_id)
                .single();

            return {
                ...d,
                category: cat
            };
        }));

        const validBanners = enrichedBanners.filter(b => b !== null);

        // 4. Process products to find offers and calculate best price
        const productsList = products as any[];

        const offerProducts = productsList.map((product: SupabaseProduct) => {
            let bestDiscount = null;
            let discountLabel = null;

            // A. Legacy Discount (Directly on product table)
            if (product.discount_percentage > 0) {
                bestDiscount = {
                    amount: (product.price * product.discount_percentage) / 100,
                    type: 'percentage',
                    value: product.discount_percentage
                };
                discountLabel = `${product.discount_percentage}% OFF`;
            }

            // B. Active Discounts Table (Category)
            const catDiscount = categoryDiscounts.find(d =>
                d.target_id === product.category_id &&
                checkDiscountActivePeru(d.start_date, d.end_date)
            );
            if (catDiscount) {
                let amount = 0;
                if (catDiscount.discount_type === 'percentage') {
                    amount = (product.price * catDiscount.discount_value) / 100;
                } else {
                    amount = catDiscount.discount_value;
                }

                // Keep the best discount found so far
                if (!bestDiscount || amount > bestDiscount.amount) {
                    bestDiscount = {
                        id: catDiscount.id,
                        applies_to: 'category',
                        amount,
                        type: catDiscount.discount_type,
                        value: catDiscount.discount_value
                    };
                    discountLabel = catDiscount.name; // e.g. "Verano 2026"
                }
            }

            // C. Active Discounts Table (Product specific)
            const prodDiscount = activeDiscounts.find(d =>
                d.applies_to === 'product' &&
                d.target_id === product.id &&
                checkDiscountActivePeru(d.start_date, d.end_date)
            );
            if (prodDiscount) {
                let amount = 0;
                if (prodDiscount.discount_type === 'percentage') {
                    amount = (product.price * prodDiscount.discount_value) / 100;
                } else {
                    amount = prodDiscount.discount_value;
                }

                if (!bestDiscount || amount > bestDiscount.amount) {
                    bestDiscount = {
                        id: prodDiscount.id,
                        applies_to: 'product',
                        amount,
                        type: prodDiscount.discount_type,
                        value: prodDiscount.discount_value
                    };
                    discountLabel = prodDiscount.name;
                }
            }

            // If product has a discount, include it
            if (bestDiscount && bestDiscount.amount > 0) {
                // Ensure we have a valid percentage for the UI badge
                let percentage = 0;
                if (bestDiscount.type === 'percentage') {
                    percentage = bestDiscount.value;
                } else {
                    percentage = Math.round((bestDiscount.amount / product.price) * 100);
                }

                return {
                    ...product,
                    category_name: product.categories?.name,
                    final_price: product.price - bestDiscount.amount,
                    discount_percentage: percentage, // Critical for the new UI Badge
                    discount_info: {
                        ...bestDiscount,
                        label: discountLabel
                    }
                };
            }
            return null; // No offer
        }).filter((p: any) => p !== null);

        return NextResponse.json({
            products: offerProducts,
            banners: validBanners
        });

    } catch (error) {
        console.error('Error fetching offers:', error);
        return NextResponse.json({ error: 'Failed to fetch offers' }, { status: 500 });
    }
}
