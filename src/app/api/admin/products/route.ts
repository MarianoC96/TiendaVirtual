import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            name,
            category_id,
            price,
            stock,
            is_featured,
            description,
            short_description,
            image_url
        } = body;

        // Validation
        if (!name || !price || !category_id) {
            return NextResponse.json(
                { error: 'Faltan campos requeridos (nombre, precio, categoría)' },
                { status: 400 }
            );
        }

        const { data: newProduct, error } = await db
            .from('products')
            .insert([
                {
                    name,
                    category_id,
                    price,
                    stock: stock || 0,
                    is_featured: is_featured || 0,
                    description,
                    short_description,
                    image_url
                }
            ])
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(newProduct);
    } catch (error) {
        console.error('Error creating product:', error);
        return NextResponse.json(
            { error: 'Error creating product' },
            { status: 500 }
        );
    }
}
