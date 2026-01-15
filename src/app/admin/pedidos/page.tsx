'use client';

import { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import useSWR from 'swr';
import { fetcher, swrOptions } from '@/lib/fetcher';
import { getPeruDate, getPeruYear, getPeruMonth, formatPeruDateTime, formatPeruDateShort, isOrderDelayedPeru, PERU_TIMEZONE } from '@/lib/timezone';

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

interface DiscountInfo {
  coupon?: {
    code: string;
    amount: number;
    type: string;
    value: number;
  };
  cart_discount?: {
    name: string;
    amount: number;
    type: string;
    value: number;
    min_value: number;
  };
}

interface Order {
  id: number;
  order_code: string | null;
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
  discount_info: DiscountInfo | string | null;
  payment_method: string | null;
  contact_number: string | null;
  created_at: string;
}

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pendiente', color: 'bg-gray-100 text-gray-700' },
  { value: 'processing', label: 'Procesando', color: 'bg-cyan-100 text-cyan-700' },
  { value: 'transit', label: 'En Tránsito', color: 'bg-orange-100 text-orange-700' },
  { value: 'delivered', label: 'Entregado', color: 'bg-green-100 text-green-700' },
  { value: 'cancelled', label: 'Cancelado', color: 'bg-red-100 text-red-700' }
];

// Helper to check if order is delayed (more than 1 day old and not completed/cancelled)
function isOrderDelayed(order: Order): boolean {
  if (order.status === 'delivered' || order.status === 'cancelled') {
    return false;
  }
  return isOrderDelayedPeru(order.created_at);
}

// Generate years from 2026 onwards
function generateYears() {
  const currentYear = getPeruYear();
  const years = [];
  for (let year = 2026; year <= currentYear + 1; year++) {
    years.push(year);
  }
  return years;
}

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
  // SWR for orders with caching
  const { data: orders = [], isLoading: loading, mutate: mutateOrders } = useSWR<Order[]>(
    '/api/admin/orders',
    fetcher,
    swrOptions
  );

  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Export filters
  const [exportMonth, setExportMonth] = useState(getPeruMonth());
  const [exportYear, setExportYear] = useState(getPeruYear());
  const [exporting, setExporting] = useState(false);

  const years = useMemo(() => generateYears(), []);

  // Filtered orders based on search and date filters
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // Search filter (order code, client name, email)
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesCode = order.order_code?.toLowerCase().includes(query);
        const matchesName = order.guest_name?.toLowerCase().includes(query);
        const matchesEmail = order.guest_email?.toLowerCase().includes(query);
        const matchesId = order.id.toString().includes(query);
        if (!matchesCode && !matchesName && !matchesEmail && !matchesId) return false;
      }

      // Status filter
      if (filterStatus !== 'all' && order.status !== filterStatus) return false;

      // Date range filter
      const orderDate = new Date(order.created_at);
      if (filterDateFrom) {
        // Parse date in Peru timezone
        const fromDate = new Date(filterDateFrom + 'T00:00:00-05:00');
        if (orderDate < fromDate) return false;
      }
      if (filterDateTo) {
        // Parse date in Peru timezone (end of day)
        const toDate = new Date(filterDateTo + 'T23:59:59-05:00');
        if (orderDate > toDate) return false;
      }

      return true;
    });
  }, [orders, searchQuery, filterStatus, filterDateFrom, filterDateTo]);

  const clearFilters = () => {
    setSearchQuery('');
    setFilterDateFrom('');
    setFilterDateTo('');
    setFilterStatus('all');
  };

  const hasActiveFilters = searchQuery || filterDateFrom || filterDateTo || filterStatus !== 'all';

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    setUpdatingStatus(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        mutateOrders();
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

  const [deletingOrder, setDeletingOrder] = useState<number | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<number | null>(null);
  const [deleteReason, setDeleteReason] = useState('');

  const openDeleteModal = (orderId: number) => {
    setOrderToDelete(orderId);
    setDeleteReason('');
    setDeleteModalOpen(true);
  };

  const handleDeleteOrder = async () => {
    if (!orderToDelete || !deleteReason.trim()) {
      alert('Debes ingresar un motivo para eliminar el pedido');
      return;
    }

    setDeletingOrder(orderToDelete);
    try {
      const res = await fetch(`/api/admin/orders/${orderToDelete}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: deleteReason.trim() })
      });

      if (res.ok) {
        mutateOrders();
        if (viewingOrder?.id === orderToDelete) {
          setViewingOrder(null);
        }
        setDeleteModalOpen(false);
        setOrderToDelete(null);
        setDeleteReason('');
      } else {
        alert('Error al eliminar el pedido');
      }
    } catch (error) {
      console.error('Error deleting order:', error);
      alert('Error al eliminar el pedido');
    } finally {
      setDeletingOrder(null);
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
          'Fecha': formatPeruDateShort(order.created_at),
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
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pedidos</h1>
          <p className="text-sm text-gray-500 mt-1">
            {hasActiveFilters
              ? `${filteredOrders.length} de ${orders.length} pedido(s)`
              : `${orders.length} pedido(s) total`
            }
          </p>
        </div>

        {/* Export Controls */}
        <div className="flex items-center gap-2 bg-white rounded-xl p-3 shadow-sm border">
          <span className="text-sm text-gray-600 font-medium">Exportar:</span>
          <select
            value={exportMonth}
            onChange={(e) => setExportMonth(parseInt(e.target.value))}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent cursor-pointer"
          >
            {MONTHS.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
          <select
            value={exportYear}
            onChange={(e) => setExportYear(parseInt(e.target.value))}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent cursor-pointer"
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

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Buscar por código (MAE2026...), cliente o email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent cursor-pointer"
          >
            <option value="all">Todos los estados</option>
            {STATUS_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>

          {/* Date Filters */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Desde:</span>
            <input
              type="date"
              value={filterDateFrom}
              onChange={(e) => setFilterDateFrom(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent cursor-pointer"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Hasta:</span>
            <input
              type="date"
              value={filterDateTo}
              onChange={(e) => setFilterDateTo(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent cursor-pointer"
            />
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Limpiar
            </button>
          )}
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
          <span className="text-4xl mb-4 block">{hasActiveFilters ? '🔍' : '📦'}</span>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            {hasActiveFilters ? 'No se encontraron pedidos' : 'No hay pedidos aún'}
          </h2>
          <p className="text-gray-500">
            {hasActiveFilters
              ? 'Intenta ajustar los filtros de búsqueda'
              : 'Los pedidos aparecerán aquí cuando los clientes compren.'
            }
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="mt-4 px-4 py-2 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors cursor-pointer"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Código</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.map((order) => {
                const delayed = isOrderDelayed(order);
                const items = parseItems(order.items_json);
                const statusOption = getStatusOption(order.status);

                return (
                  <tr
                    key={order.id}
                    className={`transition-colors ${delayed ? 'bg-red-50 hover:bg-red-100' : 'hover:bg-gray-50'}`}
                  >
                    <td className="px-4 py-4">
                      <span className="text-gray-500 text-sm">#{order.id}</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 font-mono">{order.order_code || '-'}</span>
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
                      {formatPeruDateShort(order.created_at)}
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
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium border cursor-pointer shadow-sm hover:shadow focus:ring-2 focus:ring-teal-400 focus:outline-none transition-all ${statusOption.color} ${updatingStatus === order.id ? 'opacity-50' : ''}`}
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
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => setViewingOrder(order)}
                          className="p-2 text-gray-500 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors cursor-pointer"
                          title="Ver detalles"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => openDeleteModal(order.id)}
                          disabled={deletingOrder === order.id}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                          title="Eliminar pedido"
                        >
                          {deletingOrder === order.id ? (
                            <div className="w-5 h-5 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          )}
                        </button>
                      </div>
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
                <h2 className="text-xl font-bold text-gray-900">Pedido {viewingOrder.order_code || `#${viewingOrder.id}`}</h2>
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

                {/* Envío y Pago */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <span>📍</span> Envío y Pago
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-600">
                      <span className="text-gray-500">Dirección:</span> {viewingOrder.shipping_address || 'No especificada'}
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="text-gray-500">Pago:</span>
                      {viewingOrder.payment_method === 'yape' && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">💜 Yape</span>
                      )}
                      {viewingOrder.payment_method === 'plin' && (
                        <span className="px-2 py-1 bg-cyan-100 text-cyan-700 rounded-full text-xs font-medium">💙 Plin</span>
                      )}
                      {viewingOrder.payment_method === 'transferencia' && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">🏦 Transferencia</span>
                      )}
                      {!viewingOrder.payment_method && <span className="text-gray-500">N/A</span>}
                    </p>
                    {viewingOrder.contact_number && (
                      <p>
                        <span className="text-gray-500">Contacto:</span> {viewingOrder.contact_number}
                      </p>
                    )}
                  </div>
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
              {(viewingOrder.coupon_code || viewingOrder.discount > 0 || viewingOrder.discount_info) && (
                <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                  <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                    <span>🎉</span> Descuentos Aplicados
                  </h4>
                  <div className="space-y-2 text-sm">
                    {/* Cupón */}
                    {(() => {
                      const discountInfo = typeof viewingOrder.discount_info === 'string'
                        ? JSON.parse(viewingOrder.discount_info) as DiscountInfo
                        : viewingOrder.discount_info as DiscountInfo | null;

                      return (
                        <>
                          {(discountInfo?.coupon || viewingOrder.coupon_code) && (
                            <div className="flex items-center justify-between bg-white/50 rounded-lg px-3 py-2">
                              <div className="flex items-center gap-2">
                                <span>🎟️</span>
                                <span className="text-green-700">Cupón:</span>
                                <span className="font-mono bg-green-100 px-2 py-0.5 rounded font-medium text-green-800">
                                  {discountInfo?.coupon?.code || viewingOrder.coupon_code}
                                </span>
                                {discountInfo?.coupon && (
                                  <span className="text-green-600 text-xs">
                                    ({discountInfo.coupon.type === 'percentage' ? `${discountInfo.coupon.value}%` : `S/${discountInfo.coupon.value}`})
                                  </span>
                                )}
                              </div>
                              {discountInfo?.coupon && (
                                <span className="font-medium text-green-700">-S/ {discountInfo.coupon.amount.toFixed(2)}</span>
                              )}
                            </div>
                          )}

                          {/* Descuento por carrito */}
                          {discountInfo?.cart_discount && (
                            <div className="flex items-center justify-between bg-white/50 rounded-lg px-3 py-2">
                              <div className="flex items-center gap-2">
                                <span>🛒</span>
                                <span className="text-green-700">Carrito:</span>
                                <span className="text-green-800 font-medium">{discountInfo.cart_discount.name}</span>
                                <span className="text-green-600 text-xs">
                                  ({discountInfo.cart_discount.type === 'percentage'
                                    ? `${discountInfo.cart_discount.value}%`
                                    : `S/${discountInfo.cart_discount.value}`} en compras ≥S/{discountInfo.cart_discount.min_value})
                                </span>
                              </div>
                              <span className="font-medium text-green-700">-S/ {discountInfo.cart_discount.amount.toFixed(2)}</span>
                            </div>
                          )}

                          {/* Total ahorrado si no hay info detallada */}
                          {!discountInfo && viewingOrder.discount > 0 && (
                            <div className="text-green-700 font-medium">
                              Ahorro total: S/ {viewingOrder.discount.toFixed(2)}
                            </div>
                          )}
                        </>
                      );
                    })()}
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
                        <div className="text-sm text-gray-500">
                          <p>Cantidad: {item.quantity} × S/ {item.product.price.toFixed(2)}</p>
                          {(item.product as any).original_price > item.product.price && (
                            <p className="text-xs text-green-600">
                              Oferta: <span className="line-through text-gray-400">S/ {(item.product as any).original_price.toFixed(2)}</span>
                              {' '}
                              <span className="font-medium">
                                ({(item.product as any).discount_info?.label || 'Descuento'})
                              </span>
                            </p>
                          )}
                        </div>
                        {item.product.customization?.previewBase64 && (
                          <span className="inline-block mt-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                            ✨ Personalizado
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">S/ {(item.product.price * item.quantity).toFixed(2)}</p>
                        {(item.product as any).original_price > item.product.price && (
                          <p className="text-xs text-gray-400 line-through">
                            S/ {((item.product as any).original_price * item.quantity).toFixed(2)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fecha y Estado */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-gray-500">
                  Creado: {formatPeruDateTime(viewingOrder.created_at)}
                </div>
                <select
                  value={viewingOrder.status}
                  onChange={(e) => {
                    updateOrderStatus(viewingOrder.id, e.target.value);
                    setViewingOrder({ ...viewingOrder, status: e.target.value });
                  }}
                  disabled={updatingStatus === viewingOrder.id}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border cursor-pointer shadow-sm hover:shadow focus:ring-2 focus:ring-teal-400 focus:outline-none transition-all ${getStatusOption(viewingOrder.status).color}`}
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

      {/* Modal de Confirmación de Eliminación */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              setDeleteModalOpen(false);
              setOrderToDelete(null);
              setDeleteReason('');
            }}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md m-4 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Eliminar Pedido {orders.find(o => o.id === orderToDelete)?.order_code || `#${orderToDelete}`}</h3>
            <p className="text-gray-500 text-sm mb-4">
              Esta acción ocultará el pedido del panel pero quedará guardado en el historial.
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motivo de eliminación <span className="text-red-500">*</span>
              </label>
              <textarea
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                placeholder="Ej: Pedido duplicado, cliente canceló, error de sistema..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setDeleteModalOpen(false);
                  setOrderToDelete(null);
                  setDeleteReason('');
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteOrder}
                disabled={!deleteReason.trim() || deletingOrder !== null}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                {deletingOrder ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Eliminando...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Eliminar Pedido
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
