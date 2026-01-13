import { NextResponse } from 'next/server';
import db from '@/lib/db';

// GET: Fetch variants for a product (public endpoint for client)
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: idParam } = await params;
        const productId = parseInt(idParam);

        // Verify product exists and has variants
        const { data: product, error: productError } = await db
            .from('products')
            .select('id, has_variants, variant_type')
            .eq('id', productId)
            .is('deleted_at', null)
            .single();

        if (productError || !product) {
            return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
        }

        if (!product.has_variants) {
            return NextResponse.json([]);
        }

        // Fetch variants
        const { data: variants, error } = await db
            .from('product_variants')
            .select('id, variant_type, variant_label, price, stock, is_default')
            .eq('product_id', productId)
            .order('id', { ascending: true });

        if (error) throw error;

        // Transform for client use
        const clientVariants = (variants || []).map(v => ({
            id: v.id,
            type: v.variant_type,
            label: v.variant_label,
            price: v.price,
            stock: v.stock,
            is_default: v.is_default,
            in_stock: v.stock > 0
        }));

        return NextResponse.json(clientVariants);
    } catch (error) {
        console.error('Error fetching variants:', error);
        return NextResponse.json({ error: 'Error al obtener variantes' }, { status: 500 });
    }
}
