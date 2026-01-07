import { NextResponse } from 'next/server';
import db from '@/lib/db';
import '@/lib/seed';

export async function GET() {
  try {
    const categories = db.prepare(`
      SELECT 
        c.*,
        COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON p.category_id = c.id
      GROUP BY c.id
      ORDER BY c.id
    `).all();

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
    .trim()
    .replace(/\s+/g, '-'); // Replace spaces with dashes
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, icon, description } = body;

    if (!name || !icon) {
      return NextResponse.json({ error: 'Nombre e icono son requeridos' }, { status: 400 });
    }

    // Auto-generate slug from name
    let slug = generateSlug(name);
    
    // Check if slug already exists and make unique
    const existing = db.prepare('SELECT id FROM categories WHERE slug = ?').get(slug);
    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }

    const result = db.prepare(`
      INSERT INTO categories (name, icon, slug, description)
      VALUES (?, ?, ?, ?)
    `).run(name, icon, slug, description || null);

    return NextResponse.json({ 
      success: true, 
      id: result.lastInsertRowid,
      slug 
    });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
