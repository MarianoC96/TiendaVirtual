'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

interface Coupon {
  code: string;
  name: string;
  discount_type: string;
  discount_value: number;
  discount_amount: number;
}

export default function CartPage() {
  const { items, total, itemCount, updateQuantity, removeItem, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  // Guest checkout state
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');

  const finalTotal = appliedCoupon ? total - appliedCoupon.discount_amount : total;

  const handleApplyCoupon = async () => {
    setCouponLoading(true);
    setCouponError('');

    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode, cartTotal: total })
      });
      const data = await res.json();

      if (res.ok && data.valid) {
        setAppliedCoupon(data);
        setCouponCode('');
      } else {
        setCouponError(data.error || 'Cupón no válido');
      }
    } catch {
      setCouponError('Error al validar cupón');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
  };

  const [orderLoading, setOrderLoading] = useState(false);

  const handleWhatsAppOrder = async () => {
    setOrderLoading(true);

    try {
      // First, create the order in the database
      const orderData = {
        userId: isAuthenticated && user ? user.id : null,
        guestName: !isAuthenticated ? guestName : (user?.name || null),
        guestEmail: !isAuthenticated ? guestEmail : (user?.email || null),
        guestPhone: !isAuthenticated ? guestPhone : null,
        shippingAddress: shippingAddress,
        items: items,
        subtotal: total,
        discount: appliedCoupon?.discount_amount || 0,
        total: finalTotal,
        couponCode: appliedCoupon?.code || null
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      if (!res.ok) {
        throw new Error('Failed to create order');
      }

      const { orderId } = await res.json();

      // Now build and send WhatsApp message
      const storePhoneNumber = "51999888777";
      let message = `🛒 *Nuevo Pedido #${orderId} - CustomCups*\n\n`;

      // Customer info
      if (isAuthenticated && user) {
        message += `👤 *Cliente:* ${user.name}\n`;
        message += `📧 *Email:* ${user.email}\n\n`;
      } else {
        message += `👤 *Cliente:* ${guestName}\n`;
        message += `📧 *Email:* ${guestEmail}\n`;
        message += `📱 *Teléfono:* ${guestPhone}\n\n`;
      }

      message += `📦 *Productos:*\n`;
      items.forEach(item => {
        const hasCustomization = item.product.customization?.previewBase64;
        message += `• ${item.product.name} (x${item.quantity}) - S/ ${(item.product.price * item.quantity).toFixed(2)}${hasCustomization ? ' ✨' : ''}\n`;
      });

      message += `\n💰 *Subtotal:* S/ ${total.toFixed(2)}`;

      if (appliedCoupon) {
        message += `\n🎟️ *Cupón (${appliedCoupon.code}):* -S/ ${appliedCoupon.discount_amount.toFixed(2)}`;
      }

      message += `\n\n✅ *TOTAL: S/ ${finalTotal.toFixed(2)}*`;

      const whatsappUrl = `https://wa.me/${storePhoneNumber}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
      clearCart();
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Error al crear el pedido. Por favor intenta de nuevo.');
    } finally {
      setOrderLoading(false);
    }
  };

  const canCheckout = shippingAddress && (isAuthenticated || (guestName && guestEmail && guestPhone));

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center py-16 px-4">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 bg-rose-50 rounded-full flex items-center justify-center">
            <span className="text-4xl">☕</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Tu carrito está vacío</h2>
          <p className="text-gray-500 mb-6">¡Encuentra la taza perfecta para ti!</p>
          <Link
            href="/productos"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-rose-600 to-orange-500 text-white font-semibold rounded-full hover:shadow-lg transition-all"
          >
            Ver Productos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/productos" className="inline-flex items-center gap-2 text-gray-600 hover:text-rose-600 mb-6 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Seguir Comprando
        </Link>

        <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-600 to-orange-500 bg-clip-text text-transparent mb-8">
          Tu Carrito
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.product.id} className="bg-white rounded-2xl shadow-sm p-4 flex gap-4">
                <div className="w-24 h-24 bg-gray-100 rounded-xl flex-shrink-0 overflow-hidden">
                  <img
                    src={item.product.image_url || 'https://via.placeholder.com/150'}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-grow">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{item.product.name}</h3>
                      <p className="text-sm text-gray-500">S/ {item.product.price.toFixed(2)}</p>
                    </div>
                    <p className="text-lg font-bold text-rose-600">
                      S/ {(item.product.price * item.quantity).toFixed(2)}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border border-gray-200 rounded-lg">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="p-2 text-gray-600 hover:text-rose-600 disabled:opacity-50"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                      </button>
                      <span className="px-4 py-1 font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="p-2 text-gray-600 hover:text-rose-600"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.product.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24 space-y-6">
              <h2 className="text-xl font-bold text-gray-900">Resumen del Pedido</h2>

              {/* Coupon Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cupón de descuento</label>
                {appliedCoupon ? (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex justify-between items-center">
                    <div>
                      <p className="font-medium text-green-700">{appliedCoupon.code}</p>
                      <p className="text-sm text-green-600">-S/ {appliedCoupon.discount_amount.toFixed(2)}</p>
                    </div>
                    <button onClick={handleRemoveCoupon} className="text-gray-400 hover:text-red-500">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Código"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                    <button
                      onClick={handleApplyCoupon}
                      disabled={!couponCode || couponLoading}
                      className="px-4 py-2 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 disabled:opacity-50"
                    >
                      {couponLoading ? '...' : 'Aplicar'}
                    </button>
                  </div>
                )}
                {couponError && <p className="text-red-500 text-sm mt-2">{couponError}</p>}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2 border-t border-gray-200 pt-4">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({itemCount} productos)</span>
                  <span>S/ {total.toFixed(2)}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-green-600">
                    <span>Descuento</span>
                    <span>-S/ {appliedCoupon.discount_amount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Total</span>
                  <span className="text-rose-600">S/ {finalTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Guest Checkout Fields */}
              {!isAuthenticated && (
                <div className="space-y-3 border-t border-gray-200 pt-4">
                  <p className="text-sm font-medium text-gray-700">Datos de contacto</p>
                  <input
                    type="text"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="Tu nombre"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                  <input
                    type="email"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    placeholder="Tu email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                  <input
                    type="tel"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    placeholder="Tu teléfono"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                  <p className="text-xs text-gray-500">
                    ¿Ya tienes cuenta? <Link href="/login" className="text-rose-600 hover:underline">Inicia sesión</Link>
                  </p>
                </div>
              )}

              {/* Shipping Address - For all users */}
              <div className="space-y-3 border-t border-gray-200 pt-4">
                <p className="text-sm font-medium text-gray-700">Dirección de envío</p>
                <textarea
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="Dirección completa (calle, número, distrito, referencia)"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none"
                />
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleWhatsAppOrder}
                disabled={!canCheckout || orderLoading}
                className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {orderLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    Pedir por WhatsApp
                  </>
                )}
              </button>

              <button
                onClick={clearCart}
                className="w-full py-2 border border-gray-300 text-gray-600 font-medium rounded-xl hover:bg-gray-50 transition-colors"
              >
                Vaciar Carrito
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
