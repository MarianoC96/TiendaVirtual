import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { checkDiscountActivePeru } from '@/lib/timezone';

interface Discount {
    id: number;
    name: string;
    discount_type: string;
    discount_value: number;
    applies_to: string;
    target_id: number;
    active: boolean;
}

interface SupabaseProduct {
    id: number;
    name: string;
    price: number;
    category_id: number;
    discount_percentage: number;
    categories?: {
        name: string;
    };
    // other fields we just spread, but these are needed for logic
}

export async function GET() {
    try {
        const nowIso = new Date().toISOString();
        const now = new Date();

        // 1. Obtener descuentos activos (Basados en Categoría y Producto)
        // Filtrar activos, no eliminados. Filtramos por fecha en JS para asegurar consistencia con la API de productos
        const { data: discounts, error: discountError } = await db
            .from('discounts')
            .select('*')
            .eq('active', true)
            .is('deleted_at', null);

        if (discountError) throw discountError;

        const activeDiscounts = (discounts || []) as any[];
        const categoryDiscounts = activeDiscounts.filter(d => d.applies_to === 'category');

        // 2. Obtener todos los productos con sus categorías
        const { data: products, error: productError } = await db
            .from('products')
            .select(`
                *,
                categories!inner(id, name, slug)
            `);

        if (productError) throw productError;

        // Función auxiliar para validación de fechas
        const isValidDate = (d: any) => {
            // Corregir problema de offset de zona horaria. "2026-01-14" debería durar hasta 23:59:59 Hora Perú (-05:00)
            // El servidor podría ser UTC.
            const startDate = d.start_date;
            const endDate = d.end_date;

            // Agregamos -05:00 para forzar el análisis como hora de Perú
            // Si d.start_date es "2026-11-01", queremos "2026-11-01T00:00:00-05:00"

            const checkStart = !startDate ||
                (startDate.length === 10
                    ? now >= new Date(`${startDate}T00:00:00-05:00`)
                    : now >= new Date(startDate));

            const checkEnd = !endDate ||
                (endDate.length === 10
                    ? now <= new Date(`${endDate}T23:59:59-05:00`)
                    : now <= new Date(endDate));

            return checkStart && checkEnd;
        };

        // 3. Preparar Banners para Descuentos de Categoría
        const enrichedBanners = await Promise.all(categoryDiscounts.map(async (d) => {
            if (!checkDiscountActivePeru(d.start_date, d.end_date)) return null;

            const { data: cat } = await db
                .from('categories')
                .select('name, slug, icon')
                .eq('id', d.target_id)
                .single();

            return {
                ...d,
                category: cat
            };
        }));

        const validBanners = enrichedBanners.filter(b => b !== null);

        // 4. Procesar productos para encontrar ofertas y calcular el mejor precio
        const productsList = products as any[];

        const offerProducts = productsList.map((product: SupabaseProduct) => {
            let bestDiscount = null;
            let discountLabel = null;

            // A. Descuento heredado (Directamente en la tabla de productos)
            if (product.discount_percentage > 0) {
                bestDiscount = {
                    amount: (product.price * product.discount_percentage) / 100,
                    type: 'percentage',
                    value: product.discount_percentage
                };
                discountLabel = `${product.discount_percentage}% OFF`;
            }

            // B. Tabla de Descuentos Activos (Categoría)
            const catDiscount = categoryDiscounts.find(d =>
                d.target_id === product.category_id &&
                checkDiscountActivePeru(d.start_date, d.end_date)
            );
            if (catDiscount) {
                let amount = 0;
                if (catDiscount.discount_type === 'percentage') {
                    amount = (product.price * catDiscount.discount_value) / 100;
                } else {
                    amount = catDiscount.discount_value;
                }

                // Mantener el mejor descuento encontrado hasta ahora
                if (!bestDiscount || amount > bestDiscount.amount) {
                    bestDiscount = {
                        id: catDiscount.id,
                        applies_to: 'category',
                        amount,
                        type: catDiscount.discount_type,
                        value: catDiscount.discount_value
                    };
                    discountLabel = catDiscount.name; // ej. "Verano 2026"
                }
            }

            // C. Tabla de Descuentos Activos (Específico del producto)
            const prodDiscount = activeDiscounts.find(d =>
                d.applies_to === 'product' &&
                d.target_id === product.id &&
                checkDiscountActivePeru(d.start_date, d.end_date)
            );
            if (prodDiscount) {
                let amount = 0;
                if (prodDiscount.discount_type === 'percentage') {
                    amount = (product.price * prodDiscount.discount_value) / 100;
                } else {
                    amount = prodDiscount.discount_value;
                }

                if (!bestDiscount || amount > bestDiscount.amount) {
                    bestDiscount = {
                        id: prodDiscount.id,
                        applies_to: 'product',
                        amount,
                        type: prodDiscount.discount_type,
                        value: prodDiscount.discount_value
                    };
                    discountLabel = prodDiscount.name;
                }
            }

            // Si el producto tiene un descuento, incluirlo
            if (bestDiscount && bestDiscount.amount > 0) {
                // Asegurar que tenemos un porcentaje válido para la etiqueta de la interfaz
                let percentage = 0;
                if (bestDiscount.type === 'percentage') {
                    percentage = bestDiscount.value;
                } else {
                    percentage = Math.round((bestDiscount.amount / product.price) * 100);
                }

                return {
                    ...product,
                    category_name: product.categories?.name,
                    final_price: product.price - bestDiscount.amount,
                    discount_percentage: percentage, // Crítico para la nueva etiqueta de UI
                    discount_info: {
                        ...bestDiscount,
                        label: discountLabel
                    }
                };
            }
            return null; // Sin oferta
        }).filter((p: any) => p !== null);

        return NextResponse.json({
            products: offerProducts,
            banners: validBanners
        });

    } catch (error) {
        console.error('Error al obtener ofertas:', error);
        return NextResponse.json({ error: 'Error al obtener ofertas' }, { status: 500 });
    }
}
