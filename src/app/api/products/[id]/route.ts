import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { checkDiscountActivePeru } from '@/lib/timezone';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data: product, error } = await db
      .from('products')
      .select(`
        *,
        categories!inner(name)
      `)
      .eq('id', id)
      .single();

    if (error || !product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Fetch active discounts to apply
    const { data: discounts } = await db
      .from('discounts')
      .select('*')
      .eq('active', true);

    // Calculate Discounts logic (Unified with products list)
    const activeDiscounts = (discounts || []).filter(d => {
      // Date checks
      if (!checkDiscountActivePeru(d.start_date, d.end_date)) return false;
      // Target checks
      if (d.applies_to === 'product' && d.target_id === product.id) return true;
      if (d.applies_to === 'category' && d.target_id === product.category_id) return true;
      return false;
    });

    let finalPrice = product.price;
    let appliedDiscount = null;

    // 1. Internal Product Discount
    if (product.discount_percentage > 0) {
      finalPrice = product.price * (1 - product.discount_percentage / 100);
    }

    // 2. External Campaign Discounts
    for (const d of activeDiscounts) {
      let tempPrice = product.price;
      if (d.discount_type === 'percentage') {
        tempPrice = product.price * (1 - d.discount_value / 100);
      } else {
        tempPrice = Math.max(0, product.price - d.discount_value);
      }

      if (tempPrice < finalPrice) {
        finalPrice = tempPrice;
        appliedDiscount = d;
      }
    }

    const isOnSale = finalPrice < product.price;
    const discountPercentage = isOnSale
      ? Math.round(((product.price - finalPrice) / product.price) * 100)
      : 0;

    // Transform to match expected format
    const transformedProduct: Record<string, unknown> = {
      ...product,
      category_name: product.categories?.name,
      price: finalPrice,
      original_price: isOnSale ? product.price : null,
      discount_percentage: discountPercentage,
      discount_end_date: appliedDiscount?.end_date || null,
      variants: []
    };

    // Fetch variants if product has them
    if (product.has_variants) {
      const { data: variants } = await db
        .from('product_variants')
        .select('id, variant_type, variant_label, price, stock, is_default')
        .eq('product_id', product.id)
        .order('id', { ascending: true });

      if (variants && variants.length > 0) {
        transformedProduct.variants = variants.map(v => ({
          id: v.id,
          type: v.variant_type,
          label: v.variant_label,
          price: v.price, // Note: Variants usually override base price, but if we had variant-specific discounts we'd apply them here too. 
          // For now, variants just use their raw price or we could argue they inherit the % discount.
          // But usually variants have specific prices. The UI handles variant selection price.
          // However, if the discount is "percentage off product", it should probably apply to variants too?
          // The current UI logic for ProductDetailPage applies the PRODUCT discount percentage to the SELECTED VARIANT price.
          // See line 178 in page.tsx: finalPrice = ... basePrice * (1 - product.discount_percentage / 100)
          // So we just need to pass the correct product.discount_percentage calculate above.
          stock: v.stock,
          is_default: v.is_default,
          in_stock: v.stock > 0
        }));
      }
    }

    return NextResponse.json(transformedProduct);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}
