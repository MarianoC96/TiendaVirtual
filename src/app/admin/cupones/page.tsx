'use client';

import { useState, useEffect } from 'react';

interface Coupon {
  id: number;
  code: string;
  name: string;
  discount_type: string;
  discount_value: number;
  min_purchase: number;
  max_uses: number | null;
  uses: number;
  active: number;
  created_by: number | null;
  created_at: string;
  deactivated_by: number | null;
  deactivated_at: string | null;
  creator_name?: string;
  deactivator_name?: string;
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    discount_type: 'percentage',
    discount_value: 10,
    min_purchase: 0,
    max_uses: ''
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const res = await fetch('/api/admin/coupons');
      const data = await res.json();
      setCoupons(data);
    } catch (error) {
      console.error('Error fetching coupons:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          max_uses: formData.max_uses ? parseInt(formData.max_uses) : null
        })
      });
      setShowForm(false);
      setFormData({ code: '', name: '', discount_type: 'percentage', discount_value: 10, min_purchase: 0, max_uses: '' });
      fetchCoupons();
    } catch (error) {
      console.error('Error creating coupon:', error);
    }
  };

  const handleToggle = async (id: number, active: number) => {
    try {
      await fetch(`/api/admin/coupons/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: active ? 0 : 1 })
      });
      fetchCoupons();
    } catch (error) {
      console.error('Error toggling coupon:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de desactivar este cupón permanentemente?')) return;
    try {
      await fetch(`/api/admin/coupons/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
      fetchCoupons();
    } catch (error) {
      console.error('Error deleting coupon:', error);
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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Cupones</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-rose-600 text-white rounded-xl font-medium hover:bg-rose-700 transition-colors"
        >
          + Nuevo Cupón
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Crear Cupón</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Código</label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-rose-500"
                placeholder="DESCUENTO10"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-rose-500"
                placeholder="Descuento de bienvenida"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
              <select
                value={formData.discount_type}
                onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-rose-500"
              >
                <option value="percentage">Porcentaje (%)</option>
                <option value="fixed">Monto Fijo (S/)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valor</label>
              <input
                type="number"
                value={formData.discount_value}
                onChange={(e) => setFormData({ ...formData, discount_value: parseFloat(e.target.value) })}
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-rose-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Compra Mínima</label>
              <input
                type="number"
                value={formData.min_purchase}
                onChange={(e) => setFormData({ ...formData, min_purchase: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-rose-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Usos Máximos</label>
              <input
                type="number"
                value={formData.max_uses}
                onChange={(e) => setFormData({ ...formData, max_uses: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-rose-500"
                placeholder="Ilimitado"
              />
            </div>
            <div className="md:col-span-2 lg:col-span-3 flex gap-2">
              <button type="submit" className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700">
                Crear Cupón
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Coupons Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Código</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Nombre</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Descuento</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Usos</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Creado</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Estado</th>
              <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {coupons.map((coupon) => (
              <tr key={coupon.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-mono font-medium text-gray-900">{coupon.code}</td>
                <td className="px-6 py-4 text-gray-600">{coupon.name}</td>
                <td className="px-6 py-4 text-gray-900">
                  {coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : `S/ ${coupon.discount_value}`}
                </td>
                <td className="px-6 py-4 text-gray-600">
                  {coupon.uses} / {coupon.max_uses || '∞'}
                </td>
                <td className="px-6 py-4 text-gray-500 text-sm">
                  <div>{new Date(coupon.created_at).toLocaleDateString('es-PE')}</div>
                  {coupon.creator_name && (
                    <div className="text-xs text-gray-400">por {coupon.creator_name}</div>
                  )}
                </td>
                <td className="px-6 py-4">
                  {coupon.deactivated_at ? (
                    <div>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                        Eliminado
                      </span>
                      {coupon.deactivator_name && (
                        <div className="text-xs text-gray-400 mt-1">por {coupon.deactivator_name}</div>
                      )}
                    </div>
                  ) : (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${coupon.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                      {coupon.active ? 'Activo' : 'Inactivo'}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  {!coupon.deactivated_at && (
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleToggle(coupon.id, coupon.active)}
                        className={`px-3 py-1 rounded-lg text-sm ${coupon.active ? 'text-amber-600 hover:bg-amber-50' : 'text-green-600 hover:bg-green-50'
                          }`}
                      >
                        {coupon.active ? 'Pausar' : 'Activar'}
                      </button>
                      <button
                        onClick={() => handleDelete(coupon.id)}
                        className="px-3 py-1 text-red-600 hover:bg-red-50 rounded-lg text-sm"
                      >
                        Eliminar
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
