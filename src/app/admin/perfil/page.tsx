'use client';

import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';

interface UserStats {
    totalOrders: number;
    totalSpent: number;
}

export default function AdminPerfilPage() {
    const { user, isAdmin, isWorker } = useAuth();
    const [stats, setStats] = useState<UserStats>({ totalOrders: 0, totalSpent: 0 });

    useEffect(() => {
        // Could fetch admin-specific stats here if needed
    }, [user]);

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const getRoleLabel = () => {
        if (isAdmin) return 'Administrador';
        if (isWorker) return 'Staff';
        return 'Usuario';
    };

    const getRoleDescription = () => {
        if (isAdmin) return 'Acceso completo al sistema de administración';
        if (isWorker) return 'Acceso limitado según permisos asignados';
        return 'Cuenta de usuario estándar';
    };

    return (
        <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-6">Mi Perfil</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Card */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                        {/* Header */}
                        <div className="h-24 bg-gradient-to-r from-teal-500 to-cyan-500" />

                        {/* Content */}
                        <div className="px-6 pb-6">
                            {/* Avatar */}
                            <div className="-mt-12 mb-4">
                                <div className="w-20 h-20 bg-white rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                                    <span className="text-2xl font-bold text-teal-600">
                                        {user?.name ? getInitials(user.name) : '?'}
                                    </span>
                                </div>
                            </div>

                            {/* Info */}
                            <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
                            <p className="text-gray-500 text-sm mb-4">{user?.email}</p>

                            {/* Role Badge */}
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-teal-50 text-teal-700 rounded-full text-sm font-medium">
                                {isAdmin ? (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                ) : (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                )}
                                {getRoleLabel()}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Account Info */}
                    <div className="bg-white rounded-2xl shadow-sm p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Información de la cuenta</h3>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between py-3 border-b border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Nombre completo</p>
                                        <p className="font-medium text-gray-900">{user?.name}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between py-3 border-b border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Correo electrónico</p>
                                        <p className="font-medium text-gray-900">{user?.email}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between py-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Rol del sistema</p>
                                        <p className="font-medium text-gray-900">{getRoleLabel()}</p>
                                        <p className="text-xs text-gray-400">{getRoleDescription()}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Permissions (for workers) */}
                    {isWorker && (user as any)?.permissions && (
                        <div className="bg-white rounded-2xl shadow-sm p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Permisos asignados</h3>
                            <div className="flex flex-wrap gap-2">
                                {((user as any).permissions as string[]).map((permission) => (
                                    <span
                                        key={permission}
                                        className="px-3 py-1.5 bg-teal-50 text-teal-700 rounded-full text-sm font-medium capitalize"
                                    >
                                        {permission}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Security Info */}
                    <div className="bg-white rounded-2xl shadow-sm p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Seguridad</h3>
                        <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-100">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <div>
                                <p className="font-medium text-green-800">Cuenta verificada</p>
                                <p className="text-sm text-green-600">Tu cuenta está activa y en buen estado</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
