'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

interface OrderItem {
    id: number;
    name: string;
    price: number;
    quantity: number;
    image_url?: string;
}

interface Order {
    id: number;
    created_at: string;
    status: string;
    total: number;
    items_json: unknown[];
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
    pending: { label: 'Pendiente', color: 'bg-gray-100 text-gray-700' },
    processing: { label: 'Procesando', color: 'bg-cyan-100 text-cyan-700' },
    transit: { label: 'En Tránsito', color: 'bg-cyan-100 text-cyan-700' },
    delivered: { label: 'Entregado', color: 'bg-green-100 text-green-700' },
    cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-700' }
};

export default function MisPedidosPage() {
    const { user, isAuthenticated, loading: authLoading } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && isAuthenticated && user) {
            fetchOrders();
        }
    }, [authLoading, isAuthenticated, user]);

    const fetchOrders = async () => {
        try {
            const res = await fetch(`/api/orders?userId=${user?.id}`);
            if (res.ok) {
                const data = await res.json();
                setOrders(data);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-600 border-t-transparent" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4">
                <h1 className="text-2xl font-bold text-gray-900">Inicia sesión para ver tus pedidos</h1>
                <Link href="/login" className="px-6 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700">
                    Iniciar Sesión
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-4xl mx-auto px-4">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Mis Pedidos</h1>

                {orders.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                        <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        <h2 className="text-xl font-medium text-gray-900 mb-2">No tienes pedidos aún</h2>
                        <p className="text-gray-500 mb-6">¡Explora nuestra tienda y haz tu primer pedido!</p>
                        <Link href="/productos" className="inline-block px-6 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700">
                            Ver Productos
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map(order => {
                            const status = STATUS_LABELS[order.status] || { label: order.status, color: 'bg-gray-100 text-gray-800' };

                            // Parsear items - manejar ambas estructuras posibles
                            const rawItems = Array.isArray(order.items_json) ? order.items_json : [];
                            const items = rawItems.map((rawItem) => {
                                const item = rawItem as Record<string, unknown>;
                                // Si tiene la estructura {product: {...}, quantity}
                                if (item.product && typeof item.product === 'object') {
                                    const prod = item.product as Record<string, unknown>;
                                    return {
                                        name: prod.name as string || 'Producto',
                                        price: Number(prod.price) || 0,
                                        quantity: Number(item.quantity) || 1,
                                        image_url: prod.image_url as string || null
                                    };
                                }
                                // Estructura plana {name, price, quantity, image_url}
                                return {
                                    name: item.name as string || 'Producto',
                                    price: Number(item.price) || 0,
                                    quantity: Number(item.quantity) || 1,
                                    image_url: item.image_url as string || null
                                };
                            });

                            return (
                                <div key={order.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                                    <div className="p-6 border-b border-gray-100">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-sm text-gray-500">Pedido #{order.id}</p>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    {new Date(order.created_at).toLocaleDateString('es-PE', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </p>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.color}`}>
                                                {status.label}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-6">
                                        <div className="space-y-3">
                                            {items.slice(0, 3).map((item, idx) => (
                                                <div key={idx} className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                                        {item.image_url ? (
                                                            <img
                                                                src={item.image_url}
                                                                alt={item.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                </svg>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium text-gray-900 truncate">{item.name}</p>
                                                        <p className="text-sm text-gray-500">x{item.quantity}</p>
                                                    </div>
                                                    <p className="text-gray-900 font-medium">S/ {(item.price * item.quantity).toFixed(2)}</p>
                                                </div>
                                            ))}
                                            {items.length > 3 && (
                                                <p className="text-sm text-gray-500">+ {items.length - 3} productos más</p>
                                            )}
                                        </div>

                                        <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                                            <span className="text-gray-500">Total</span>
                                            <span className="text-xl font-bold text-teal-600">S/ {order.total.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
