'use client';

import { useState, useEffect, useMemo } from 'react';
import * as XLSX from 'xlsx';

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
  items_json: string | OrderItem[];
  customization_json: string | null;
  total: number;
  discount: number;
  subtotal: number;
  status: string;
  coupon_code: string | null;
  payment_method: string | null;
  created_at: string;
}

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pendiente', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'processing', label: 'Procesando', color: 'bg-blue-100 text-blue-700' },
  { value: 'shipped', label: 'Enviando', color: 'bg-purple-100 text-purple-700' },
  { value: 'delivered', label: 'Entregado', color: 'bg-green-100 text-green-700' },
  { value: 'cancelled', label: 'Cancelado', color: 'bg-red-100 text-red-700' }
];

// Helper to check if order is delayed (more than 1 day old and not completed/cancelled)
const isOrderDelayed = (order: Order): boolean => {
  if (order.status === 'delivered' || order.status === 'cancelled') return false;

  const orderDate = new Date(order.created_at);
  const today = new Date();

  // Reset hours to compare only dates
  orderDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const diffTime = today.getTime() - orderDate.getTime();
  const diffDays = diffTime / (1000 * 60 * 60 * 24);

  return diffDays > 1;
};

// Generate years from 2026 onwards
const generateYears = () => {
  const currentYear = new Date().getFullYear();
  const startYear = 2026;
  const years: number[] = [];
  for (let y = startYear; y <= Math.max(currentYear, startYear); y++) {
    years.push(y);
  }
  return years;
};

const MONTHS = [
  { value: 1, label: 'Enero' },
  { value: 2, label: 'Febrero' },
  { value: 3, label: 'Marzo' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Mayo' },
  { value: 6, label: 'Junio' },
  { value: 7, label: 'Julio' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Septiembre' },
  { value: 10, label: 'Octubre' },
  { value: 11, label: 'Noviembre' },
  { value: 12, label: 'Diciembre' }
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);

  // Export filters
  const [exportMonth, setExportMonth] = useState(new Date().getMonth() + 1);
  const [exportYear, setExportYear] = useState(new Date().getFullYear());
  const [exporting, setExporting] = useState(false);

  const years = useMemo(() => generateYears(), []);

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
        setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
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

  const parseItems = (itemsJson: string | OrderItem[]): OrderItem[] => {
    try {
      // Si ya es un array, retornarlo directamente
      if (Array.isArray(itemsJson)) {
        return itemsJson;
      }
      // Si es string, parsearlo
      if (typeof itemsJson === 'string') {
        return JSON.parse(itemsJson);
      }
      return [];
    } catch {
      return [];
    }
  };

  // Export to Excel (XLSX format)
  const exportToExcel = async () => {
    setExporting(true);

    try {
      // Filter orders by selected month and year
      const filteredOrders = orders.filter(order => {
        const date = new Date(order.created_at);
        return date.getMonth() + 1 === exportMonth && date.getFullYear() === exportYear;
      });

      if (filteredOrders.length === 0) {
        alert(`No hay pedidos en ${MONTHS.find(m => m.value === exportMonth)?.label} ${exportYear}`);
        setExporting(false);
        return;
      }

      // Create data for Excel - Productos como última columna
      const headers = ['ID', 'Fecha', 'Cliente', 'Email', 'Teléfono', 'Dirección', 'Subtotal', 'Descuento', 'Total', 'Cupón', 'Estado', 'Método Pago', 'Productos'];

      const rows = filteredOrders.map(order => {
        const items = parseItems(order.items_json);
        const productsText = items.map(i => `${i.product.name} x${i.quantity}`).join('; ');
        const statusLabel = getStatusOption(order.status).label;

        return {
          'ID': order.id,
          'Fecha': new Date(order.created_at).toLocaleDateString('es-PE'),
          'Cliente': order.guest_name || `Usuario #${order.user_id}`,
          'Email': order.guest_email || '',
          'Teléfono': order.guest_phone || '',
          'Dirección': order.shipping_address || '',
          'Subtotal': `S/ ${order.subtotal.toFixed(2)}`,
          'Descuento': `S/ ${order.discount.toFixed(2)}`,
          'Total': `S/ ${order.total.toFixed(2)}`,
          'Cupón': order.coupon_code || '',
          'Estado': statusLabel,
          'Método Pago': order.payment_method || '',
          'Productos': productsText
        };
      });

      // Create workbook and worksheet
      const worksheet = XLSX.utils.json_to_sheet(rows, { header: headers });

      // Set column widths
      worksheet['!cols'] = [
        { wch: 6 },   // ID
        { wch: 12 },  // Fecha
        { wch: 20 },  // Cliente
        { wch: 25 },  // Email
        { wch: 12 },  // Teléfono
        { wch: 35 },  // Dirección
        { wch: 12 },  // Subtotal
        { wch: 12 },  // Descuento
        { wch: 12 },  // Total
        { wch: 15 },  // Cupón
        { wch: 12 },  // Estado
        { wch: 15 },  // Método Pago
        { wch: 50 },  // Productos
      ];

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Pedidos');

      // Generate and download file
      const monthName = MONTHS.find(m => m.value === exportMonth)?.label;
      XLSX.writeFile(workbook, `pedidos_${monthName}_${exportYear}.xlsx`);
    } catch (error) {
      console.error('Error exporting:', error);
      alert('Error al exportar');
    } finally {
      setExporting(false);
    }
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pedidos</h1>
          <p className="text-sm text-gray-500 mt-1">{orders.length} pedido(s) total</p>
        </div>

        {/* Export Controls */}
        <div className="flex items-center gap-2 bg-white rounded-xl p-3 shadow-sm border">
          <span className="text-sm text-gray-600 font-medium">Exportar:</span>
          <select
            value={exportMonth}
            onChange={(e) => setExportMonth(parseInt(e.target.value))}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent cursor-pointer"
          >
            {MONTHS.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
          <select
            value={exportYear}
            onChange={(e) => setExportYear(parseInt(e.target.value))}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent cursor-pointer"
          >
            {years.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <button
            onClick={exportToExcel}
            disabled={exporting}
            className="px-4 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer"
          >
            {exporting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            )}
            Excel
          </button>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
          <span className="text-4xl mb-4 block">📦</span>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No hay pedidos aún</h2>
          <p className="text-gray-500">Los pedidos aparecerán aquí cuando los clientes compren.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((order) => {
                const delayed = isOrderDelayed(order);
                const items = parseItems(order.items_json);
                const statusOption = getStatusOption(order.status);

                return (
                  <tr
                    key={order.id}
                    className={`transition-colors ${delayed ? 'bg-red-50 hover:bg-red-100' : 'hover:bg-gray-50'}`}
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900">#{order.id}</span>
                        {delayed && (
                          <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-medium rounded-full">
                            Atrasado
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-medium text-gray-900">{order.guest_name || `Usuario #${order.user_id}`}</p>
                      <p className="text-sm text-gray-500">{order.guest_email || ''}</p>
                    </td>
                    <td className="px-4 py-4 text-gray-600">
                      {new Date(order.created_at).toLocaleDateString('es-PE', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="px-4 py-4">
                      <span className="font-bold text-gray-900">S/ {order.total.toFixed(2)}</span>
                      {order.discount > 0 && (
                        <p className="text-xs text-green-600">-S/ {order.discount.toFixed(2)}</p>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        disabled={updatingStatus === order.id}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium border cursor-pointer shadow-sm hover:shadow focus:ring-2 focus:ring-rose-400 focus:outline-none transition-all ${statusOption.color} ${updatingStatus === order.id ? 'opacity-50' : ''}`}
                        style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
                      >
                        {STATUS_OPTIONS.map(opt => (
                          <option
                            key={opt.value}
                            value={opt.value}
                            style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif', backgroundColor: 'white', color: '#374151' }}
                          >
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <button
                        onClick={() => setViewingOrder(order)}
                        className="p-2 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Ver detalles"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de Detalles */}
      {viewingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setViewingOrder(null)}
          />

          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto m-4">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center z-10">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-gray-900">Pedido #{viewingOrder.id}</h2>
                {isOrderDelayed(viewingOrder) && (
                  <span className="px-2 py-1 bg-red-500 text-white text-xs font-medium rounded-full">
                    Atrasado
                  </span>
                )}
              </div>
              <button
                onClick={() => setViewingOrder(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none cursor-pointer"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Cliente */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <span>👤</span> Cliente
                  </h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-gray-500">Nombre:</span> {viewingOrder.guest_name || 'N/A'}</p>
                    <p><span className="text-gray-500">Email:</span> {viewingOrder.guest_email || 'N/A'}</p>
                    <p><span className="text-gray-500">Teléfono:</span> {viewingOrder.guest_phone || 'N/A'}</p>
                  </div>
                </div>

                {/* Envío */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <span>📍</span> Envío
                  </h4>
                  <p className="text-sm text-gray-600">
                    {viewingOrder.shipping_address || 'No especificada'}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Método: {viewingOrder.payment_method || 'N/A'}
                  </p>
                </div>

                {/* Resumen */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <span>💰</span> Resumen
                  </h4>
                  <div className="space-y-1 text-sm">
                    <p className="flex justify-between">
                      <span className="text-gray-500">Subtotal:</span>
                      <span>S/ {viewingOrder.subtotal.toFixed(2)}</span>
                    </p>
                    {viewingOrder.discount > 0 && (
                      <p className="flex justify-between text-green-600">
                        <span>Descuento:</span>
                        <span>-S/ {viewingOrder.discount.toFixed(2)}</span>
                      </p>
                    )}
                    <p className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                      <span>Total:</span>
                      <span>S/ {viewingOrder.total.toFixed(2)}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Cupón y Descuento */}
              {(viewingOrder.coupon_code || viewingOrder.discount > 0) && (
                <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                  <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                    <span>🎟️</span> Promoción Aplicada
                  </h4>
                  <div className="flex items-center gap-4 text-sm">
                    {viewingOrder.coupon_code && (
                      <div>
                        <span className="text-green-600">Cupón: </span>
                        <span className="font-mono bg-green-100 px-2 py-1 rounded font-medium">{viewingOrder.coupon_code}</span>
                      </div>
                    )}
                    {viewingOrder.discount > 0 && (
                      <div className="text-green-700 font-medium">
                        Ahorro: S/ {viewingOrder.discount.toFixed(2)}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Productos */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span>📦</span> Productos ({parseItems(viewingOrder.items_json).length})
                </h4>
                <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                  {parseItems(viewingOrder.items_json).map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4 bg-gray-50 rounded-xl p-3">
                      <div className="w-16 h-16 bg-white rounded-lg overflow-hidden flex-shrink-0 border">
                        <img
                          src={item.product.customization?.previewBase64 || item.product.image_url || 'https://via.placeholder.com/64'}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-grow">
                        <p className="font-medium text-gray-900">{item.product.name}</p>
                        <p className="text-sm text-gray-500">
                          Cantidad: {item.quantity} × S/ {item.product.price.toFixed(2)}
                        </p>
                        {item.product.customization?.previewBase64 && (
                          <span className="inline-block mt-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                            ✨ Personalizado
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">S/ {(item.product.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fecha y Estado */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-gray-500">
                  Creado: {new Date(viewingOrder.created_at).toLocaleString('es-PE')}
                </div>
                <select
                  value={viewingOrder.status}
                  onChange={(e) => {
                    updateOrderStatus(viewingOrder.id, e.target.value);
                    setViewingOrder({ ...viewingOrder, status: e.target.value });
                  }}
                  disabled={updatingStatus === viewingOrder.id}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border cursor-pointer shadow-sm hover:shadow focus:ring-2 focus:ring-rose-400 focus:outline-none transition-all ${getStatusOption(viewingOrder.status).color}`}
                  style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
                >
                  {STATUS_OPTIONS.map(opt => (
                    <option
                      key={opt.value}
                      value={opt.value}
                      style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif', backgroundColor: 'white', color: '#374151' }}
                    >
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
