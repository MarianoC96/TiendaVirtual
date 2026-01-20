'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

interface User {
    id: number;
    name: string;
    email: string;
    role: 'user' | 'worker' | 'assistant' | 'admin';
    active: boolean;
    created_at: string;
}

export default function UsuariosPage() {
    const { isAdmin, loading } = useAuth();
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterRole, setFilterRole] = useState<string>('all');
    const [filterStatus, setFilterStatus] = useState<string>('all');

    // Edit modal state
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [editForm, setEditForm] = useState({ name: '', email: '', role: '' });
    const [saving, setSaving] = useState(false);

    // Redirect if not admin
    useEffect(() => {
        if (!loading && !isAdmin) {
            router.push('/admin');
        }
    }, [loading, isAdmin, router]);

    // Fetch users
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await fetch('/api/admin/users');
                const data = await res.json();
                setUsers(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error('Error fetching users:', error);
            } finally {
                setLoadingUsers(false);
            }
        };

        if (isAdmin) {
            fetchUsers();
        }
    }, [isAdmin]);

    // Filter users
    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = filterRole === 'all' || user.role === filterRole;
        const matchesStatus = filterStatus === 'all' ||
            (filterStatus === 'active' && user.active) ||
            (filterStatus === 'inactive' && !user.active);
        return matchesSearch && matchesRole && matchesStatus;
    });

    // Open edit modal
    const handleEdit = (user: User) => {
        setEditingUser(user);
        setEditForm({ name: user.name, email: user.email, role: user.role });
    };

    // Save user changes
    const handleSave = async () => {
        if (!editingUser) return;
        setSaving(true);

        try {
            const res = await fetch(`/api/admin/users/${editingUser.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editForm)
            });

            if (res.ok) {
                setUsers(users.map(u =>
                    u.id === editingUser.id
                        ? { ...u, name: editForm.name, email: editForm.email, role: editForm.role as User['role'] }
                        : u
                ));
                setEditingUser(null);
            } else {
                const data = await res.json();
                alert(data.error || 'Error al guardar');
            }
        } catch (error) {
            console.error('Error saving user:', error);
            alert('Error al guardar');
        } finally {
            setSaving(false);
        }
    };

    // Toggle user active status
    const toggleActive = async (user: User) => {
        try {
            const res = await fetch(`/api/admin/users/${user.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ active: !user.active })
            });

            if (res.ok) {
                setUsers(users.map(u =>
                    u.id === user.id ? { ...u, active: !u.active } : u
                ));
            }
        } catch (error) {
            console.error('Error toggling user status:', error);
        }
    };

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'admin':
                return <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded-full">Administrador</span>;
            case 'worker':
                return <span className="px-2 py-1 text-xs font-medium bg-teal-100 text-teal-700 rounded-full">Trabajador</span>;
            case 'assistant':
                return <span className="px-2 py-1 text-xs font-medium bg-cyan-100 text-cyan-700 rounded-full">Asistente</span>;
            default:
                return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">Cliente</span>;
        }
    };

    if (loading || !isAdmin) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-600 border-t-transparent" />
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Usuarios</h1>
                    <p className="text-gray-500 mt-1">Gestiona los usuarios del sistema</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">{filteredUsers.length} usuarios</span>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1">
                        <div className="relative">
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Buscar por nombre o correo..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                            />
                        </div>
                    </div>

                    {/* Role filter */}
                    <select
                        value={filterRole}
                        onChange={(e) => setFilterRole(e.target.value)}
                        className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                        <option value="all">Todos los roles</option>
                        <option value="admin">Administradores</option>
                        <option value="worker">Trabajador</option>
                        <option value="assistant">Asistente</option>
                        <option value="user">Clientes</option>
                    </select>

                    {/* Status filter */}
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                        <option value="all">Todos los estados</option>
                        <option value="active">Activos</option>
                        <option value="inactive">Deshabilitados</option>
                    </select>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                {loadingUsers ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-4 border-teal-600 border-t-transparent" />
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="text-center py-12">
                        <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <p className="text-gray-500">No se encontraron usuarios</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Registro</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredUsers.map((user) => (
                                    <tr key={user.id} className={`hover:bg-gray-50 ${!user.active ? 'opacity-60' : ''}`}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                                                    <span className="text-teal-600 font-medium">
                                                        {user.name.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{user.name}</p>
                                                    <p className="text-sm text-gray-500">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getRoleBadge(user.role)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {user.active ? (
                                                <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">Activo</span>
                                            ) : (
                                                <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">Deshabilitado</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(user.created_at).toLocaleDateString('es-PE')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {user.name !== 'SAdmin' && (
                                                    <button
                                                        onClick={() => handleEdit(user)}
                                                        className="px-3 py-1 text-teal-600 hover:bg-teal-50 rounded-lg text-sm cursor-pointer"
                                                    >
                                                        Editar
                                                    </button>
                                                )}
                                                {user.name !== 'SAdmin' && (
                                                    <button
                                                        onClick={() => toggleActive(user)}
                                                        className={`px-3 py-1 rounded-lg text-sm cursor-pointer ${user.active ? 'text-amber-600 hover:bg-amber-50' : 'text-green-600 hover:bg-green-50'}`}
                                                    >
                                                        {user.active ? 'Deshabilitar' : 'Habilitar'}
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            {editingUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setEditingUser(null)} />
                    <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Editar Usuario</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                                <input
                                    type="text"
                                    value={editForm.name}
                                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Correo</label>
                                <input
                                    type="email"
                                    value={editForm.email}
                                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                                <select
                                    value={editForm.role}
                                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                                >
                                    <option value="user">Cliente</option>
                                    <option value="worker">Trabajador</option>
                                    <option value="assistant">Asistente</option>
                                    <option value="admin">Administrador</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => setEditingUser(null)}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg disabled:opacity-50"
                            >
                                {saving ? 'Guardando...' : 'Guardar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
