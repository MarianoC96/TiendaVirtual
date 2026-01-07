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
    const { active } = body;

    if (typeof active !== 'boolean' && typeof active !== 'number') {
      return NextResponse.json({ error: 'Campo active requerido' }, { status: 400 });
    }

    const { error } = await db
      .from('discounts')
      .update({ active: Boolean(active) })
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating discount:', error);
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

    const { error } = await db
      .from('discounts')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting discount:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
