import { NextResponse } from 'next/server';
import db from '@/lib/db';

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
    const { data: original, error: fetchError } = await db
      .from('categories')
      .select('*')
      .eq('id', id)
      .single();
    
    if (fetchError || !original) {
      return NextResponse.json({ error: 'Categoría no encontrada' }, { status: 404 });
    }

    // Create new name and slug with "(Copia)" suffix
    const newName = `${original.name} (Copia)`;
    let newSlug = `${original.slug}-copia`;
    
    // Ensure slug is unique
    let counter = 1;
    let slugExists = true;
    while (slugExists) {
      const { data: existing } = await db
        .from('categories')
        .select('id')
        .eq('slug', newSlug)
        .single();
      
      if (!existing) {
        slugExists = false;
      } else {
        newSlug = `${original.slug}-copia-${counter}`;
        counter++;
      }
    }

    const { data, error } = await db
      .from('categories')
      .insert({
        name: newName,
        icon: original.icon,
        slug: newSlug,
        description: original.description
      })
      .select('id')
      .single();

    if (error) throw error;

    return NextResponse.json({ 
      success: true, 
      id: data?.id,
      name: newName,
      slug: newSlug
    });
  } catch (error) {
    console.error('Error cloning category:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
