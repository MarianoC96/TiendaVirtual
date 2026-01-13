import { NextResponse } from 'next/server';
import db from '@/lib/db';

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

    // Transform to match expected format
    const transformedProduct: Record<string, unknown> = {
      ...product,
      category_name: product.categories?.name,
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
          price: v.price,
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
