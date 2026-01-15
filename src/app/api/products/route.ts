import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { checkDiscountActivePeru } from '@/lib/timezone';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const categoria = searchParams.get('categoria');

    let supabaseQuery = db
      .from('products')
      .select(`
        *,
        categories!inner(name)
      `)
      .order('is_featured', { ascending: false })
      .order('total_sold', { ascending: false });

    if (query) {
      supabaseQuery = supabaseQuery.or(`name.ilike.%${query}%,description.ilike.%${query}%`);
    }

    if (categoria) {
      supabaseQuery = supabaseQuery.eq('category', categoria);
    }

    const { data: products, error } = await supabaseQuery;

    if (error) throw error;

    // Fetch active discounts to apply
    const { data: discounts } = await db
      .from('discounts')
      .select('*')
      .eq('active', true);

    // Transform to match expected format and apply discounts
    const transformedProducts = products?.map(p => {
      // Find best applicable discount
      // Base price is the product price
      // Initial check: if product has internal discount_percentage, consider it a candidate for finalPrice
      let finalPrice = p.price;
      let appliedDiscount = null;

      if (p.discount_percentage > 0) {
        finalPrice = p.price * (1 - p.discount_percentage / 100);
      }

      const applicableDiscounts = discounts?.filter(d => {
        // Date checks
        if (!checkDiscountActivePeru(d.start_date, d.end_date)) return false;

        // Target checks
        if (d.applies_to === 'product' && d.target_id === p.id) return true;
        if (d.applies_to === 'category' && d.target_id === p.category_id) return true;

        return false;
      }) || [];

      // Check against external discounts from 'discounts' table
      for (const d of applicableDiscounts) {
        let tempPrice = p.price;
        if (d.discount_type === 'percentage') {
          tempPrice = p.price * (1 - d.discount_value / 100);
        } else {
          tempPrice = Math.max(0, p.price - d.discount_value);
        }

        if (tempPrice < finalPrice) {
          finalPrice = tempPrice;
          appliedDiscount = d;
        }
      }

      const isOnSale = finalPrice < p.price;
      const discountPercentage = isOnSale
        ? Math.round(((p.price - finalPrice) / p.price) * 100)
        : 0;

      return {
        ...p,
        category_name: p.categories?.name,
        price: finalPrice, // Current selling price
        original_price: isOnSale ? p.price : null, // Show original only if discounted
        discount_percentage: discountPercentage,
        is_on_sale: isOnSale,
        discount_end_date: appliedDiscount?.end_date || null
      };
    }) || [];

    return NextResponse.json(transformedProducts);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
