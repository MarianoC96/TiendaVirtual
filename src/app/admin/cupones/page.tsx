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
  deleted_at: string | null;
  deleted_by: string | null;
  creator_name?: string;
  // New fields
  applies_to: string; // 'product', 'category', 'cart_value'
  target_id: number;
  usage_limit_per_user: number;
  expires_at: string | null;
  deactivator_name?: string;
  deleter_name?: string;
  target_name?: string;
}

interface Product {
  id: number;
  name: string;
}

interface Category {
  id: number;
  name: string;
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');

  const filteredCoupons = coupons.filter(coupon => {
    const matchesSearch = coupon.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      coupon.name.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeTab === 'history') {
      if (!coupon.deleted_at) return false;
      const deletedMonth = coupon.deleted_at.slice(0, 7);
      return matchesSearch && deletedMonth === selectedMonth;
    }

    return matchesSearch;
  });

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    discount_type: 'percentage',
    discount_value: 10,
    min_purchase: 0,
    max_uses: '',
    applies_to: 'cart_value',
    target_id: 0,
    usage_limit_per_user: '',
    expires_at: ''
  });

  useEffect(() => {
    fetchCoupons();
    fetchProducts();
    fetchCategories();
  }, [activeTab]); // Depend on activeTab

  const fetchCoupons = async () => {
    try {
      const url = activeTab === 'history' ? '/api/admin/coupons?deleted=true' : '/api/admin/coupons';
      const res = await fetch(url);
      const data = await res.json();
      setCoupons(data);
    } catch (error) {
      console.error('Error fetching coupons:', error);
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

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      name: coupon.name,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      min_purchase: coupon.min_purchase,
      max_uses: coupon.max_uses ? coupon.max_uses.toString() : '',
      applies_to: coupon.applies_to || 'cart_value',
      target_id: coupon.target_id || 0,
      usage_limit_per_user: coupon.usage_limit_per_user ? coupon.usage_limit_per_user.toString() : '',
      expires_at: coupon.expires_at ? new Date(coupon.expires_at).toISOString().split('T')[0] : ''
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingCoupon(null);
    setFormData({
      code: '',
      name: '',
      discount_type: 'percentage',
      discount_value: 10,
      min_purchase: 0,
      max_uses: '',
      applies_to: 'cart_value',
      target_id: 0,
      usage_limit_per_user: '',
      expires_at: ''
    });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validations
    if (formData.applies_to !== 'cart_value' && !formData.target_id) {
      setError('Debes seleccionar un producto o categoría');
      return;
    }

    try {
      const url = editingCoupon
        ? `/api/admin/coupons/${editingCoupon.id}`
        : '/api/admin/coupons';

      const method = editingCoupon ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          max_uses: formData.max_uses ? parseInt(formData.max_uses) : null,
          usage_limit_per_user: formData.usage_limit_per_user ? parseInt(formData.usage_limit_per_user) : 0,
          target_id: parseInt(formData.target_id.toString())
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al guardar');
      }

      resetForm();
      fetchCoupons();
    } catch (error: any) {
      console.error('Error saving coupon:', error);
      setError(error.message || 'Error al guardar cupón');
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
    if (!confirm('¿Estás seguro de eliminar este cupón?')) return;
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

  const getTargetOptions = () => {
    if (formData.applies_to === 'product') return products;
    if (formData.applies_to === 'category') return categories;
    return [];
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
          <h1 className="text-3xl font-bold text-gray-900">Cupones</h1>
          <p className="text-gray-500 mt-1">Gestiona códigos promocionales y reglas de canje</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-2 px-6 py-2.5 bg-rose-600 text-white rounded-xl font-medium hover:bg-rose-700 transition-colors shadow-sm hover:shadow-md cursor-pointer"
        >
          <span className="text-xl leading-none">+</span> Nuevo Cupón
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

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-sm text-blue-800 flex gap-2">
        <span>💡</span>
        <p>Los cupones pueden aplicarse a todo el carrito, o restringirse a productos/categorías específicas.</p>
      </div>

      {/* Search Bar */}
      <div className="mb-6 relative">
        <input
          type="text"
          placeholder="Buscar cupón por código o nombre..."
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

          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden transform transition-all max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-rose-500 to-rose-600 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span>{editingCoupon ? '✏️' : '🎟️'}</span>
                {editingCoupon ? 'Editar Cupón' : 'Nuevo Cupón'}
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
                  {/* Basic Info */}
                  <div className="col-span-1 md:col-span-2 space-y-4">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b pb-2">Información Básica</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Código del Cupón</label>
                        <input
                          type="text"
                          value={formData.code}
                          onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase().replace(/\s/g, '') })}
                          required
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-200 focus:border-rose-500 font-mono text-lg uppercase transition-all outline-none"
                          placeholder="VERANO2026"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre Descriptivo</label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-200 focus:border-rose-500 transition-all outline-none"
                          placeholder="Descuento Especial de Verano"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Discount Rules */}
                  <div className="col-span-1 md:col-span-2 space-y-4">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b pb-2">Reglas de Descuento</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo</label>
                        <select
                          value={formData.discount_type}
                          onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-200 focus:border-rose-500 outline-none bg-white"
                        >
                          <option value="percentage">Porcentaje (%)</option>
                          <option value="fixed">Monto Fijo (S/)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Valor</label>
                        <input
                          type="number"
                          value={formData.discount_value}
                          onChange={(e) => setFormData({ ...formData, discount_value: parseFloat(e.target.value) || 0 })}
                          required
                          min="0"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-200 focus:border-rose-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Aplicar a</label>
                        <select
                          value={formData.applies_to}
                          onChange={(e) => setFormData({ ...formData, applies_to: e.target.value, target_id: 0 })}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-200 focus:border-rose-500 outline-none bg-white"
                        >
                          <option value="cart_value">Todo el Carrito</option>
                          <option value="product">Producto Específico</option>
                          <option value="category">Categoría Específica</option>
                        </select>
                      </div>
                    </div>

                    {formData.applies_to !== 'cart_value' && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          {formData.applies_to === 'product' ? 'Selecciona el Producto' : 'Selecciona la Categoría'}
                        </label>
                        <select
                          value={formData.target_id}
                          onChange={(e) => setFormData({ ...formData, target_id: parseInt(e.target.value) })}
                          required
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-200 focus:border-rose-500 outline-none bg-white"
                        >
                          <option value={0}>Seleccionar...</option>
                          {getTargetOptions().map((opt: any) => (
                            <option key={opt.id} value={opt.id}>{opt.name}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Limits */}
                  <div className="col-span-1 md:col-span-2 space-y-4">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b pb-2">Límites y Vigencia</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Compra Mínima (S/)</label>
                        <input
                          type="number"
                          value={formData.min_purchase}
                          onChange={(e) => setFormData({ ...formData, min_purchase: parseFloat(e.target.value) || 0 })}
                          min="0"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-200 focus:border-rose-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Límite Global Usos</label>
                        <input
                          type="number"
                          value={formData.max_uses}
                          onChange={(e) => setFormData({ ...formData, max_uses: e.target.value })}
                          min="1"
                          placeholder="Ilimitado"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-200 focus:border-rose-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Límite por Usuario</label>
                        <input
                          type="number"
                          value={formData.usage_limit_per_user}
                          onChange={(e) => setFormData({ ...formData, usage_limit_per_user: e.target.value })}
                          min="1"
                          placeholder="Ilimitado"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-200 focus:border-rose-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Fecha Expiración</label>
                        <input
                          type="date"
                          value={formData.expires_at}
                          onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-200 focus:border-rose-500 outline-none"
                        />
                      </div>
                    </div>
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
                    {editingCoupon ? 'Guardar Cambios' : 'Crear Cupón'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Coupons Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Código</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Descuento</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Aplicable a</th>
              {activeTab === 'active' ? (
                <>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Uso</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Creado Por</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Estado</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">Acciones</th>
                </>
              ) : (
                <>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Creado Por</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Eliminado Por</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Fecha Eliminación</th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredCoupons.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  {searchQuery ? 'No se encontraron cupones para tu búsqueda' : 'No hay cupones activos'}
                </td>
              </tr>
            ) : (
              filteredCoupons.map((coupon) => (
                <tr key={coupon.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-mono font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded inline-block">
                      {coupon.code}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{coupon.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-rose-600">
                      {coupon.discount_type === 'percentage' ? `${coupon.discount_value}% OFF` : `- S/ ${coupon.discount_value}`}
                    </span>
                    {coupon.min_purchase > 0 && (
                      <div className="text-xs text-gray-500">Min: S/ {coupon.min_purchase}</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium w-fit ${coupon.applies_to === 'product' ? 'bg-blue-100 text-blue-700' :
                        coupon.applies_to === 'category' ? 'bg-purple-100 text-purple-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                        {coupon.applies_to === 'product' ? 'Producto' :
                          coupon.applies_to === 'category' ? 'Categoría' : 'Todo el Carrito'}
                      </span>
                      {(coupon.applies_to === 'product' || coupon.applies_to === 'category') && (
                        <span className="text-sm text-gray-600 mt-1 truncate max-w-[150px]" title={coupon.target_name}>
                          {coupon.target_name}
                        </span>
                      )}
                    </div>
                  </td>
                  {activeTab === 'active' ? (
                    <>
                      <td className="px-6 py-4 text-sm text-gray-600 space-y-1">
                        <div>
                          <span className="font-medium text-gray-900">{coupon.uses}</span>
                          <span className="text-gray-400"> / {coupon.max_uses || '∞'} total</span>
                        </div>
                        {coupon.usage_limit_per_user > 0 && (
                          <div className="text-xs text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded w-fit">
                            Lim. Usuario: {coupon.usage_limit_per_user}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-sm">
                        {coupon.creator_name || <span className="text-gray-400">Sistema</span>}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${coupon.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                          }`}>
                          {coupon.active ? 'Activo' : 'Inactivo'}
                        </span>
                        {coupon.expires_at && (
                          <div className={`text-xs mt-1 ${new Date(coupon.expires_at) < new Date() ? 'text-red-500 font-medium' : 'text-gray-500'}`}>
                            Exp: {new Date(coupon.expires_at).toLocaleDateString('es-PE')}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleToggle(coupon.id, coupon.active)}
                            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${coupon.active
                              ? 'text-amber-600 hover:bg-amber-50'
                              : 'text-green-600 hover:bg-green-50'
                              }`}
                          >
                            {coupon.active ? 'Pausar' : 'Activar'}
                          </button>
                          <button
                            onClick={() => handleEdit(coupon)}
                            className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-lg text-sm font-medium transition-colors"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(coupon.id)}
                            className="px-3 py-1 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors"
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-6 py-4 text-gray-500 text-sm">
                        {coupon.creator_name || <span className="text-gray-400">Sistema</span>}
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-sm">
                        {coupon.deleter_name || <span className="text-gray-400">Desconocido</span>}
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-sm">
                        {coupon.deleted_at ? new Date(coupon.deleted_at).toLocaleString() : '-'}
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
