import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { code, cartTotal, items, userId, guestEmail } = await request.json();

    if (!code) {
      return NextResponse.json({ error: 'Código requerido' }, { status: 400 });
    }

    // 1. Fetch coupon
    const { data: coupon, error } = await db
      .from('coupons')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('active', true)
      .is('deleted_at', null) // Check not soft deleted
      .single();

    if (error || !coupon) {
      return NextResponse.json({ error: 'Cupón no válido o expirado' }, { status: 400 });
    }

    // 2. Check global max uses
    if (coupon.max_uses && coupon.uses >= coupon.max_uses) {
      return NextResponse.json({ error: 'Cupón agotado' }, { status: 400 });
    }

    // 3. Check expiration
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Cupón expirado' }, { status: 400 });
    }

    // 4. Check per-user limit
    if (coupon.usage_limit_per_user > 0) {
      // Build query conditions
      let query = db
        .from('orders')
        .select('id', { count: 'exact' })
        .eq('coupon_code', code.toUpperCase())
        .neq('status', 'cancelled'); // Don't count cancelled orders

      if (userId) {
        query = query.eq('user_id', userId);
      } else if (guestEmail) {
        query = query.eq('guest_email', guestEmail);
      } else {
        // If neither provided, we cannot enforce user limit technically, usually block or ignore.
        // For strictness, if coupon restricts per user, guest without id/email might be blocked?
        // Let's assume we need at least one identifier if limit exists.
        // But for safe failover if checking just valid code in cart before checkout:
        // We will skip this check if no user identifier provided during cart validation.
        // It will be enforced at order creation time potentially if passed.
      }

      if (userId || guestEmail) {
        const { count, error: countError } = await query;
        if (!countError && count !== null && count >= coupon.usage_limit_per_user) {
          return NextResponse.json({ error: 'Has alcanzado el límite de uso para este cupón' }, { status: 400 });
        }
      }
    }

    // 5. Calculate eligibility and discount amount based on rules
    let applicableTotal = 0;

    // Determine applicable total based on 'applies_to'
    if (coupon.applies_to === 'product') {
      // Filter items by product id
      const targetItems = items ? items.filter((i: any) => i.id === coupon.target_id) : [];
      if (targetItems.length === 0) {
        return NextResponse.json({ error: `Este cupón solo aplica al producto seleccionado` }, { status: 400 });
      }
      applicableTotal = targetItems.reduce((sum: number, i: any) => sum + (i.price * i.quantity), 0);

    } else if (coupon.applies_to === 'category') {
      // Filter items by category id
      // Note: items array usually comes from cart, might need category_id populated.
      // Assuming frontend sends items with category_id or we rely on backend fetch (backend fetch safer but slower here).
      // For now, assume items object contains category_id. 

      const targetItems = items ? items.filter((i: any) => i.category_id === coupon.target_id) : [];
      if (targetItems.length === 0) {
        return NextResponse.json({ error: `Este cupón solo aplica a productos de la categoría seleccionada` }, { status: 400 });
      }
      applicableTotal = targetItems.reduce((sum: number, i: any) => sum + (i.price * i.quantity), 0);

    } else {
      // Default: 'cart_value'
      applicableTotal = cartTotal;
    }

    // 6. Check minimum purchase on APPLICABLE total (or just cart total? Usually applicable often makes sense, but standard min_purchase usually refers to cart total)
    // Let's stick to CART TOTAL for min_purchase requirement as standard practice (spend X to get Y off specific item).
    if (coupon.min_purchase && cartTotal < coupon.min_purchase) {
      return NextResponse.json({
        error: `Compra mínima de S/ ${coupon.min_purchase.toFixed(2)} requerida`
      }, { status: 400 });
    }

    // 7. Calculate discount
    let discountAmount = 0;

    if (coupon.discount_type === 'percentage') {
      discountAmount = (applicableTotal * coupon.discount_value) / 100;
    } else {
      // Fixed amount
      // If fixed amount > applicable total, cap it at applicable total
      discountAmount = coupon.discount_value;
      if (discountAmount > applicableTotal) {
        discountAmount = applicableTotal;
      }
    }

    // 8. Global cap: Limit discount to 80% of CART total (security rail)
    const maxDiscount = cartTotal * 0.8;
    if (discountAmount > maxDiscount) {
      // Cap instead of erroring out? Or error? Code previously errored. 
      // Better UX might be to cap it, but preserving previous logic of erroring to be safe/strict.
      // User asked "limit discount to 80%".
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
      discount_amount: discountAmount,
      // Metadata for frontend to know what it applied to
      applies_to: coupon.applies_to,
      target_id: coupon.target_id
    });
  } catch (error) {
    console.error('Coupon validation error:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
