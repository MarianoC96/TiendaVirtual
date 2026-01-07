import { NextResponse } from 'next/server';
import db from '@/lib/db';
import '@/lib/seed';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);

    // Check if product exists
    const product = db.prepare('SELECT id FROM products WHERE id = ?').get(id);
    if (!product) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
    }

    // Delete the product
    db.prepare('DELETE FROM products WHERE id = ?').run(id);

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

    // Build dynamic update query
    const updates: string[] = [];
    const values: (string | number | null)[] = [];

    const allowedFields = [
      'name', 'category', 'category_id', 'price', 'original_price', 
      'discount_percentage', 'discount_end_date', 'in_stock', 'stock',
      'description', 'short_description', 'image_url', 'is_featured', 
      'is_on_sale', 'customizable', 'product_type', 'template_image'
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates.push(`${field} = ?`);
        values.push(body[field]);
      }
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No hay campos para actualizar' }, { status: 400 });
    }

    values.push(id);
    db.prepare(`UPDATE products SET ${updates.join(', ')} WHERE id = ?`).run(...values);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
