'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function PerfilPage() {
    const { user, isAuthenticated, loading } = useAuth();
    const router = useRouter();
    const [orderCount, setOrderCount] = useState(0);

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.push('/login');
        }
    }, [loading, isAuthenticated, router]);

    useEffect(() => {
        const fetchOrderCount = async () => {
            if (user?.id) {
                try {
                    const res = await fetch(`/api/orders/user/${user.id}`);
                    const data = await res.json();
                    setOrderCount(Array.isArray(data) ? data.length : 0);
                } catch (error) {
                    console.error('Error fetching orders:', error);
                }
            }
        };
        if (user) fetchOrderCount();
    }, [user]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-600 border-t-transparent" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'No disponible';
        return new Date(dateString).toLocaleDateString('es-PE', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                    <Link href="/" className="hover:text-teal-600">Inicio</Link>
                    <span>/</span>
                    <span className="text-gray-900">Mi Perfil</span>
                </div>

                {/* Profile Card */}
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    {/* Header Banner */}
                    <div className="h-32 bg-gradient-to-r from-teal-500 to-cyan-500" />

                    {/* Profile Content */}
                    <div className="px-6 pb-6">
                        {/* Avatar */}
                        <div className="-mt-16 mb-4">
                            <div className="w-24 h-24 bg-white rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                                <span className="text-3xl font-bold text-teal-600">
                                    {user?.name ? getInitials(user.name) : '?'}
                                </span>
                            </div>
                        </div>

                        {/* User Info */}
                        <div className="mb-6">
                            <h1 className="text-2xl font-bold text-gray-900">{user?.name}</h1>
                            <p className="text-gray-500">{user?.email}</p>
                        </div>

                        {/* Info Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                            <div className="bg-gray-50 rounded-xl p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                                        <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Tipo de cuenta</p>
                                        <p className="font-medium text-gray-900">
                                            {user?.role === 'admin' ? 'Administrador' : user?.role === 'worker' ? 'Staff' : 'Cliente'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-xl p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-cyan-100 rounded-full flex items-center justify-center">
                                        <svg className="w-5 h-5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Pedidos realizados</p>
                                        <p className="font-medium text-gray-900">{orderCount}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-xl p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                                        <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Correo electrónico</p>
                                        <p className="font-medium text-gray-900 truncate">{user?.email}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-xl p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Estado de cuenta</p>
                                        <p className="font-medium text-green-600">Activa</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="border-t border-gray-200 pt-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Acciones rápidas</h2>
                            <div className="flex flex-wrap gap-3">
                                <Link
                                    href="/pedidos"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-teal-50 text-teal-700 rounded-xl font-medium hover:bg-teal-100 transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                    Ver mis pedidos
                                </Link>
                                <Link
                                    href="/productos"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                    Explorar productos
                                </Link>
                                <Link
                                    href="/carrito"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    Mi carrito
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
