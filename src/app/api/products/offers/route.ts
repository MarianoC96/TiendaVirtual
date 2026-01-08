import { NextResponse } from 'next/server';
import db from '@/lib/db';

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
        const now = new Date().toISOString();

        // 1. Get active discounts (Category and Product based)
        // Filter active, not deleted, and within date range
        const { data: discounts, error: discountError } = await db
            .from('discounts')
            .select('*')
            .eq('active', true)
            .is('deleted_at', null)
            .or(`start_date.is.null,start_date.lte.${now}`)
            .or(`end_date.is.null,end_date.gte.${now}`);

        if (discountError) throw discountError;

        const activeDiscounts = (discounts || []) as Discount[];
        const categoryDiscounts = activeDiscounts.filter(d => d.applies_to === 'category');

        // 2. Fetch all in-stock products with their categories
        // (Fetching all is acceptable for small-medium shops. optimization would be needed for thousands)
        const { data: products, error: productError } = await db
            .from('products')
            .select(`
                *,
                categories!inner(id, name, slug)
            `)
            .eq('in_stock', true);

        if (productError) throw productError;

        // 3. Process products to find offers and calculate best price
        // Cast products to any[] or definition to avoid index errors, though Supabase types usually infer well
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
            const catDiscount = categoryDiscounts.find(d => d.target_id === product.category_id);
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
            const prodDiscount = activeDiscounts.find(d => d.applies_to === 'product' && d.target_id === product.id);
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
                return {
                    ...product,
                    category_name: product.categories?.name, // Flatten category name
                    final_price: product.price - bestDiscount.amount,
                    discount_info: {
                        ...bestDiscount,
                        label: discountLabel
                    }
                };
            }
            return null; // No offer
        }).filter((p: any) => p !== null);

        // 4. Prepare Banners for Category Discounts
        // Enrich with category metadata
        const enrichedBanners = await Promise.all(categoryDiscounts.map(async (d) => {
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

        return NextResponse.json({
            products: offerProducts,
            banners: enrichedBanners
        });

    } catch (error) {
        console.error('Error fetching offers:', error);
        return NextResponse.json({ error: 'Failed to fetch offers' }, { status: 500 });
    }
}
