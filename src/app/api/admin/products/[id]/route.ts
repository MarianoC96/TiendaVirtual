import { NextResponse } from 'next/server';
import db from '@/lib/db';

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

    // Delete the product
    const { error } = await db
      .from('products')
      .delete()
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

    const allowedFields = [
      'name', 'category', 'category_id', 'price', 'original_price', 
      'discount_percentage', 'discount_end_date', 'in_stock', 'stock',
      'description', 'short_description', 'image_url', 'is_featured', 
      'is_on_sale', 'customizable', 'product_type', 'template_image'
    ];

    // Build update object with only allowed fields
    const updates: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No hay campos para actualizar' }, { status: 400 });
    }

    const { error } = await db
      .from('products')
      .update(updates)
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
