import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const { data: discounts, error } = await db
      .from('discounts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Enrich with target names
    const enrichedDiscounts = await Promise.all(
      (discounts || []).map(async (discount: { applies_to: string; target_id: number; created_by: number | null }) => {
        let target_name = null;
        let creator_name = null;

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

        return { ...discount, target_name, creator_name };
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
