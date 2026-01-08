import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    const body = await request.json();
    const { name, icon, slug, description } = body;

    // Build update object
    const updates: Record<string, string | null> = {};

    if (name !== undefined) updates.name = name;
    if (icon !== undefined) updates.icon = icon;
    if (description !== undefined) updates.description = description;

    if (slug !== undefined) {
      // Check slug uniqueness
      const { data: existing } = await db
        .from('categories')
        .select('id')
        .eq('slug', slug)
        .neq('id', id)
        .single();

      if (existing) {
        return NextResponse.json({ error: 'El slug ya existe' }, { status: 400 });
      }
      updates.slug = slug;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No hay campos para actualizar' }, { status: 400 });
    }

    const { error } = await db
      .from('categories')
      .update(updates)
      .eq('id', id);

    if (error) throw error;

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
    const { count: productCount } = await db
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', id);

    if (productCount && productCount > 0) {
      return NextResponse.json({
        error: `No se puede eliminar: hay ${productCount} producto(s) en esta categoría`
      }, { status: 400 });
    }

    // Soft delete
    const deletedBy = "1"; // Mock Admin ID

    const { error } = await db
      .from('categories')
      .update({
        deleted_at: new Date().toISOString(),
        deleted_by: deletedBy
      })
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
