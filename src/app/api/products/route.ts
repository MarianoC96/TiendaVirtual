import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { checkDiscountActivePeru } from '@/lib/timezone';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const categoria = searchParams.get('categoria');

    let supabaseQuery = db
      .from('products')
      .select(`
        *,
        categories!inner(name)
      `)
      .order('is_featured', { ascending: false })
      .order('total_sold', { ascending: false });

    if (query) {
      supabaseQuery = supabaseQuery.or(`name.ilike.%${query}%,description.ilike.%${query}%`);
    }

    if (categoria) {
      supabaseQuery = supabaseQuery.eq('category', categoria);
    }

    const { data: products, error } = await supabaseQuery;

    if (error) throw error;

    // Obtener descuentos activos para aplicar
    const { data: discounts } = await db
      .from('discounts')
      .select('*')
      .eq('active', true);

    // Transformar para que coincida con el formato esperado y aplicar descuentos
    const transformedProducts = products?.map(p => {
      // Encontrar el mejor descuento aplicable
      // El precio base es el precio del producto
      // Verificación inicial: si el producto tiene discount_percentage interno, considérelo candidato para finalPrice
      let finalPrice = p.price;
      let appliedDiscount = null;

      if (p.discount_percentage > 0) {
        finalPrice = p.price * (1 - p.discount_percentage / 100);
      }

      const applicableDiscounts = discounts?.filter(d => {
        // Verificaciones de fecha
        if (!checkDiscountActivePeru(d.start_date, d.end_date)) return false;

        // Verificaciones de destino
        if (d.applies_to === 'product' && d.target_id === p.id) return true;
        if (d.applies_to === 'category' && d.target_id === p.category_id) return true;

        return false;
      }) || [];

      // Comparar con descuentos externos de la tabla 'discounts'
      for (const d of applicableDiscounts) {
        let tempPrice = p.price;
        if (d.discount_type === 'percentage') {
          tempPrice = p.price * (1 - d.discount_value / 100);
        } else {
          tempPrice = Math.max(0, p.price - d.discount_value);
        }

        if (tempPrice < finalPrice) {
          finalPrice = tempPrice;
          appliedDiscount = d;
        }
      }

      const isOnSale = finalPrice < p.price;
      const discountPercentage = isOnSale
        ? Math.round(((p.price - finalPrice) / p.price) * 100)
        : 0;

      return {
        ...p,
        category_name: p.categories?.name,
        price: finalPrice, // Precio de venta actual
        original_price: isOnSale ? p.price : null, // Mostrar original solo si tiene descuento
        discount_percentage: discountPercentage,
        is_on_sale: isOnSale,
        discount_end_date: appliedDiscount?.end_date || null
      };
    }) || [];

    return NextResponse.json(transformedProducts);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    return NextResponse.json({ error: 'Error al obtener productos' }, { status: 500 });
  }
}
