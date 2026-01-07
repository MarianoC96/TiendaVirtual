'use client';

import { useState, useEffect } from 'react';

interface OrderItem {
  product: {
    id: number;
    name: string;
    price: number;
    image_url?: string;
    customization?: {
      previewBase64: string | null;
      uploadedImage: string | null;
    };
  };
  quantity: number;
}

interface Order {
  id: number;
  user_id: number | null;
  guest_email: string | null;
  guest_name: string | null;
  guest_phone: string | null;
  shipping_address: string | null;
  items_json: string;
  customization_json: string | null;
  total: number;
  discount: number;
  subtotal: number;
  status: string;
  coupon_code: string | null;
  created_at: string;
}

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pendiente', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'processing', label: 'Procesando', color: 'bg-blue-100 text-blue-700' },
  { value: 'shipped', label: 'Enviado', color: 'bg-purple-100 text-purple-700' },
  { value: 'completed', label: 'Completado', color: 'bg-green-100 text-green-700' },
  { value: 'cancelled', label: 'Cancelado', color: 'bg-red-100 text-red-700' }
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/admin/orders');
      const data = await res.json();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    setUpdatingStatus(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        fetchOrders(); // Refresh orders
      }
    } catch (error) {
      console.error('Error updating order:', error);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getStatusOption = (status: string) => {
    return STATUS_OPTIONS.find(s => s.value === status) || STATUS_OPTIONS[0];
  };

  const parseItems = (itemsJson: string): OrderItem[] => {
    try {
      return JSON.parse(itemsJson);
    } catch {
      return [];
    }
  };

  const downloadPreview = (previewBase64: string, orderIdNum: number, productName: string) => {
    const link = document.createElement('a');
    link.href = previewBase64;
    link.download = `pedido-${orderIdNum}-${productName.replace(/\s+/g, '_')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-rose-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Pedidos</h1>
        <div className="text-sm text-gray-500">
          {orders.length} pedido(s) total
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
          <span className="text-4xl mb-4 block">📦</span>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No hay pedidos aún</h2>
          <p className="text-gray-500">Los pedidos aparecerán aquí cuando los clientes compren.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const items = parseItems(order.items_json);
            const hasCustomization = items.some(item => item.product.customization?.previewBase64);
            const statusOption = getStatusOption(order.status);

            return (
              <div key={order.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                {/* Order Header */}
                <div className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-4 cursor-pointer" onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}>
                    <span className="font-bold text-gray-900">#{order.id}</span>
                    <span className="text-gray-600">
                      {order.guest_name || order.guest_email || `Usuario #${order.user_id}`}
                    </span>
                    {hasCustomization && (
                      <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                        ✨ Personalizado
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-gray-900">S/ {order.total.toFixed(2)}</span>

                    {/* Status Selector */}
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                      disabled={updatingStatus === order.id}
                      className={`px-3 py-1 rounded-full text-xs font-medium border-0 cursor-pointer ${statusOption.color} ${updatingStatus === order.id ? 'opacity-50' : ''}`}
                    >
                      {STATUS_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>

                    <span className="text-gray-500 text-sm">
                      {new Date(order.created_at).toLocaleDateString('es-PE')}
                    </span>
                    <button onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}>
                      <svg className={`w-5 h-5 text-gray-400 transition-transform ${expandedOrder === order.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Order Details */}
                {expandedOrder === order.id && (
                  <div className="px-6 py-4 border-t bg-gray-50">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Customer Info */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Cliente</h4>
                        <div className="space-y-1 text-sm">
                          <p><span className="text-gray-500">Nombre:</span> {order.guest_name || 'N/A'}</p>
                          <p><span className="text-gray-500">Email:</span> {order.guest_email || 'N/A'}</p>
                          <p><span className="text-gray-500">Teléfono:</span> {order.guest_phone || 'N/A'}</p>
                          {order.coupon_code && (
                            <p><span className="text-gray-500">Cupón:</span> <span className="font-mono bg-gray-200 px-1 rounded">{order.coupon_code}</span></p>
                          )}
                        </div>
                      </div>

                      {/* Shipping Address */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Dirección de Envío</h4>
                        <p className="text-sm text-gray-600">
                          {order.shipping_address || 'No especificada'}
                        </p>
                      </div>

                      {/* Order Summary */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Resumen</h4>
                        <div className="space-y-1 text-sm">
                          <p className="flex justify-between"><span className="text-gray-500">Subtotal:</span> <span>S/ {order.subtotal.toFixed(2)}</span></p>
                          {order.discount > 0 && (
                            <p className="flex justify-between text-green-600"><span>Descuento:</span> <span>-S/ {order.discount.toFixed(2)}</span></p>
                          )}
                          <p className="flex justify-between font-bold border-t pt-1"><span>Total:</span> <span>S/ {order.total.toFixed(2)}</span></p>
                        </div>
                      </div>
                    </div>

                    {/* Products */}
                    <div className="mt-6 pt-6 border-t">
                      <h4 className="font-semibold text-gray-900 mb-4">Productos ({items.length})</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {items.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-3 bg-white rounded-xl p-3 border">
                            <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                              <img
                                src={item.product.customization?.previewBase64 || item.product.image_url || 'https://via.placeholder.com/64'}
                                alt={item.product.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-grow">
                              <p className="font-medium text-gray-900">{item.product.name}</p>
                              <p className="text-sm text-gray-500">
                                x{item.quantity} @ S/ {item.product.price.toFixed(2)}
                              </p>
                              {item.product.customization?.previewBase64 && (
                                <span className="text-xs text-amber-600 font-medium">✨ Personalizado</span>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="font-bold">S/ {(item.product.price * item.quantity).toFixed(2)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Production Preview for Customized Items */}
                    {hasCustomization && (
                      <div className="mt-6 pt-6 border-t">
                        <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          🏭 Vista de Producción - Descargar Previews
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          {items
                            .filter(item => item.product.customization?.previewBase64)
                            .map((item, idx) => (
                              <div key={idx} className="bg-white rounded-lg p-3 border group">
                                <img
                                  src={item.product.customization?.previewBase64 || ''}
                                  alt={`Preview ${item.product.name}`}
                                  className="w-full rounded-lg mb-2"
                                />
                                <p className="text-sm font-medium text-gray-900 truncate">{item.product.name}</p>
                                <p className="text-xs text-gray-500 mb-2">Cantidad: {item.quantity}</p>
                                <button
                                  onClick={() => downloadPreview(item.product.customization?.previewBase64 || '', order.id, item.product.name)}
                                  className="w-full px-3 py-2 bg-rose-600 text-white text-sm font-medium rounded-lg hover:bg-rose-700 transition-colors flex items-center justify-center gap-1"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                  </svg>
                                  Descargar
                                </button>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
