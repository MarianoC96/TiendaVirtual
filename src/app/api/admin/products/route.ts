import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const deleted = searchParams.get('deleted') === 'true';

        // Filter non-deleted products by default, or deleted if requested
        let query = db
            .from('products')
            .select('*')
            .order(deleted ? 'deleted_at' : 'id', { ascending: false });

        if (deleted) {
            query = query.not('deleted_at', 'is', null);
        } else {
            query = query.is('deleted_at', null);
        }

        const { data: products, error } = await query;

        if (error) throw error;

        // Enrich with creator and deleter details
        const enrichedProducts = await Promise.all(
            (products || []).map(async (product) => {
                let creator_name = null;
                let deleter_name = null;

                if (product.created_by) {
                    const { data: creator } = await db
                        .from('users')
                        .select('name')
                        .eq('id', product.created_by)
                        .single();
                    creator_name = creator?.name;
                }

                if (deleted && product.deleted_by) {
                    const deleterId = parseInt(product.deleted_by);
                    if (!isNaN(deleterId)) {
                        const { data: deleter } = await db.from('users').select('name').eq('id', deleterId).single();
                        deleter_name = deleter?.name;
                    } else {
                        deleter_name = product.deleted_by;
                    }
                }

                // Get category name if not present (optimization: consider joining in query)
                // For now, let's keep it simple as frontend fetches categories too, 
                // but enriching here is safer for standalone usage.
                let category_name = product.category;
                if (!category_name && product.category_id) {
                    const { data: cat } = await db.from('categories').select('name').eq('id', product.category_id).single();
                    category_name = cat?.name;
                }

                return { ...product, creator_name, deleter_name, category: category_name };
            })
        );

        return NextResponse.json(enrichedProducts);
    } catch (error) {
        console.error('Error fetching products:', error);
        return NextResponse.json(
            { error: 'Error fetching products' },
            { status: 500 }
        );
    }
}

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

        // TODO: Get user ID from session. Mocking Admin ID 1.
        const createdBy = 1;

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
                    image_url,
                    created_by: createdBy
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
