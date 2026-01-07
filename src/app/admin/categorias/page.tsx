'use client';

import { useState, useEffect } from 'react';

interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;
  description: string | null;
  product_count: number;
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

  // Modal de productos
  const [viewingCategory, setViewingCategory] = useState<Category | null>(null);
  const [categoryProducts, setCategoryProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/admin/categories');
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
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-rose-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Categorías</h1>
        <button
          onClick={() => { resetForm(); setShowForm(!showForm); }}
          className="px-4 py-2 bg-rose-600 text-white rounded-xl font-medium hover:bg-rose-700 transition-colors cursor-pointer"
        >
          + Nueva Categoría
        </button>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">
            {editingId ? 'Editar Categoría' : 'Crear Categoría'}
          </h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-rose-500"
                  placeholder="Nombre de la categoría"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Icono</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    required
                    className="w-20 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-rose-500 text-2xl text-center"
                  />
                  <div className="flex flex-wrap gap-1">
                    {commonIcons.map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => setFormData({ ...formData, icon })}
                        className={`w-8 h-8 rounded hover:bg-gray-100 cursor-pointer ${formData.icon === icon ? 'bg-rose-100' : ''}`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {editingId && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug (URL)</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-rose-500"
                  placeholder="slug-de-categoria"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-rose-500"
                placeholder="Descripción opcional"
              />
            </div>

            <div className="flex gap-2">
              <button type="submit" className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 cursor-pointer">
                {editingId ? 'Guardar Cambios' : 'Crear Categoría'}
              </button>
              <button type="button" onClick={resetForm} className="px-4 py-2 border rounded-lg hover:bg-gray-50 cursor-pointer">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Categories Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Categoría</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Slug</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Descripción</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Productos</th>
              <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {categories.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  No hay categorías creadas
                </td>
              </tr>
            ) : (
              categories.map((category) => (
                <tr
                  key={category.id}
                  className="hover:bg-rose-50 cursor-pointer transition-colors"
                  onClick={() => handleViewProducts(category)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{category.icon}</span>
                      <span className="font-medium text-gray-900">{category.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500 font-mono text-sm">{category.slug}</td>
                  <td className="px-6 py-4 text-gray-600 text-sm max-w-xs truncate">
                    {category.description || <span className="text-gray-400">-</span>}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${category.product_count > 0
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-500'
                      }`}>
                      {category.product_count} producto{category.product_count !== 1 ? 's' : ''}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEdit(category)}
                        className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-lg text-sm cursor-pointer"
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
            <div className="bg-gradient-to-r from-rose-500 to-rose-600 px-6 py-5 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{viewingCategory.icon}</span>
                <div>
                  <h2 className="text-xl font-bold text-white">{viewingCategory.name}</h2>
                  <p className="text-rose-100 text-sm">{viewingCategory.product_count} producto{viewingCategory.product_count !== 1 ? 's' : ''}</p>
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
                  <div className="animate-spin rounded-full h-10 w-10 border-4 border-rose-600 border-t-transparent" />
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
                          <span className="text-rose-600 font-bold">S/ {product.price.toFixed(2)}</span>
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
