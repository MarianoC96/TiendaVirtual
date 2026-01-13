import { NextResponse } from 'next/server';
import db from '@/lib/db';

// Helper to detect variant type from product name
function detectVariantType(name: string): 'size' | 'capacity' | 'dimensions' | null {
    const n = name.toLowerCase();
    if (n.includes('polo') || n.includes('polos')) return 'size';
    if (n.includes('taza') || n.includes('tazas') || n.includes('termo') || n.includes('termos')) return 'capacity';
    if (n.includes('caja') || n.includes('cajas')) return 'dimensions';
    return null;
}

interface VariantInput {
    label: string;
    price: number;
    stock: number;
    is_default?: boolean;
}

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

        // Enrich with creator, deleter details, and variants
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

                // Get category name if not present
                let category_name = product.category;
                if (!category_name && product.category_id) {
                    const { data: cat } = await db.from('categories').select('name').eq('id', product.category_id).single();
                    category_name = cat?.name;
                }

                // Get variants if product has them
                let variants = [];
                if (product.has_variants) {
                    const { data: variantsData } = await db
                        .from('product_variants')
                        .select('*')
                        .eq('product_id', product.id)
                        .order('id', { ascending: true });
                    variants = variantsData || [];
                }

                return { ...product, creator_name, deleter_name, category: category_name, variants };
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
            image_url,
            variants // Array of { label, price, stock, is_default }
        } = body;

        // Validation
        if (!name || !category_id) {
            return NextResponse.json(
                { error: 'Faltan campos requeridos (nombre, categoría)' },
                { status: 400 }
            );
        }

        // Detect if product should have variants based on name
        const detectedVariantType = detectVariantType(name);
        const hasVariants = detectedVariantType !== null && Array.isArray(variants) && variants.length > 0;

        // Calculate total stock from variants if applicable
        let totalStock = stock || 0;
        let basePrice = price || 0;

        if (hasVariants && variants) {
            totalStock = variants.reduce((sum: number, v: VariantInput) => sum + (v.stock || 0), 0);
            // Set base price to default variant price or first variant price
            const defaultVariant = variants.find((v: VariantInput) => v.is_default) || variants[0];
            if (defaultVariant) {
                basePrice = defaultVariant.price;
            }
        }

        // Validate we have a price
        if (!basePrice && basePrice !== 0) {
            return NextResponse.json(
                { error: 'Falta el precio del producto' },
                { status: 400 }
            );
        }

        // TODO: Get user ID from session. Mocking Admin ID 1.
        const createdBy = 1;

        // Fetch category name from category_id
        const { data: categoryData } = await db
            .from('categories')
            .select('name')
            .eq('id', category_id)
            .single();

        const categoryName = categoryData?.name || 'Sin categoría';

        // Build product data - start with basic fields
        const productData: Record<string, unknown> = {
            name,
            category_id,
            category: categoryName, // Include category name for the NOT NULL constraint
            price: basePrice,
            stock: totalStock,
            is_featured: is_featured || 0,
            description,
            short_description,
            image_url,
            created_by: createdBy
        };

        // Try with variant columns first
        if (hasVariants) {
            productData.has_variants = true;
            productData.variant_type = detectedVariantType;
        }

        let newProduct;
        let productError;

        // First attempt with variant columns
        const result = await db
            .from('products')
            .insert([productData])
            .select()
            .single();

        newProduct = result.data;
        productError = result.error;

        // If error mentions has_variants or variant_type column, retry without them
        if (productError && (
            productError.message?.includes('has_variants') ||
            productError.message?.includes('variant_type')
        )) {
            console.log('Variant columns not found, retrying without them. Run the migration: 012_product_variants.sql');
            delete productData.has_variants;
            delete productData.variant_type;

            const retryResult = await db
                .from('products')
                .insert([productData])
                .select()
                .single();

            newProduct = retryResult.data;
            productError = retryResult.error;
        }

        if (productError) throw productError;

        // Create variants if applicable (only if product_variants table exists)
        if (hasVariants && newProduct && variants) {
            const variantRecords = variants.map((v: VariantInput) => ({
                product_id: newProduct.id,
                variant_type: detectedVariantType,
                variant_label: v.label,
                price: v.price,
                stock: v.stock || 0,
                is_default: v.is_default || false
            }));

            const { error: variantError } = await db
                .from('product_variants')
                .insert(variantRecords);

            if (variantError) {
                // If product_variants table doesn't exist, warn but don't fail
                if (variantError.message?.includes('product_variants')) {
                    console.warn('Variants table not found. Run migration: 012_product_variants.sql');
                } else {
                    console.error('Error creating variants:', variantError);
                }
            }
        }

        // Fetch the product with its variants to return
        let productWithVariants = { ...newProduct, variants: [] as Record<string, unknown>[] };
        if (hasVariants && newProduct) {
            const { data: createdVariants } = await db
                .from('product_variants')
                .select('*')
                .eq('product_id', newProduct.id);
            productWithVariants.variants = createdVariants || [];
        }

        return NextResponse.json(productWithVariants);
    } catch (error) {
        console.error('Error creating product:', error);
        // Get more details from the error
        let errorMessage = 'Error creating product';
        if (error instanceof Error) {
            errorMessage = error.message;
        } else if (typeof error === 'object' && error !== null) {
            errorMessage = JSON.stringify(error);
        }
        return NextResponse.json(
            { error: errorMessage, details: String(error) },
            { status: 500 }
        );
    }
}
