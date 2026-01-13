import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { detectVariantType } from '@/lib/variants';

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
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '50');
        const includeVariants = searchParams.get('includeVariants') !== 'false'; // Default true

        const offset = (page - 1) * limit;

        // Build base query with pagination
        let query = db
            .from('products')
            .select('*, categories(name)', { count: 'exact' })
            .order(deleted ? 'deleted_at' : 'id', { ascending: false })
            .range(offset, offset + limit - 1);

        if (deleted) {
            query = query.not('deleted_at', 'is', null);
        } else {
            query = query.is('deleted_at', null);
        }

        const { data: products, error, count } = await query;

        if (error) throw error;

        if (!products || products.length === 0) {
            return NextResponse.json({
                products: [],
                pagination: { page, limit, total: 0, totalPages: 0 }
            });
        }

        // Batch fetch user names (avoid N+1 queries)
        const userIds = new Set<number>();
        products.forEach(p => {
            if (p.created_by) userIds.add(p.created_by);
            if (deleted && p.deleted_by && !isNaN(parseInt(p.deleted_by))) {
                userIds.add(parseInt(p.deleted_by));
            }
        });

        let usersMap: Record<number, string> = {};
        if (userIds.size > 0) {
            const { data: users } = await db
                .from('users')
                .select('id, name')
                .in('id', Array.from(userIds));

            users?.forEach(u => { usersMap[u.id] = u.name; });
        }

        // Batch fetch variants for products that have them (avoid N+1 queries)
        let variantsMap: Record<number, any[]> = {};
        if (includeVariants) {
            const productIdsWithVariants = products
                .filter(p => p.has_variants)
                .map(p => p.id);

            if (productIdsWithVariants.length > 0) {
                const { data: allVariants } = await db
                    .from('product_variants')
                    .select('*')
                    .in('product_id', productIdsWithVariants)
                    .order('id', { ascending: true });

                allVariants?.forEach(v => {
                    if (!variantsMap[v.product_id]) variantsMap[v.product_id] = [];
                    variantsMap[v.product_id].push(v);
                });
            }
        }

        // Enrich products with cached data
        const enrichedProducts = products.map(product => {
            const category = product.categories?.name || product.category;
            const creator_name = product.created_by ? usersMap[product.created_by] || null : null;
            let deleter_name = null;

            if (deleted && product.deleted_by) {
                const deleterId = parseInt(product.deleted_by);
                deleter_name = !isNaN(deleterId) ? usersMap[deleterId] : product.deleted_by;
            }

            const variants = product.has_variants ? (variantsMap[product.id] || []) : [];

            // Remove nested categories object
            const { categories, ...rest } = product;

            return { ...rest, category, creator_name, deleter_name, variants };
        });

        return NextResponse.json({
            products: enrichedProducts,
            pagination: {
                page,
                limit,
                total: count || 0,
                totalPages: Math.ceil((count || 0) / limit)
            }
        });
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
