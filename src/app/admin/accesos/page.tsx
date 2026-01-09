'use client';

import { useState, useEffect } from 'react';

interface Worker {
    id: number;
    name: string;
    email: string;
    permissions: string[];
}

interface PermissionsData {
    workers: Worker[];
    availablePermissions: string[];
}

const PERMISSION_LABELS: Record<string, { label: string; icon: string; description: string }> = {
    dashboard: { label: 'Dashboard', icon: '📊', description: 'Vista general y estadísticas' },
    productos: { label: 'Productos', icon: '📦', description: 'Gestión de inventario' },
    categorias: { label: 'Categorías', icon: '🏷️', description: 'Organización de productos' },
    pedidos: { label: 'Pedidos', icon: '📋', description: 'Gestión de ventas' },
    historial: { label: 'Historial', icon: '🕐', description: 'Registro histórico' },
    descuentos: { label: 'Descuentos', icon: '💰', description: 'Promociones y ofertas' },
    cupones: { label: 'Cupones', icon: '🎟️', description: 'Códigos de descuento' }
};

export default function AccesosPage() {
    const [data, setData] = useState<PermissionsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<number | null>(null);
    const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
    const [editedPermissions, setEditedPermissions] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await fetch('/api/admin/permissions');
            const result = await res.json();
            setData(result);
        } catch (error) {
            console.error('Error fetching permissions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectWorker = (worker: Worker) => {
        setSelectedWorker(worker);
        setEditedPermissions([...worker.permissions]);
    };

    const handleTogglePermission = (permission: string) => {
        setEditedPermissions(prev =>
            prev.includes(permission)
                ? prev.filter(p => p !== permission)
                : [...prev, permission]
        );
    };

    const handleSelectAll = () => {
        if (data) {
            setEditedPermissions([...data.availablePermissions]);
        }
    };

    const handleClearAll = () => {
        setEditedPermissions([]);
    };

    const handleSave = async () => {
        if (!selectedWorker) return;

        setSaving(selectedWorker.id);
        try {
            const res = await fetch('/api/admin/permissions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: selectedWorker.id,
                    permissions: editedPermissions
                })
            });

            if (res.ok) {
                setData(prev => prev ? {
                    ...prev,
                    workers: prev.workers.map(w =>
                        w.id === selectedWorker.id
                            ? { ...w, permissions: editedPermissions }
                            : w
                    )
                } : null);
                setSelectedWorker(prev => prev ? { ...prev, permissions: editedPermissions } : null);
            } else {
                const error = await res.json();
                alert(error.error || 'Error al guardar');
            }
        } catch (error) {
            console.error('Error saving permissions:', error);
            alert('Error al guardar los permisos');
        } finally {
            setSaving(null);
        }
    };

    // Filtrar trabajadores por búsqueda
    const filteredWorkers = data?.workers.filter(worker =>
        worker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        worker.email.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-600 border-t-transparent" />
            </div>
        );
    }

    return (
        <div>
            <div className="mb-6 lg:mb-8">
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Control de Accesos</h1>
                <p className="text-gray-600 mt-1 lg:mt-2 text-sm lg:text-base">
                    Asigna permisos de acceso a los trabajadores del sistema
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Panel de búsqueda y lista de trabajadores */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                        {/* Barra de búsqueda */}
                        <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-teal-50 to-cyan-50">
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </span>
                                <input
                                    type="text"
                                    placeholder="Buscar trabajador..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white"
                                />
                            </div>
                        </div>

                        {/* Lista de trabajadores */}
                        <div className="p-4">
                            <div className="flex justify-between items-center mb-3">
                                <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                                    Trabajadores
                                </h2>
                                <span className="text-xs text-gray-400">
                                    {filteredWorkers.length} de {data?.workers.length || 0}
                                </span>
                            </div>

                            {filteredWorkers.length === 0 ? (
                                <div className="text-center py-8">
                                    <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    <p className="text-gray-500 text-sm">
                                        {searchQuery ? 'Sin resultados' : 'No hay trabajadores registrados'}
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-2 max-h-96 overflow-y-auto">
                                    {filteredWorkers.map(worker => (
                                        <button
                                            key={worker.id}
                                            onClick={() => handleSelectWorker(worker)}
                                            className={`w-full text-left p-4 rounded-xl transition-all ${selectedWorker?.id === worker.id
                                                ? 'bg-teal-50 border-2 border-teal-300 shadow-sm'
                                                : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${selectedWorker?.id === worker.id ? 'bg-teal-500' : 'bg-gray-400'
                                                    }`}>
                                                    {worker.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-gray-900 truncate">{worker.name}</p>
                                                    <p className="text-xs text-gray-500 truncate">{worker.email}</p>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${worker.permissions.length > 0
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-gray-100 text-gray-500'
                                                        }`}>
                                                        {worker.permissions.length}
                                                    </span>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Panel de Permisos */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                        {selectedWorker ? (
                            <>
                                {/* Header del panel de permisos */}
                                <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-teal-50 to-cyan-50">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-full bg-teal-500 flex items-center justify-center text-white text-2xl font-bold">
                                                {selectedWorker.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-bold text-gray-900">{selectedWorker.name}</h2>
                                                <p className="text-sm text-gray-500">{selectedWorker.email}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleSave}
                                            disabled={saving === selectedWorker.id}
                                            className="px-5 py-2.5 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-teal-200"
                                        >
                                            {saving === selectedWorker.id ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                    Guardando...
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    Guardar Cambios
                                                </>
                                            )}
                                        </button>
                                    </div>

                                    {/* Acciones rápidas */}
                                    <div className="flex gap-2 mt-4">
                                        <button
                                            onClick={handleSelectAll}
                                            className="text-xs px-3 py-1.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600"
                                        >
                                            Seleccionar todo
                                        </button>
                                        <button
                                            onClick={handleClearAll}
                                            className="text-xs px-3 py-1.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600"
                                        >
                                            Limpiar selección
                                        </button>
                                    </div>
                                </div>

                                {/* Grid de permisos */}
                                <div className="p-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {data?.availablePermissions.map(permission => {
                                            const permInfo = PERMISSION_LABELS[permission] || { label: permission, icon: '📄', description: '' };
                                            const isSelected = editedPermissions.includes(permission);

                                            return (
                                                <label
                                                    key={permission}
                                                    className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${isSelected
                                                        ? 'border-teal-300 bg-teal-50 shadow-sm'
                                                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() => handleTogglePermission(permission)}
                                                        className="w-5 h-5 mt-0.5 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                                                    />
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xl">{permInfo.icon}</span>
                                                            <span className="font-medium text-gray-900">{permInfo.label}</span>
                                                        </div>
                                                        <p className="text-xs text-gray-500 mt-1">{permInfo.description}</p>
                                                    </div>
                                                </label>
                                            );
                                        })}
                                    </div>

                                    <div className="mt-6 p-4 bg-teal-50 rounded-xl border border-teal-100">
                                        <div className="flex gap-3">
                                            <span className="text-teal-500">💡</span>
                                            <p className="text-sm text-teal-700">
                                                Los permisos se aplicarán cuando el trabajador inicie sesión nuevamente.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
                                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Selecciona un trabajador</h3>
                                <p className="text-gray-500 text-sm max-w-xs">
                                    Busca y selecciona un trabajador de la lista para configurar sus permisos de acceso al sistema
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
