import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { code, cartTotal } = await request.json();

    if (!code) {
      return NextResponse.json({ error: 'Código requerido' }, { status: 400 });
    }

    const { data: coupon, error } = await db
      .from('coupons')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('active', true)
      .single();

    if (error || !coupon) {
      return NextResponse.json({ error: 'Cupón no válido o expirado' }, { status: 400 });
    }

    // Check minimum purchase
    if (coupon.min_purchase && cartTotal < coupon.min_purchase) {
      return NextResponse.json({ 
        error: `Compra mínima de S/ ${coupon.min_purchase.toFixed(2)} requerida` 
      }, { status: 400 });
    }

    // Check max uses
    if (coupon.max_uses && coupon.uses >= coupon.max_uses) {
      return NextResponse.json({ error: 'Cupón agotado' }, { status: 400 });
    }

    // Check expiration
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Cupón expirado' }, { status: 400 });
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discount_type === 'percentage') {
      discountAmount = (cartTotal * coupon.discount_value) / 100;
    } else {
      discountAmount = coupon.discount_value;
    }

    // Limit discount to 80% of cart total
    const maxDiscount = cartTotal * 0.8;
    if (discountAmount > maxDiscount) {
      return NextResponse.json({ 
        error: `El descuento no puede superar el 80% del total (máximo S/ ${maxDiscount.toFixed(2)})` 
      }, { status: 400 });
    }

    return NextResponse.json({
      valid: true,
      code: coupon.code,
      name: coupon.name,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      discount_amount: discountAmount
    });
  } catch (error) {
    console.error('Coupon validation error:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
