import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const deleted = searchParams.get('deleted') === 'true';

    // Build Query
    let query = db
      .from('categories')
      .select('*')
      .order(deleted ? 'deleted_at' : 'id', { ascending: false });

    if (deleted) {
      query = query.not('deleted_at', 'is', null);
    } else {
      query = query.is('deleted_at', null);
    }

    const { data: categories, error } = await query;

    if (error) throw error;

    // Get product counts and user names
    const enrichedCategories = await Promise.all(
      (categories || []).map(async (category) => {
        const { count } = await db
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('category_id', category.id);

        let creator_name = null;
        let deleter_name = null;

        if (category.created_by) {
          const { data: creator } = await db.from('users').select('name').eq('id', category.created_by).single();
          creator_name = creator?.name;
        }

        if (category.deleted_by && deleted) {
          // deleted_by is text in schema (migrated as such), but migth be ID string or Name string
          // Plan says "deleted_by TEXT". Let's assume we store Name directly or ID. 
          // Ideally store ID. If ID, fetch name. If name, use it.
          // implementation_plan said: "deleted_by TEXT".
          // Let's verify how discounts store it.
          // If store ID as text, try fetch. If text name, start with that.
          // Let's assume we store the ID as string.
          const deleterId = parseInt(category.deleted_by);
          if (!isNaN(deleterId)) {
            const { data: deleter } = await db.from('users').select('name').eq('id', deleterId).single();
            deleter_name = deleter?.name;
          } else {
            deleter_name = category.deleted_by;
          }
        }

        return {
          ...category,
          product_count: count || 0,
          creator_name,
          deleter_name
        };
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

    // TODO: Get user ID from session. Mocking Admin ID 1.
    const createdBy = 1;

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
        description: description || null,
        created_by: createdBy
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
