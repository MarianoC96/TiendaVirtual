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
  usage_count?: number;
  deleted_at?: string;
  deleted_by?: string;
  deleter_name?: string;
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
  const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null);
  const [error, setError] = useState('');

  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM

  const [searchQuery, setSearchQuery] = useState('');

  const filteredDiscounts = discounts.filter(discount => {
    const matchesSearch = discount.name.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeTab === 'history') {
      if (!discount.deleted_at) return false;
      const deletedMonth = discount.deleted_at.slice(0, 7);
      return matchesSearch && deletedMonth === selectedMonth;
    }

    return matchesSearch;
  });

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
  }, [activeTab]); // Refetch when tab changes

  const fetchDiscounts = async () => {
    try {
      const url = activeTab === 'history' ? '/api/admin/discounts?deleted=true' : '/api/admin/discounts';
      const res = await fetch(url);
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

    if (formData.applies_to !== 'cart_value' && !formData.target_id) {
      setError('Debes seleccionar un producto o categoría');
      return;
    }

    if (formData.applies_to === 'cart_value' && formData.target_id <= 0) {
      setError('El valor mínimo del carrito debe ser mayor a 0');
      return;
    }

    try {
      const url = editingDiscount
        ? `/api/admin/discounts/${editingDiscount.id}`
        : '/api/admin/discounts';

      const method = editingDiscount ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Error al guardar descuento');
        return;
      }

      resetForm();
      fetchDiscounts();
    } catch (error) {
      console.error('Error saving discount:', error);
      setError('Error del servidor');
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingDiscount(null);
    setFormData({
      name: '',
      discount_type: 'percentage',
      discount_value: 10,
      applies_to: 'product',
      target_id: 0,
      start_date: '',
      end_date: ''
    });
    setError('');
  };

  const handleEdit = (discount: Discount) => {
    setEditingDiscount(discount);
    setFormData({
      name: discount.name,
      discount_type: discount.discount_type,
      discount_value: discount.discount_value,
      applies_to: discount.applies_to,
      target_id: discount.applies_to === 'cart_value' ? discount.target_id : discount.target_id, // Logic handles min_cart_value stored in target_id
      start_date: discount.start_date ? discount.start_date.split('T')[0] : '',
      end_date: discount.end_date ? discount.end_date.split('T')[0] : ''
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  const handleTabChange = (tab: 'active' | 'history') => {
    setActiveTab(tab);
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
          <h1 className="text-3xl font-bold text-gray-900">Descuentos</h1>
          <p className="text-gray-500 mt-1">Gestiona las reglas de descuentos y promociones</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-2 px-6 py-2.5 bg-rose-600 text-white rounded-xl font-medium hover:bg-rose-700 transition-colors shadow-sm hover:shadow-md cursor-pointer"
        >
          <span className="text-xl leading-none">+</span> Nuevo Descuento
        </button>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-end gap-4 mb-6">
        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => handleTabChange('active')}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'active'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            Activos
          </button>
          <button
            onClick={() => handleTabChange('history')}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'history'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            Historial
          </button>
        </div>

        {activeTab === 'history' && (
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-200 outline-none"
          />
        )}
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

      {/* Search Bar */}
      <div className="mb-6 relative">
        <input
          type="text"
          placeholder="Buscar descuento por nombre..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-200 focus:border-rose-500 transition-all outline-none bg-white shadow-sm"
        />
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {/* Create/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setShowForm(false)}
          />

          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden transform transition-all max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-rose-500 to-rose-600 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span>{editingDiscount ? '✏️' : '🏷️'}</span>
                {editingDiscount ? 'Editar Descuento' : 'Nuevo Descuento'}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-white/80 hover:text-white text-2xl leading-none cursor-pointer w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
              >
                ×
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2">
                  <span>⚠️</span> {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre del Descuento</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-200 focus:border-rose-500 transition-all outline-none"
                      placeholder="Ej: Descuento de Verano"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo de Descuento</label>
                    <select
                      value={formData.discount_type}
                      onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-200 focus:border-rose-500 transition-all outline-none appearance-none bg-white"
                    >
                      <option value="percentage">Porcentaje (%)</option>
                      <option value="fixed">Monto Fijo (S/)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Valor {formData.discount_type === 'percentage' ? '(máx 80%)' : '(S/)'}
                    </label>
                    <div className="relative">
                      {formData.discount_type === 'fixed' && (
                        <span className="absolute left-3 top-2.5 text-gray-500">S/</span>
                      )}
                      <input
                        type="number"
                        value={formData.discount_value}
                        onChange={(e) => setFormData({ ...formData, discount_value: parseFloat(e.target.value) || 0 })}
                        required
                        min="0"
                        max={formData.discount_type === 'percentage' ? 80 : undefined}
                        className={`w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-200 focus:border-rose-500 transition-all outline-none ${formData.discount_type === 'fixed' ? 'pl-8' : ''}`}
                      />
                      {formData.discount_type === 'percentage' && (
                        <span className="absolute right-3 top-2.5 text-gray-500">%</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Aplicar a</label>
                    <select
                      value={formData.applies_to}
                      onChange={(e) => setFormData({ ...formData, applies_to: e.target.value, target_id: 0 })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-200 focus:border-rose-500 transition-all outline-none appearance-none bg-white"
                    >
                      <option value="product">Producto Específico</option>
                      <option value="category">Categoría Completa</option>
                      <option value="cart_value">Valor del Carrito</option>
                    </select>
                  </div>

                  {formData.applies_to === 'cart_value' ? (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Mínimo en Carrito
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-gray-500">S/</span>
                        <input
                          type="number"
                          value={formData.target_id}
                          onChange={(e) => setFormData({ ...formData, target_id: parseFloat(e.target.value) || 0 })}
                          required
                          min="1"
                          step="0.01"
                          className="w-full px-4 py-2.5 pl-8 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-200 focus:border-rose-500 transition-all outline-none"
                          placeholder="0.00"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Se aplica si el total supera este monto</p>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {formData.applies_to === 'product' ? 'Seleccionar Producto' : 'Seleccionar Categoría'}
                      </label>
                      <select
                        value={formData.target_id}
                        onChange={(e) => setFormData({ ...formData, target_id: parseInt(e.target.value) })}
                        required
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-200 focus:border-rose-500 transition-all outline-none appearance-none bg-white"
                      >
                        <option value={0}>Seleccionar...</option>
                        {getTargetOptions().map(opt => (
                          <option key={opt.id} value={opt.id}>{opt.name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Fecha Inicio</label>
                    <input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-200 focus:border-rose-500 transition-all outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Fecha Fin</label>
                    <input
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-200 focus:border-rose-500 transition-all outline-none"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-100 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-rose-600 text-white rounded-xl hover:bg-rose-700 font-medium shadow-sm hover:shadow hover:-translate-y-0.5 transition-all cursor-pointer"
                  >
                    {editingDiscount ? 'Guardar Cambios' : 'Crear Descuento'}
                  </button>
                </div>
              </form>
            </div>
          </div>
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
              {activeTab === 'active' ? (
                <>
                  <th className="px-6 py-4 text-center text-sm font-medium text-gray-500">Uso</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Vigencia</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Creado Por</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Estado</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">Acciones</th>
                </>
              ) : (
                <>
                  <th className="px-6 py-4 text-center text-sm font-medium text-gray-500">Uso Total</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Creado Por</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Eliminado Por</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Fecha Eliminación</th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredDiscounts.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  {searchQuery ? 'No se encontraron descuentos para tu búsqueda' : 'No hay descuentos creados'}
                </td>
              </tr>
            ) : (
              filteredDiscounts.map((discount) => (
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
                        : discount.applies_to === 'category'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-emerald-100 text-emerald-700'
                        }`}>
                        {discount.applies_to === 'product' ? 'Producto' : discount.applies_to === 'category' ? 'Categoría' : 'Carrito'}
                      </span>
                      <div className="text-sm text-gray-500 mt-1">{discount.target_name}</div>
                    </div>
                  </td>
                  {activeTab === 'active' ? (
                    <>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {discount.usage_count || 0}
                        </span>
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
                      <td className="px-6 py-4 text-gray-500 text-sm">
                        {discount.creator_name || <span className="text-gray-400">Sistema</span>}
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
                            onClick={() => handleEdit(discount)}
                            className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-lg text-sm"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(discount.id)}
                            className="px-3 py-1 text-red-600 hover:bg-red-50 rounded-lg text-sm"
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {discount.usage_count || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-sm">
                        {discount.creator_name || <span className="text-gray-400">Sistema</span>}
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-sm">
                        {discount.deleter_name || <span className="text-gray-400">Desconocido</span>}
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-sm">
                        {discount.deleted_at ? new Date(discount.deleted_at).toLocaleString() : '-'}
                      </td>
                    </>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
