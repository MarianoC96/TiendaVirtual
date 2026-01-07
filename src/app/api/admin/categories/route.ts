import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const { data: categories, error } = await db
      .from('categories')
      .select('*')
      .order('id');

    if (error) throw error;

    // Get product counts for each category
    const enrichedCategories = await Promise.all(
      (categories || []).map(async (category) => {
        const { count } = await db
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('category_id', category.id);
        
        return { ...category, product_count: count || 0 };
      })
    );

    return NextResponse.json(enrichedCategories);
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
    const { data: existing } = await db
      .from('categories')
      .select('id')
      .eq('slug', slug)
      .single();

    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }

    const { data, error } = await db
      .from('categories')
      .insert({
        name,
        icon,
        slug,
        description: description || null
      })
      .select('id')
      .single();

    if (error) throw error;

    return NextResponse.json({ 
      success: true, 
      id: data?.id,
      slug 
    });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
