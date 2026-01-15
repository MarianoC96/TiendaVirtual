import { NextResponse } from 'next/server';
import db from '@/lib/db';

interface OrderItem {
  product: {
    id: number;
    name: string;
    price: number;
    customization?: unknown;
  };
  quantity: number;
}

// GET: Listar pedidos (filtrados por userId si se proporciona)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    let query = db
      .from('orders')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data: orders, error } = await query;

    if (error) throw error;

    return NextResponse.json(orders || []);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Error al obtener pedidos' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    console.log('=== ORDER API: Starting ===');

    const body = await request.json();
    console.log('=== ORDER API: Body received ===', JSON.stringify(body).substring(0, 200));

    const {
      userId,
      guestName,
      guestEmail,
      guestPhone,
      shippingAddress,
      paymentMethod,
      contactNumber,
      items,
      subtotal,
      discount,
      total,
      couponCode,
      discountInfo
    } = body;

    console.log('=== ORDER API: Parsed data ===', { userId, guestName, paymentMethod, contactNumber, itemsCount: items?.length });

    // Generate unique order code (MAE{YEAR}XXXXX format, e.g. MAE202600001)
    const currentYear = new Date().getFullYear();
    const prefix = `MAE${currentYear}`;

    // Get the last order with the current year prefix to determine next code number
    const { data: lastOrder } = await db
      .from('orders')
      .select('order_code')
      .like('order_code', `${prefix}%`)
      .order('order_code', { ascending: false })
      .limit(1)
      .single();

    let nextNumber = 1;
    if (lastOrder?.order_code) {
      // Extract number part after the prefix (MAE2026)
      const lastNumber = parseInt(lastOrder.order_code.replace(prefix, ''));
      if (!isNaN(lastNumber)) {
        nextNumber = lastNumber + 1;
      }
    }
    const orderCode = `${prefix}${nextNumber.toString().padStart(5, '0')}`;

    // Clean items - remove large base64 data to prevent database overflow
    const cleanedItems = items.map((item: OrderItem & { product: any }) => ({
      product: {
        id: item.product.id,
        name: item.product.name,
        price: item.product.price,
        original_price: item.product.original_price,
        discount_info: item.product.discount_info,
        // Keep only a flag for customization, not the actual base64 data
        hasCustomization: !!item.product.customization
      },
      quantity: item.quantity
    }));

    // Create order
    const orderData: Record<string, unknown> = {
      order_code: orderCode,
      user_id: userId || null,
      guest_email: guestEmail || null,
      guest_name: guestName || null,
      guest_phone: guestPhone || null,
      shipping_address: shippingAddress || null,
      payment_method: paymentMethod,
      contact_number: contactNumber || null,
      items_json: cleanedItems,
      customization_json: null,
      subtotal,
      discount: discount || 0,
      total,
      coupon_code: couponCode || null,
      discount_info: discountInfo || null, // Enable saving discount info
      status: 'pending'
    };

    let order;
    let orderError;

    // Try to create order
    const result = await db
      .from('orders')
      .insert(orderData)
      .select('id')
      .single();

    order = result.data;
    orderError = result.error;

    // If error is about discount_info column (e.g. if it doesn't exist or is too small), retry without it
    if (orderError && orderError.message?.includes('discount_info')) {
      console.warn('Failed to save discount_info, retrying without it:', orderError.message);
      delete orderData.discount_info;
      const retryResult = await db
        .from('orders')
        .insert(orderData)
        .select('id')
        .single();
      order = retryResult.data;
      orderError = retryResult.error;
    }

    // If error is about payment_method or contact_number column, retry without them
    if (orderError && (orderError.message?.includes('payment_method') || orderError.message?.includes('contact_number'))) {
      delete orderData.payment_method;
      delete orderData.contact_number;
      const retryResult = await db
        .from('orders')
        .insert(orderData)
        .select('id')
        .single();
      order = retryResult.data;
      orderError = retryResult.error;
    }

    if (orderError) {
      console.error('Database error creating order:', orderError);
      throw orderError;
    }

    // Note: Stock is NOT reduced here. It will be reduced when the order status changes to 'delivered'
    // This allows for order cancellation/modification before delivery without affecting stock

    // Update coupon uses if a coupon was used
    if (couponCode) {
      const { data: coupon } = await db
        .from('coupons')
        .select('uses')
        .eq('code', couponCode)
        .single();

      if (coupon) {
        await db
          .from('coupons')
          .update({ uses: coupon.uses + 1 })
          .eq('code', couponCode);
      }
    }

    return NextResponse.json({
      success: true,
      orderId: order?.id,
      orderCode: orderCode
    });
  } catch (error: any) {
    console.error('Error creating order:', error);

    // Determine the error message/details
    let errorDetails = 'Unknown error';
    let fullError = error;

    if (error instanceof Error) {
      errorDetails = error.message;
    } else if (typeof error === 'object' && error !== null) {
      // Handle Supabase/Postgrest error objects
      errorDetails = error.message || error.details || JSON.stringify(error);
    } else {
      errorDetails = String(error);
    }

    return NextResponse.json(
      {
        error: 'Failed to create order',
        details: errorDetails,
        fullError: fullError
      },
      { status: 500 }
    );
  }
}
