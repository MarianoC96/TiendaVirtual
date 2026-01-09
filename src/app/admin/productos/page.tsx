'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Product {
  id: number;
  name: string;
  category: string;
  category_id?: number;
  price: number;
  stock: number;
  is_featured: number;
  image_url?: string;
  description?: string;
  short_description?: string;
  creator_name?: string;
  deleter_name?: string;
  deleted_at?: string;
}

interface Category {
  id: number;
  name: string;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');


  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory ? product.category === selectedCategory : true;

    if (activeTab === 'history') {
      if (!product.deleted_at) return false;
      const deletedMonth = product.deleted_at.slice(0, 7);
      return matchesSearch && matchesCategory && deletedMonth === selectedMonth;
    }

    return matchesSearch && matchesCategory;
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const url = activeTab === 'history' ? '/api/admin/products?deleted=true' : '/api/admin/products';
        const [productsRes, categoriesRes] = await Promise.all([
          fetch(url),
          fetch('/api/categories')
        ]);
        const productsData = await productsRes.json();
        const categoriesData = await categoriesRes.json();
        setProducts(productsData);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [activeTab]);

  const handleTabChange = (tab: 'active' | 'history') => {
    setActiveTab(tab);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;

    try {
      await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
      setProducts(products.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const handleEdit = async (product: Product) => {
    try {
      // Fetch full product details
      const res = await fetch(`/api/products/${product.id}`);
      const fullProduct = await res.json();
      setEditingProduct({
        ...product,
        ...fullProduct,
        category_id: fullProduct.category_id || categories.find(c => c.name === product.category)?.id
      });
      setShowModal(true);
    } catch (error) {
      console.error('Error fetching product details:', error);
      // Fallback: use the product data we already have
      setEditingProduct(product);
      setShowModal(true);
    }
  };

  const handleCreate = () => {
    setEditingProduct({
      id: 0, // ID 0 indicates new product
      name: '',
      category: '',
      category_id: 0,
      price: 0,
      stock: 0,
      is_featured: 0,
      image_url: '',
      description: '',
      short_description: ''
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!editingProduct) return;

    setSaving(true);
    try {
      const isNew = editingProduct.id === 0;
      const url = isNew ? '/api/admin/products' : `/api/admin/products/${editingProduct.id}`;
      const method = isNew ? 'POST' : 'PATCH';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editingProduct.name,
          category_id: editingProduct.category_id,
          price: editingProduct.price,
          stock: editingProduct.stock,
          is_featured: editingProduct.is_featured,
          description: editingProduct.description,
          short_description: editingProduct.short_description,
          image_url: editingProduct.image_url
        })
      });

      if (res.ok) {
        const savedProduct = await res.json();
        // Update product in list
        const updatedCategory = categories.find(c => c.id === editingProduct.category_id);
        const productWithCategory = {
          ...savedProduct,
          category: updatedCategory?.name || 'Sin Categoría'
        };

        if (isNew) {
          setProducts([productWithCategory, ...products]);
        } else {
          setProducts(products.map(p =>
            p.id === editingProduct.id ? productWithCategory : p
          ));
        }

        setShowModal(false);
        setEditingProduct(null);
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'Error al guardar los cambios');
      }
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Error al guardar los cambios');
    } finally {
      setSaving(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProduct(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 lg:mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Productos</h1>
        <button
          onClick={handleCreate}
          className="w-full sm:w-auto px-4 py-2 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 transition-colors shadow-lg shadow-teal-200 cursor-pointer text-sm lg:text-base"
        >
          + Nuevo Producto
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
            className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-200 outline-none"
          />
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {/* Search and Filters */}
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center bg-gray-50/50">
          <div className="relative w-full md:w-96">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Buscar producto por nombre..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 bg-white"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">Todas las Categorías</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.name}>{cat.name}</option>
            ))}
          </select>
        </div>

        {/* Table with horizontal scroll on mobile */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 lg:px-6 py-4 text-left text-sm font-medium text-gray-500">Producto</th>
                <th className="px-4 lg:px-6 py-4 text-left text-sm font-medium text-gray-500">Categoría</th>
                <th className="px-4 lg:px-6 py-4 text-left text-sm font-medium text-gray-500">Precio</th>
                {activeTab === 'active' ? (
                  <>
                    <th className="px-4 lg:px-6 py-4 text-left text-sm font-medium text-gray-500">Stock</th>
                    <th className="px-4 lg:px-6 py-4 text-left text-sm font-medium text-gray-500 hidden md:table-cell">Destacado</th>
                    <th className="px-4 lg:px-6 py-4 text-left text-sm font-medium text-gray-500 hidden lg:table-cell">Creado Por</th>
                    <th className="px-4 lg:px-6 py-4 text-right text-sm font-medium text-gray-500">Acciones</th>
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
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={product.image_url || 'https://via.placeholder.com/48'}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="font-medium text-gray-900">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{product.category}</td>
                    <td className="px-6 py-4 text-gray-900 font-medium">S/ {product.price.toFixed(2)}</td>

                    {activeTab === 'active' ? (
                      <>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.stock < 10 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                            }`}>
                            {product.stock}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {product.is_featured ? (
                            <span className="text-amber-500">⭐</span>
                          ) : (
                            <span className="text-gray-300">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-gray-500 text-sm">
                          {product.creator_name || <span className="text-gray-400">Sistema</span>}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleEdit(product)}
                              className="px-3 py-1 text-teal-600 hover:bg-teal-50 rounded-lg text-sm cursor-pointer"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleDelete(product.id)}
                              className="px-3 py-1 text-red-600 hover:bg-red-50 rounded-lg text-sm cursor-pointer"
                            >
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-4 text-gray-500 text-sm">
                          {product.creator_name || <span className="text-gray-400">Sistema</span>}
                        </td>
                        <td className="px-6 py-4 text-gray-500 text-sm">
                          {product.deleter_name || <span className="text-gray-400">Desconocido</span>}
                        </td>
                        <td className="px-6 py-4 text-gray-500 text-sm">
                          {product.deleted_at ? new Date(product.deleted_at).toLocaleString() : '-'}
                        </td>
                      </>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No se encontraron productos que coincidan con tu búsqueda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Modal de Edición */}
        {
          showModal && editingProduct && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              {/* Overlay */}
              <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={closeModal}
              />

              {/* Modal Content */}
              <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
                <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-900">
                    {editingProduct.id === 0 ? 'Nuevo Producto' : 'Editar Producto'}
                  </h2>
                  <button
                    onClick={closeModal}
                    className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                  >
                    ×
                  </button>
                </div>

                <div className="p-6 space-y-4">
                  {/* Nombre */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre del producto
                    </label>
                    <input
                      type="text"
                      value={editingProduct.name}
                      onChange={(e) => setEditingProduct(prev => prev ? { ...prev, name: e.target.value } : null)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>

                  {/* Categoría */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Categoría
                    </label>
                    <select
                      value={editingProduct.category_id || ''}
                      onChange={(e) => setEditingProduct(prev => prev ? { ...prev, category_id: parseInt(e.target.value) } : null)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    >
                      <option value="">Seleccionar categoría</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Precio y Stock */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Precio (S/)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={editingProduct.price}
                        onChange={(e) => setEditingProduct(prev => prev ? { ...prev, price: parseFloat(e.target.value) || 0 } : null)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Stock
                      </label>
                      <input
                        type="number"
                        value={editingProduct.stock}
                        onChange={(e) => setEditingProduct(prev => prev ? { ...prev, stock: parseInt(e.target.value) || 0 } : null)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* URL de Imagen */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      URL de la imagen
                    </label>
                    <input
                      type="url"
                      value={editingProduct.image_url || ''}
                      onChange={(e) => setEditingProduct(prev => prev ? { ...prev, image_url: e.target.value } : null)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="https://ejemplo.com/imagen.jpg"
                    />
                  </div>

                  {/* Descripción corta */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descripción corta
                    </label>
                    <input
                      type="text"
                      value={editingProduct.short_description || ''}
                      onChange={(e) => setEditingProduct(prev => prev ? { ...prev, short_description: e.target.value } : null)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>

                  {/* Descripción */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descripción completa
                    </label>
                    <textarea
                      value={editingProduct.description || ''}
                      onChange={(e) => setEditingProduct(prev => prev ? { ...prev, description: e.target.value } : null)}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                    />
                  </div>

                  {/* Destacado */}
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="is_featured"
                      checked={editingProduct.is_featured === 1}
                      onChange={(e) => setEditingProduct(prev => prev ? { ...prev, is_featured: e.target.checked ? 1 : 0 } : null)}
                      className="w-5 h-5 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                    />
                    <label htmlFor="is_featured" className="text-sm font-medium text-gray-700">
                      Producto destacado ⭐
                    </label>
                  </div>
                </div>

                {/* Footer con botones */}
                <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4 flex justify-end gap-3">
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving || !editingProduct.name || !editingProduct.price || !editingProduct.category_id}
                    className="px-4 py-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {saving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      'Guardar cambios'
                    )}
                  </button>
                </div>
              </div>
            </div>
          )
        }
      </div>
    </div>
  );
}
