'use client';

import { useState, useEffect, useMemo } from 'react';
import * as XLSX from 'xlsx';
import Link from 'next/link';

interface OrderItem {
    product: {
        id: number;
        name: string;
        price: number;
        image_url?: string;
        customization?: {
            previewBase64: string | null;
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
    total: number;
    discount: number;
    subtotal: number;
    status: string;
    coupon_code: string | null;
    payment_method: string | null;
    created_at: string;
    deleted_at: string | null;
    deleted_by: string | null;
    deletion_reason: string | null;
    is_deleted: boolean;
    can_edit: boolean;
}

const MONTHS = [
    { value: 0, label: 'Todos los meses' },
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

const STATUS_LABELS: Record<string, string> = {
    pending: 'Pendiente',
    processing: 'Procesando',
    shipped: 'Enviado',
    delivered: 'Entregado',
    cancelled: 'Cancelado'
};

export default function HistorialPedidosPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(0);
    const [exporting, setExporting] = useState(false);
    const [viewingOrder, setViewingOrder] = useState<Order | null>(null);

    // Generate year options (from 2024 to current year + 1)
    const currentYear = new Date().getFullYear();
    const yearOptions = Array.from({ length: currentYear - 2023 }, (_, i) => 2024 + i);

    useEffect(() => {
        fetchOrders();
    }, [selectedYear, selectedMonth]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            let url = `/api/admin/orders/history?year=${selectedYear}`;
            if (selectedMonth > 0) {
                url += `&month=${selectedMonth}`;
            }
            const res = await fetch(url);
            const data = await res.json();
            setOrders(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching history:', error);
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    const parseItems = (itemsJson: string | OrderItem[]): OrderItem[] => {
        try {
            if (Array.isArray(itemsJson)) return itemsJson;
            if (typeof itemsJson === 'string') return JSON.parse(itemsJson);
            return [];
        } catch {
            return [];
        }
    };

    // Check if manually deleted (not expired)
    const isManuallyDeleted = (order: Order) => {
        return order.is_deleted && order.deletion_reason === 'manual';
    };

    // Group orders by month for statistics
    const ordersByMonth = useMemo(() => {
        const grouped: Record<number, Order[]> = {};
        orders.forEach(order => {
            const month = new Date(order.created_at).getMonth() + 1;
            if (!grouped[month]) grouped[month] = [];
            grouped[month].push(order);
        });
        return grouped;
    }, [orders]);

    // Stats - only count manually deleted as "deleted"
    const stats = useMemo(() => {
        const activeOrders = orders.filter(o => !o.is_deleted && o.status !== 'cancelled');
        const totalRevenue = activeOrders.reduce((sum, o) => sum + o.total, 0);
        const totalOrders = orders.length;
        const deletedOrders = orders.filter(o => isManuallyDeleted(o)).length;
        const cancelledOrders = orders.filter(o => o.status === 'cancelled').length;
        return { totalRevenue, totalOrders, deletedOrders, cancelledOrders };
    }, [orders]);

    const formatOrderRow = (order: Order) => {
        const items = parseItems(order.items_json);
        const productsText = items.map(i => `${i.product.name} x${i.quantity}`).join('; ');
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
            'Estado': STATUS_LABELS[order.status] || order.status,
            'Método Pago': order.payment_method || '',
            'Eliminado': isManuallyDeleted(order) ? 'Sí' : 'No',
            'Productos': productsText
        };
    };

    // Helper to parse deleted_by
    const getDeletedByName = (deletedBy: string | null): string => {
        if (!deletedBy) return 'Desconocido';
        if (deletedBy.startsWith('admin:')) {
            const adminId = deletedBy.split(':')[1];
            return `Administrador #${adminId}`;
        }
        if (deletedBy.startsWith('system:')) {
            return 'Sistema (auto-expiración)';
        }
        return deletedBy;
    };

    const exportMonth = (monthNum: number) => {
        const monthOrders = ordersByMonth[monthNum] || [];
        if (monthOrders.length === 0) {
            alert(`No hay pedidos en ${MONTHS.find(m => m.value === monthNum)?.label}`);
            return;
        }

        const rows = monthOrders.map(formatOrderRow);
        const worksheet = XLSX.utils.json_to_sheet(rows);

        worksheet['!cols'] = [
            { wch: 6 }, { wch: 12 }, { wch: 20 }, { wch: 25 }, { wch: 12 },
            { wch: 35 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 15 },
            { wch: 12 }, { wch: 15 }, { wch: 8 }, { wch: 50 }
        ];

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, MONTHS.find(m => m.value === monthNum)?.label || 'Pedidos');
        XLSX.writeFile(workbook, `historial_pedidos_${MONTHS.find(m => m.value === monthNum)?.label}_${selectedYear}.xlsx`);
    };

    const exportYear = async () => {
        setExporting(true);
        try {
            const res = await fetch(`/api/admin/orders/history?year=${selectedYear}`);
            const allOrders: Order[] = await res.json();

            if (!Array.isArray(allOrders) || allOrders.length === 0) {
                alert(`No hay pedidos en ${selectedYear}`);
                setExporting(false);
                return;
            }

            const byMonth: Record<number, Order[]> = {};
            allOrders.forEach(order => {
                const month = new Date(order.created_at).getMonth() + 1;
                if (!byMonth[month]) byMonth[month] = [];
                byMonth[month].push(order);
            });

            const workbook = XLSX.utils.book_new();

            for (let month = 1; month <= 12; month++) {
                const monthOrders = byMonth[month];
                if (monthOrders && monthOrders.length > 0) {
                    const rows = monthOrders.map(formatOrderRow);
                    const worksheet = XLSX.utils.json_to_sheet(rows);
                    worksheet['!cols'] = [
                        { wch: 6 }, { wch: 12 }, { wch: 20 }, { wch: 25 }, { wch: 12 },
                        { wch: 35 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 15 },
                        { wch: 12 }, { wch: 15 }, { wch: 8 }, { wch: 50 }
                    ];
                    const monthName = MONTHS.find(m => m.value === month)?.label || `Mes ${month}`;
                    XLSX.utils.book_append_sheet(workbook, worksheet, monthName);
                }
            }

            const summaryData = [
                { 'Mes': 'RESUMEN ANUAL', 'Pedidos': '', 'Ingresos': '' },
                ...Array.from({ length: 12 }, (_, i) => {
                    const month = i + 1;
                    const monthOrders = byMonth[month] || [];
                    const activeOrders = monthOrders.filter(o => !o.is_deleted && o.status !== 'cancelled');
                    const revenue = activeOrders.reduce((sum, o) => sum + o.total, 0);
                    return {
                        'Mes': MONTHS.find(m => m.value === month)?.label,
                        'Pedidos': monthOrders.length,
                        'Ingresos': `S/ ${revenue.toFixed(2)}`
                    };
                }),
                { 'Mes': 'TOTAL', 'Pedidos': allOrders.length, 'Ingresos': `S/ ${allOrders.filter(o => !o.is_deleted && o.status !== 'cancelled').reduce((s, o) => s + o.total, 0).toFixed(2)}` }
            ];
            const summarySheet = XLSX.utils.json_to_sheet(summaryData);
            summarySheet['!cols'] = [{ wch: 15 }, { wch: 10 }, { wch: 15 }];
            XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumen');

            XLSX.writeFile(workbook, `historial_pedidos_${selectedYear}_completo.xlsx`);
        } catch (error) {
            console.error('Error exporting year:', error);
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
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Historial de Pedidos</h1>
                    <p className="text-gray-500 mt-1">Registro histórico completo por año</p>
                </div>
                <Link
                    href="/admin/pedidos"
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                >
                    ← Volver a Pedidos
                </Link>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
                <div className="flex flex-wrap items-center gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Año</label>
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                            className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-400 focus:outline-none"
                        >
                            {yearOptions.map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mes</label>
                        <select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                            className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-400 focus:outline-none"
                        >
                            {MONTHS.map(month => (
                                <option key={month.value} value={month.value}>{month.label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex-grow" />
                    <div className="flex gap-2">
                        {selectedMonth > 0 && (
                            <button
                                onClick={() => exportMonth(selectedMonth)}
                                className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors cursor-pointer"
                            >
                                📊 Exportar Mes
                            </button>
                        )}
                        <button
                            onClick={exportYear}
                            disabled={exporting}
                            className="px-4 py-2 bg-rose-600 text-white rounded-xl font-medium hover:bg-rose-700 transition-colors disabled:opacity-50 cursor-pointer"
                        >
                            {exporting ? '⏳ Exportando...' : '📊 Exportar Año Completo'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-2xl shadow-sm p-4">
                    <p className="text-sm text-gray-500">Total Pedidos</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
                </div>
                <div className="bg-white rounded-2xl shadow-sm p-4">
                    <p className="text-sm text-gray-500">Ingresos Activos</p>
                    <p className="text-2xl font-bold text-emerald-600">S/ {stats.totalRevenue.toFixed(2)}</p>
                </div>
                <div className="bg-white rounded-2xl shadow-sm p-4">
                    <p className="text-sm text-gray-500">Cancelados</p>
                    <p className="text-2xl font-bold text-amber-600">{stats.cancelledOrders}</p>
                </div>
                <div className="bg-white rounded-2xl shadow-sm p-4">
                    <p className="text-sm text-gray-500">Eliminados Manualmente</p>
                    <p className="text-2xl font-bold text-red-600">{stats.deletedOrders}</p>
                </div>
            </div>

            {/* Info banner */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                <div className="flex gap-2">
                    <span className="text-amber-600">ℹ️</span>
                    <p className="text-amber-800 text-sm">
                        El historial es de solo lectura. Los pedidos solo pueden modificarse desde <strong>Pedidos</strong> dentro de los primeros 30 días.
                    </p>
                </div>
            </div>

            {/* Orders Table */}
            {orders.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                    <span className="text-5xl mb-4 block">📋</span>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Sin pedidos</h3>
                    <p className="text-gray-500">No hay pedidos en el período seleccionado.</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm overflow-x-auto">
                    <table className="w-full min-w-[1000px]">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-4 text-left text-sm font-medium text-gray-500">ID</th>
                                <th className="px-4 py-4 text-left text-sm font-medium text-gray-500">Fecha</th>
                                <th className="px-4 py-4 text-left text-sm font-medium text-gray-500">Cliente</th>
                                <th className="px-4 py-4 text-left text-sm font-medium text-gray-500">Total</th>
                                <th className="px-4 py-4 text-left text-sm font-medium text-gray-500">Estado</th>
                                <th className="px-4 py-4 text-left text-sm font-medium text-gray-500">Situación</th>
                                <th className="px-4 py-4 text-right text-sm font-medium text-gray-500">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {orders.map((order) => (
                                <tr
                                    key={order.id}
                                    className={`${isManuallyDeleted(order) ? 'bg-red-50' : 'hover:bg-gray-50'}`}
                                >
                                    <td className="px-4 py-4 font-mono text-sm text-gray-600">#{order.id}</td>
                                    <td className="px-4 py-4 text-gray-900">
                                        {new Date(order.created_at).toLocaleDateString('es-PE')}
                                    </td>
                                    <td className="px-4 py-4 text-gray-900">
                                        {order.guest_name || `Usuario #${order.user_id}`}
                                    </td>
                                    <td className="px-4 py-4 font-semibold text-gray-900">
                                        S/ {order.total.toFixed(2)}
                                    </td>
                                    <td className="px-4 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                                                order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                                    order.status === 'shipped' ? 'bg-purple-100 text-purple-700' :
                                                        order.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                                                            'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {STATUS_LABELS[order.status] || order.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4">
                                        {isManuallyDeleted(order) ? (
                                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                                🗑️ Eliminado
                                            </span>
                                        ) : order.can_edit ? (
                                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                                ✏️ Editable
                                            </span>
                                        ) : (
                                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                                🔒 Archivado
                                            </span>
                                        )}
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
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal de Detalles */}
            {viewingOrder && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setViewingOrder(null)}>
                    <div
                        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-rose-500 to-orange-400 text-white p-6 rounded-t-2xl">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-2xl font-bold">Pedido #{viewingOrder.id}</h2>
                                    <p className="text-rose-100">
                                        {new Date(viewingOrder.created_at).toLocaleString('es-PE')}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setViewingOrder(null)}
                                    className="p-2 hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-6">
                            {/* Deleted Info */}
                            {isManuallyDeleted(viewingOrder) && (
                                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                                    <h4 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
                                        <span>🗑️</span> Pedido Eliminado
                                    </h4>
                                    <div className="text-sm text-red-700 space-y-1">
                                        <p><strong>Eliminado por:</strong> {getDeletedByName(viewingOrder.deleted_by)}</p>
                                        <p><strong>Fecha:</strong> {viewingOrder.deleted_at ? new Date(viewingOrder.deleted_at).toLocaleString('es-PE') : 'N/A'}</p>
                                    </div>
                                </div>
                            )}

                            {/* Cliente */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-gray-50 rounded-xl p-4">
                                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                        <span>👤</span> Cliente
                                    </h4>
                                    <p className="text-gray-700">{viewingOrder.guest_name || `Usuario #${viewingOrder.user_id}`}</p>
                                    {viewingOrder.guest_email && (
                                        <p className="text-sm text-gray-500">{viewingOrder.guest_email}</p>
                                    )}
                                    {viewingOrder.guest_phone && (
                                        <p className="text-sm text-gray-500">{viewingOrder.guest_phone}</p>
                                    )}
                                </div>

                                <div className="bg-gray-50 rounded-xl p-4">
                                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                        <span>📍</span> Dirección
                                    </h4>
                                    <p className="text-gray-700 text-sm">
                                        {viewingOrder.shipping_address || 'No especificada'}
                                    </p>
                                </div>
                            </div>

                            {/* Resumen */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-gray-50 rounded-xl p-4">
                                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                        <span>💳</span> Pago
                                    </h4>
                                    <p className="text-gray-700">{viewingOrder.payment_method || 'WhatsApp'}</p>
                                </div>
                                <div className="bg-rose-50 rounded-xl p-4">
                                    <h4 className="font-semibold text-gray-900 mb-2">💰 Resumen</h4>
                                    <p className="flex justify-between text-sm">
                                        <span>Subtotal:</span>
                                        <span>S/ {viewingOrder.subtotal.toFixed(2)}</span>
                                    </p>
                                    {viewingOrder.discount > 0 && (
                                        <p className="flex justify-between text-sm text-green-600">
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
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
