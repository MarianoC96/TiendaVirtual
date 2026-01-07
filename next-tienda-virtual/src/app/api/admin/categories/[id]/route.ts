import { NextResponse } from 'next/server';
import db from '@/lib/db';
import '@/lib/seed';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    const body = await request.json();
    const { name, icon, slug, description } = body;

    // Build dynamic update query
    const updates: string[] = [];
    const values: (string | number)[] = [];

    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name);
    }
    if (icon !== undefined) {
      updates.push('icon = ?');
      values.push(icon);
    }
    if (slug !== undefined) {
      // Check slug uniqueness
      const existing = db.prepare('SELECT id FROM categories WHERE slug = ? AND id != ?').get(slug, id);
      if (existing) {
        return NextResponse.json({ error: 'El slug ya existe' }, { status: 400 });
      }
      updates.push('slug = ?');
      values.push(slug);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No hay campos para actualizar' }, { status: 400 });
    }

    values.push(id);
    db.prepare(`UPDATE categories SET ${updates.join(', ')} WHERE id = ?`).run(...values);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating category:', error);
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

    // Check if category has products
    const productCount = db.prepare('SELECT COUNT(*) as count FROM products WHERE category_id = ?').get(id) as { count: number };
    
    if (productCount.count > 0) {
      return NextResponse.json({ 
        error: `No se puede eliminar: hay ${productCount.count} producto(s) en esta categoría` 
      }, { status: 400 });
    }

    db.prepare('DELETE FROM categories WHERE id = ?').run(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
