import { NextResponse } from 'next/server';
import db from '@/lib/db';

// Helper to detect variant type from product name
function detectVariantType(name: string): 'size' | 'capacity' | 'dimensions' | null {
  const n = name.toLowerCase();
  if (n.includes('polo') || n.includes('polos')) return 'size';
  if (n.includes('taza') || n.includes('tazas') || n.includes('termo') || n.includes('termos')) return 'capacity';
  if (n.includes('caja') || n.includes('cajas')) return 'dimensions';
  return null;
}

interface VariantInput {
  id?: number;
  label: string;
  price: number;
  stock: number;
  is_default?: boolean;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);

    // Get product
    const { data: product, error } = await db
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !product) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
    }

    // Get variants if product has them
    let variants = [];
    if (product.has_variants) {
      const { data: variantsData } = await db
        .from('product_variants')
        .select('*')
        .eq('product_id', id)
        .order('id', { ascending: true });
      variants = variantsData || [];
    }

    return NextResponse.json({ ...product, variants });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);

    // Check if product exists
    const { data: product, error: fetchError } = await db
      .from('products')
      .select('id')
      .eq('id', id)
      .single();

    if (fetchError || !product) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
    }

    // Soft delete
    const deletedBy = "1"; // Mock Admin ID

    const { error } = await db
      .from('products')
      .update({
        deleted_at: new Date().toISOString(),
        deleted_by: deletedBy
      })
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    const body = await request.json();

    const { variants, ...productData } = body;

    const allowedFields = [
      'name', 'category', 'category_id', 'price', 'original_price',
      'discount_percentage', 'discount_end_date', 'in_stock', 'stock',
      'description', 'short_description', 'image_url', 'is_featured',
      'is_on_sale', 'customizable', 'product_type', 'template_image',
      'has_variants', 'variant_type'
    ];

    // Build update object with only allowed fields
    const updates: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (productData[field] !== undefined) {
        updates[field] = productData[field];
      }
    }

    // Handle variant type detection if name changed
    if (productData.name) {
      const detectedVariantType = detectVariantType(productData.name);
      const hasVariants = detectedVariantType !== null && Array.isArray(variants) && variants.length > 0;
      updates.has_variants = hasVariants;
      updates.variant_type = hasVariants ? detectedVariantType : null;

      // Calculate total stock from variants if applicable
      if (hasVariants && variants) {
        updates.stock = variants.reduce((sum: number, v: VariantInput) => sum + (v.stock || 0), 0);
        // Set base price to default variant price or first variant price
        const defaultVariant = variants.find((v: VariantInput) => v.is_default) || variants[0];
        if (defaultVariant) {
          updates.price = defaultVariant.price;
        }
      }
    }

    if (Object.keys(updates).length === 0 && !variants) {
      return NextResponse.json({ error: 'No hay campos para actualizar' }, { status: 400 });
    }

    // Update product
    if (Object.keys(updates).length > 0) {
      const { error } = await db
        .from('products')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
    }

    // Handle variants update
    if (Array.isArray(variants)) {
      const detectedVariantType = detectVariantType(productData.name || '');

      // Get existing variant IDs
      const { data: existingVariants } = await db
        .from('product_variants')
        .select('id')
        .eq('product_id', id);

      const existingIds = new Set((existingVariants || []).map(v => v.id));
      const incomingIds = new Set(variants.filter((v: VariantInput) => v.id).map((v: VariantInput) => v.id));

      // Delete variants that were removed
      const toDelete = [...existingIds].filter(id => !incomingIds.has(id));
      if (toDelete.length > 0) {
        await db
          .from('product_variants')
          .delete()
          .in('id', toDelete);
      }

      // Update existing and insert new variants
      for (const variant of variants as VariantInput[]) {
        if (variant.id && existingIds.has(variant.id)) {
          // Update existing
          await db
            .from('product_variants')
            .update({
              variant_label: variant.label,
              price: variant.price,
              stock: variant.stock || 0,
              is_default: variant.is_default || false
            })
            .eq('id', variant.id);
        } else {
          // Insert new
          await db
            .from('product_variants')
            .insert({
              product_id: id,
              variant_type: detectedVariantType || updates.variant_type,
              variant_label: variant.label,
              price: variant.price,
              stock: variant.stock || 0,
              is_default: variant.is_default || false
            });
        }
      }
    }

    // Fetch updated product with variants
    const { data: updatedProduct } = await db
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    let productVariants = [];
    if (updatedProduct?.has_variants) {
      const { data: variantsData } = await db
        .from('product_variants')
        .select('*')
        .eq('product_id', id)
        .order('id', { ascending: true });
      productVariants = variantsData || [];
    }

    return NextResponse.json({ ...updatedProduct, variants: productVariants });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
