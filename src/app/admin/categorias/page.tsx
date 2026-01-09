'use client';

import { useState, useEffect } from 'react';

interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;
  description: string | null;
  product_count: number;
  created_by?: number;
  creator_name?: string;
  deleted_at?: string;
  deleted_by?: string;
  deleter_name?: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  image_url: string | null;
  is_featured: boolean;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    icon: '📦',
    slug: '',
    description: ''
  });

  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM


  const [searchQuery, setSearchQuery] = useState('');

  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.slug.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeTab === 'history') {
      if (!category.deleted_at) return false;
      const deletedMonth = category.deleted_at.slice(0, 7);
      return matchesSearch && deletedMonth === selectedMonth;
    }

    return matchesSearch;
  });

  // Modal de productos
  const [viewingCategory, setViewingCategory] = useState<Category | null>(null);
  const [categoryProducts, setCategoryProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const url = activeTab === 'history' ? '/api/admin/categories?deleted=true' : '/api/admin/categories';
      const res = await fetch(url);
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', icon: '📦', slug: '', description: '' });
    setEditingId(null);
    setShowForm(false);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.icon) {
      setError('Nombre e icono son requeridos');
      return;
    }

    try {
      const url = editingId
        ? `/api/admin/categories/${editingId}`
        : '/api/admin/categories';

      const res = await fetch(url, {
        method: editingId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Error al guardar');
        return;
      }

      resetForm();
      fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      setError('Error del servidor');
    }
  };

  const handleEdit = (category: Category) => {
    setFormData({
      name: category.name,
      icon: category.icon,
      slug: category.slug,
      description: category.description || ''
    });
    setEditingId(category.id);
    setShowForm(true);
    setError('');
  };

  const handleViewProducts = async (category: Category) => {
    setViewingCategory(category);
    setLoadingProducts(true);
    setCategoryProducts([]);

    try {
      // Obtener todos los productos y filtrar por category_id
      const res = await fetch('/api/products');
      const data = await res.json();
      const filtered = Array.isArray(data)
        ? data.filter((p: Product & { category_id?: number }) => p.category_id === category.id)
        : [];
      setCategoryProducts(filtered);
    } catch (error) {
      console.error('Error fetching products:', error);
      setCategoryProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleTabChange = (tab: 'active' | 'history') => {
    setActiveTab(tab);
    // Fetch happens in useEffect depend on activeTab? No, simple re-fetch
    // We need useEffect to trigger fetch OR call fetch manually. 
    // Let's rely on calling fetch in useEffect if we add activeTab dependency
  };

  useEffect(() => {
    fetchCategories();
  }, [activeTab]);

  const handleDelete = async (id: number, productCount: number) => {
    if (productCount > 0) {
      alert(`No se puede eliminar: hay ${productCount} producto(s) en esta categoría`);
      return;
    }

    if (!confirm('¿Estás seguro de eliminar esta categoría?')) return;

    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || 'Error al eliminar');
        return;
      }

      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const commonIcons = ['☕', '👕', '📓', '🥤', '🎁', '🏢', '🎨', '🛍️', '📱', '🎵', '📦', '✨'];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Categorías</h1>
          <p className="text-gray-500 mt-1">Gestiona las categorías de tus productos</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-2 px-6 py-2.5 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 transition-colors shadow-sm hover:shadow-md cursor-pointer"
        >
          <span className="text-xl leading-none">+</span> Nueva Categoría
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
            Activas
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
            className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-200 outline-none"
          />
        )}
      </div>

      {/* Search Bar */}
      <div className="mb-6 relative">
        <input
          type="text"
          placeholder="Buscar categoría por nombre..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-200 focus:border-teal-500 transition-all outline-none bg-white shadow-sm"
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

          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-teal-500 to-teal-600 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span>{editingId ? '✏️' : '✨'}</span>
                {editingId ? 'Editar Categoría' : 'Nueva Categoría'}
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
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre de la Categoría</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-200 focus:border-teal-500 transition-all outline-none"
                      placeholder="Ej: Bebidas Calientes"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Icono o Emoji</label>
                    <div className="flex gap-3">
                      <div className="relative">
                        <input
                          type="text"
                          value={formData.icon}
                          onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                          required
                          className="w-16 h-12 px-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-200 focus:border-teal-500 text-2xl text-center outline-none"
                        />
                      </div>
                      <div className="flex-1 bg-gray-50 rounded-xl p-2 border border-gray-100 flex flex-wrap gap-1.5 h-12 overflow-y-auto">
                        {commonIcons.map((icon) => (
                          <button
                            key={icon}
                            type="button"
                            onClick={() => setFormData({ ...formData, icon })}
                            className={`w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white hover:shadow-sm transition-all cursor-pointer text-lg ${formData.icon === icon ? 'bg-white shadow-sm ring-1 ring-teal-200' : 'text-gray-500'}`}
                          >
                            {icon}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {editingId && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Slug (URL)</label>
                      <div className="flex items-center">
                        <span className="bg-gray-50 text-gray-500 px-3 py-2.5 border border-r-0 border-gray-300 rounded-l-xl text-sm">/categoria/</span>
                        <input
                          type="text"
                          value={formData.slug}
                          onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                          className="flex-1 px-4 py-2.5 border border-gray-300 rounded-r-xl focus:ring-2 focus:ring-teal-200 focus:border-teal-500 transition-all outline-none"
                          placeholder="slug-de-categoria"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Descripción <span className="text-gray-400 font-normal">(Opcional)</span></label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-200 focus:border-teal-500 transition-all outline-none resize-none"
                      placeholder="Breve descripción de los productos en esta categoría..."
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 font-medium shadow-sm hover:shadow hover:-translate-y-0.5 transition-all cursor-pointer"
                  >
                    {editingId ? 'Guardar Cambios' : 'Crear Categoría'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Categories Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Categoría</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Slug</th>
              {activeTab === 'active' ? (
                <>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Descripción</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Productos</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Creado Por</th>
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
            {filteredCategories.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  {searchQuery ? 'No se encontraron categorías para tu búsqueda' : 'No hay categorías creadas'}
                </td>
              </tr>
            ) : (
              filteredCategories.map((category) => (
                <tr
                  key={category.id}
                  className="hover:bg-teal-50 cursor-pointer transition-colors"
                  onClick={() => handleViewProducts(category)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{category.icon}</span>
                      <span className="font-medium text-gray-900">{category.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500 font-mono text-sm">{category.slug}</td>

                  {activeTab === 'active' ? (
                    <>
                      <td className="px-6 py-4 text-gray-600 text-sm max-w-xs truncate">
                        {category.description || <span className="text-gray-400">-</span>}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${category.product_count > 0
                          ? 'bg-teal-100 text-teal-700'
                          : 'bg-gray-100 text-gray-500'
                          }`}>
                          {category.product_count} producto{category.product_count !== 1 ? 's' : ''}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-sm">
                        {category.creator_name || <span className="text-gray-400">Sistema</span>}
                      </td>
                      <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(category)}
                            className="px-3 py-1 text-teal-600 hover:bg-teal-50 rounded-lg text-sm cursor-pointer"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(category.id, category.product_count)}
                            className={`px-3 py-1 rounded-lg text-sm cursor-pointer ${category.product_count > 0
                              ? 'text-gray-400 cursor-not-allowed'
                              : 'text-red-600 hover:bg-red-50'
                              }`}
                            disabled={category.product_count > 0}
                            title={category.product_count > 0 ? 'No se puede eliminar: tiene productos' : ''}
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-6 py-4 text-gray-500 text-sm">
                        {category.creator_name || <span className="text-gray-400">Sistema</span>}
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-sm">
                        {category.deleter_name || <span className="text-gray-400">Desconocido</span>}
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-sm">
                        {category.deleted_at ? new Date(category.deleted_at).toLocaleString() : '-'}
                      </td>
                    </>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de Productos */}
      {viewingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setViewingCategory(null)}
          />

          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden m-4">
            {/* Header */}
            <div className="bg-gradient-to-r from-teal-500 to-teal-600 px-6 py-5 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{viewingCategory.icon}</span>
                <div>
                  <h2 className="text-xl font-bold text-white">{viewingCategory.name}</h2>
                  <p className="text-teal-100 text-sm">{viewingCategory.product_count} producto{viewingCategory.product_count !== 1 ? 's' : ''}</p>
                </div>
              </div>
              <button
                onClick={() => setViewingCategory(null)}
                className="text-white/80 hover:text-white text-3xl leading-none cursor-pointer transition-colors"
              >
                ×
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {loadingProducts ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-10 w-10 border-4 border-teal-600 border-t-transparent" />
                </div>
              ) : categoryProducts.length === 0 ? (
                <div className="text-center py-12">
                  <span className="text-5xl mb-4 block">📦</span>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Sin productos</h3>
                  <p className="text-gray-500">Esta categoría aún no tiene productos.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                  {categoryProducts.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center gap-4 bg-gray-50 hover:bg-gray-100 rounded-xl p-4 transition-colors"
                    >
                      <div className="w-16 h-16 bg-white rounded-xl overflow-hidden flex-shrink-0 shadow-sm border">
                        <img
                          src={product.image_url || 'https://via.placeholder.com/64'}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-grow min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-900 truncate">{product.name}</p>
                          {product.is_featured && (
                            <span className="text-amber-500" title="Destacado">⭐</span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-teal-600 font-bold">S/ {product.price.toFixed(2)}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${product.stock < 10
                            ? 'bg-red-100 text-red-700'
                            : 'bg-green-100 text-green-700'
                            }`}>
                            Stock: {product.stock}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {categoryProducts.length > 0 && (
              <div className="border-t px-6 py-4 bg-gray-50">
                <p className="text-sm text-gray-500 text-center">
                  Mostrando {categoryProducts.length} producto{categoryProducts.length !== 1 ? 's' : ''}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
