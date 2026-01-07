import { NextResponse } from 'next/server';
import db from '@/lib/db';
import '@/lib/seed';

interface Category {
  id: number;
  name: string;
  icon: string;
  slug: string;
  description: string | null;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);

    // Get original category
    const original = db.prepare('SELECT * FROM categories WHERE id = ?').get(id) as Category | undefined;
    
    if (!original) {
      return NextResponse.json({ error: 'Categoría no encontrada' }, { status: 404 });
    }

    // Create new name and slug with "(Copia)" suffix
    const newName = `${original.name} (Copia)`;
    let newSlug = `${original.slug}-copia`;
    
    // Ensure slug is unique
    let counter = 1;
    while (db.prepare('SELECT id FROM categories WHERE slug = ?').get(newSlug)) {
      newSlug = `${original.slug}-copia-${counter}`;
      counter++;
    }

    const result = db.prepare(`
      INSERT INTO categories (name, icon, slug, description)
      VALUES (?, ?, ?, ?)
    `).run(newName, original.icon, newSlug, original.description);

    return NextResponse.json({ 
      success: true, 
      id: result.lastInsertRowid,
      name: newName,
      slug: newSlug
    });
  } catch (error) {
    console.error('Error cloning category:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
