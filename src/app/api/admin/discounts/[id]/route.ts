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
    const { active } = body;

    if (typeof active !== 'number') {
      return NextResponse.json({ error: 'Campo active requerido' }, { status: 400 });
    }

    db.prepare('UPDATE discounts SET active = ? WHERE id = ?').run(active, id);

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
    db.prepare('DELETE FROM discounts WHERE id = ?').run(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting discount:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
