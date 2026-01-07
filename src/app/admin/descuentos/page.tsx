'use client';

import { useState, useEffect } from 'react';

interface Discount {
  id: number;
  name: string;
  discount_type: string;
  discount_value: number;
  applies_to: string;
  target_id: number;
  target_name?: string;
  start_date: string | null;
  end_date: string | null;
  active: number;
  created_by: number | null;
  created_at: string;
  creator_name?: string;
}

interface Product {
  id: number;
  name: string;
}

interface Category {
  id: number;
  name: string;
}

export default function AdminDiscountsPage() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    discount_type: 'percentage',
    discount_value: 10,
    applies_to: 'product',
    target_id: 0,
    start_date: '',
    end_date: ''
  });

  useEffect(() => {
    fetchDiscounts();
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchDiscounts = async () => {
    try {
      const res = await fetch('/api/admin/discounts');
      const data = await res.json();
      setDiscounts(data);
    } catch (error) {
      console.error('Error fetching discounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate 80% max for percentage discounts
    if (formData.discount_type === 'percentage' && formData.discount_value > 80) {
      setError('El descuento porcentual no puede superar el 80%');
      return;
    }

    if (!formData.target_id) {
      setError('Debes seleccionar un producto o categoría');
      return;
    }

    try {
      const res = await fetch('/api/admin/discounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Error al crear descuento');
        return;
      }

      setShowForm(false);
      setFormData({
        name: '',
        discount_type: 'percentage',
        discount_value: 10,
        applies_to: 'product',
        target_id: 0,
        start_date: '',
        end_date: ''
      });
      fetchDiscounts();
    } catch (error) {
      console.error('Error creating discount:', error);
      setError('Error del servidor');
    }
  };

  const handleToggle = async (id: number, active: number) => {
    try {
      await fetch(`/api/admin/discounts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: active ? 0 : 1 })
      });
      fetchDiscounts();
    } catch (error) {
      console.error('Error toggling discount:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este descuento?')) return;
    try {
      await fetch(`/api/admin/discounts/${id}`, {
        method: 'DELETE'
      });
      fetchDiscounts();
    } catch (error) {
      console.error('Error deleting discount:', error);
    }
  };

  const getTargetOptions = () => {
    if (formData.applies_to === 'product') {
      return products.map(p => ({ id: p.id, name: p.name }));
    }
    return categories.map(c => ({ id: c.id, name: c.name }));
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
        <h1 className="text-3xl font-bold text-gray-900">Descuentos</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-rose-600 text-white rounded-xl font-medium hover:bg-rose-700 transition-colors"
        >
          + Nuevo Descuento
        </button>
      </div>

      {/* Info banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
        <div className="flex gap-2">
          <span className="text-amber-600">⚠️</span>
          <p className="text-amber-800 text-sm">
            Los descuentos combinados (producto + categoría + cupón) no pueden superar el <strong>80%</strong> del precio total.
          </p>
        </div>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Crear Descuento</h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-rose-500"
                placeholder="Descuento de temporada"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valor {formData.discount_type === 'percentage' ? '(máx 80%)' : ''}
              </label>
              <input
                type="number"
                value={formData.discount_value}
                onChange={(e) => setFormData({ ...formData, discount_value: parseFloat(e.target.value) || 0 })}
                required
                min="0"
                max={formData.discount_type === 'percentage' ? 80 : undefined}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-rose-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Aplicar a</label>
              <select
                value={formData.applies_to}
                onChange={(e) => setFormData({ ...formData, applies_to: e.target.value, target_id: 0 })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-rose-500"
              >
                <option value="product">Producto</option>
                <option value="category">Categoría</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {formData.applies_to === 'product' ? 'Producto' : 'Categoría'}
              </label>
              <select
                value={formData.target_id}
                onChange={(e) => setFormData({ ...formData, target_id: parseInt(e.target.value) })}
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-rose-500"
              >
                <option value={0}>Seleccionar...</option>
                {getTargetOptions().map(opt => (
                  <option key={opt.id} value={opt.id}>{opt.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio</label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-rose-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Fin</label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-rose-500"
              />
            </div>
            <div className="md:col-span-2 lg:col-span-3 flex gap-2">
              <button type="submit" className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700">
                Crear Descuento
              </button>
              <button type="button" onClick={() => { setShowForm(false); setError(''); }} className="px-4 py-2 border rounded-lg hover:bg-gray-50">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Discounts Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Nombre</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Descuento</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Aplica a</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Vigencia</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Estado</th>
              <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {discounts.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  No hay descuentos creados
                </td>
              </tr>
            ) : (
              discounts.map((discount) => (
                <tr key={discount.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{discount.name}</td>
                  <td className="px-6 py-4 text-gray-900">
                    {discount.discount_type === 'percentage'
                      ? `${discount.discount_value}%`
                      : `S/ ${discount.discount_value.toFixed(2)}`}
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${discount.applies_to === 'product'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-purple-100 text-purple-700'
                        }`}>
                        {discount.applies_to === 'product' ? 'Producto' : 'Categoría'}
                      </span>
                      <div className="text-sm text-gray-500 mt-1">{discount.target_name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-sm">
                    {discount.start_date || discount.end_date ? (
                      <div>
                        {discount.start_date && <div>Desde: {new Date(discount.start_date).toLocaleDateString('es-PE')}</div>}
                        {discount.end_date && <div>Hasta: {new Date(discount.end_date).toLocaleDateString('es-PE')}</div>}
                      </div>
                    ) : (
                      <span className="text-gray-400">Sin límite</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${discount.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                      {discount.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleToggle(discount.id, discount.active)}
                        className={`px-3 py-1 rounded-lg text-sm ${discount.active
                            ? 'text-amber-600 hover:bg-amber-50'
                            : 'text-green-600 hover:bg-green-50'
                          }`}
                      >
                        {discount.active ? 'Pausar' : 'Activar'}
                      </button>
                      <button
                        onClick={() => handleDelete(discount.id)}
                        className="px-3 py-1 text-red-600 hover:bg-red-50 rounded-lg text-sm"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
