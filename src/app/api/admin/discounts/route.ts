import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const deleted = searchParams.get('deleted') === 'true';

    let query = db
      .from('discounts')
      .select('*')
      .order(deleted ? 'deleted_at' : 'created_at', { ascending: false });

    if (deleted) {
      query = query.not('deleted_at', 'is', null);
    } else {
      query = query.is('deleted_at', null);
    }

    const { data: discounts, error } = await query;

    if (error) throw error;

    // Fetch orders to calculate usage counts
    // Optimize: only fetch field discount_info where it is not null
    const { data: ordersWithDiscounts, error: ordersError } = await db
      .from('orders')
      .select('discount_info')
      .not('discount_info', 'is', null);

    if (ordersError) {
      console.error('Error fetching orders for discount stats:', ordersError);
    }

    const usageMap = new Map<number, number>();

    if (ordersWithDiscounts) {
      ordersWithDiscounts.forEach((order: any) => {
        const di = order.discount_info;
        if (!di) return;

        // Cart discount
        if (di.cart_discount && di.cart_discount.id) {
          const id = di.cart_discount.id;
          usageMap.set(id, (usageMap.get(id) || 0) + 1);
        }

        // Product discounts
        if (Array.isArray(di.product_discounts)) {
          const seenInOrder = new Set<number>();
          di.product_discounts.forEach((pd: any) => {
            if (pd.discount_id && !seenInOrder.has(pd.discount_id)) {
              seenInOrder.add(pd.discount_id);
              usageMap.set(pd.discount_id, (usageMap.get(pd.discount_id) || 0) + 1);
            }
          });
        }

        // Category discounts
        if (Array.isArray(di.category_discounts)) {
          const seenInOrder = new Set<number>();
          di.category_discounts.forEach((cd: any) => {
            if (cd.discount_id && !seenInOrder.has(cd.discount_id)) {
              seenInOrder.add(cd.discount_id);
              usageMap.set(cd.discount_id, (usageMap.get(cd.discount_id) || 0) + 1);
            }
          });
        }
      });
    }

    // Enrich with target names and usage count
    const enrichedDiscounts = await Promise.all(
      (discounts || []).map(async (discount: { id: number; applies_to: string; target_id: number; created_by: number | null; deleted_by?: string }) => {
        let target_name = null;
        let creator_name = null;
        let deleter_name = null;

        if (discount.applies_to === 'product') {
          const { data: product } = await db
            .from('products')
            .select('name')
            .eq('id', discount.target_id)
            .single();
          target_name = product?.name;
        } else if (discount.applies_to === 'category') {
          const { data: category } = await db
            .from('categories')
            .select('name')
            .eq('id', discount.target_id)
            .single();
          target_name = category?.name;
        } else if (discount.applies_to === 'cart_value') {
          target_name = `Carrito ≥ S/ ${discount.target_id}`;
        }

        if (discount.created_by) {
          const { data: creator } = await db
            .from('users')
            .select('name')
            .eq('id', discount.created_by)
            .single();
          creator_name = creator?.name;
        }

        if (deleted && discount.deleted_by) {
          const deleterId = parseInt(discount.deleted_by);
          if (!isNaN(deleterId)) {
            const { data: deleter } = await db.from('users').select('name').eq('id', deleterId).single();
            deleter_name = deleter?.name;
          } else {
            deleter_name = discount.deleted_by;
          }
        }

        return {
          ...discount,
          target_name,
          creator_name,
          deleter_name,
          usage_count: usageMap.get(discount.id) || 0
        };
      })
    );

    return NextResponse.json(enrichedDiscounts);
  } catch (error) {
    console.error('Error fetching discounts:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, discount_type, discount_value, applies_to, target_id, start_date, end_date } = body;

    // TODO: Get user ID from session - for now use admin ID 1
    const createdBy = 1;

    // Validate required fields - cart_value doesn't need target_id validation
    if (!name || !discount_type || !discount_value || !applies_to) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
    }

    // Validate 80% max for percentage discounts
    if (discount_type === 'percentage' && discount_value > 80) {
      return NextResponse.json({
        error: 'El descuento porcentual no puede superar el 80%'
      }, { status: 400 });
    }

    // Validate target exists (for product/category types)
    if (applies_to === 'product') {
      if (!target_id) {
        return NextResponse.json({ error: 'Debes seleccionar un producto' }, { status: 400 });
      }
      const { data: product } = await db
        .from('products')
        .select('id')
        .eq('id', target_id)
        .single();
      if (!product) {
        return NextResponse.json({ error: 'Producto no encontrado' }, { status: 400 });
      }
    } else if (applies_to === 'category') {
      if (!target_id) {
        return NextResponse.json({ error: 'Debes seleccionar una categoría' }, { status: 400 });
      }
      const { data: category } = await db
        .from('categories')
        .select('id')
        .eq('id', target_id)
        .single();
      if (!category) {
        return NextResponse.json({ error: 'Categoría no encontrada' }, { status: 400 });
      }
    } else if (applies_to === 'cart_value') {
      // For cart_value, target_id stores the minimum cart value
      if (!target_id || target_id <= 0) {
        return NextResponse.json({ error: 'El valor mínimo del carrito debe ser mayor a 0' }, { status: 400 });
      }
    }

    const { data, error } = await db
      .from('discounts')
      .insert({
        name,
        discount_type,
        discount_value,
        applies_to,
        target_id,
        start_date: start_date || null,
        end_date: end_date || null,
        created_by: createdBy,
        active: true
      })
      .select('id')
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      id: data?.id
    });
  } catch (error) {
    console.error('Error creating discount:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
