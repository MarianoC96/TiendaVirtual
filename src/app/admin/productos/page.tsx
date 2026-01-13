'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type VariantType = 'size' | 'capacity' | 'dimensions';

interface ProductVariant {
  id?: number;
  variant_type?: VariantType;
  variant_label: string;
  label?: string; // Alias for variant_label
  price: number;
  stock: number;
  is_default: boolean;
}

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
  has_variants?: boolean;
  variant_type?: VariantType | null;
  variants?: ProductVariant[];
}

interface Category {
  id: number;
  name: string;
}

// Helper to detect variant type from product name
function detectVariantType(name: string): VariantType | null {
  const n = name.toLowerCase();
  if (n.includes('polo') || n.includes('polos')) return 'size';
  if (n.includes('taza') || n.includes('tazas') || n.includes('tomatodo') || n.includes('tomatodos')) return 'capacity';
  if (n.includes('caja') || n.includes('cajas')) return 'dimensions';
  return null;
}

// Predefined sizes for polo/clothing
const PREDEFINED_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];

// Get variant type label
function getVariantTypeLabel(type: VariantType | null): string {
  switch (type) {
    case 'size': return 'Tallas';
    case 'capacity': return 'Capacidades (oz)';
    case 'dimensions': return 'Dimensiones (Base x Altura)';
    default: return 'Variantes';
  }
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  // Variants state
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [detectedVariantType, setDetectedVariantType] = useState<VariantType | null>(null);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
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

  // Detect variant type when product name changes
  useEffect(() => {
    if (editingProduct) {
      const type = detectVariantType(editingProduct.name);
      setDetectedVariantType(type);

      // If type changed and we have existing variants, keep them
      // If type is null, clear variants
      if (type === null) {
        setVariants([]);
      }
    }
  }, [editingProduct?.name]);

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
      // Fetch full product details with variants
      const res = await fetch(`/api/admin/products/${product.id}`);
      const fullProduct = await res.json();

      setEditingProduct({
        ...product,
        ...fullProduct,
        category_id: fullProduct.category_id || categories.find(c => c.name === product.category)?.id
      });

      // Set variants from product
      const productVariants = (fullProduct.variants || []).map((v: ProductVariant) => ({
        id: v.id,
        variant_label: v.variant_label || v.label || '',
        price: v.price,
        stock: v.stock,
        is_default: v.is_default
      }));
      setVariants(productVariants);
      setDetectedVariantType(fullProduct.variant_type || detectVariantType(fullProduct.name));

      setShowModal(true);
    } catch (error) {
      console.error('Error fetching product details:', error);
      setEditingProduct(product);
      setVariants([]);
      setShowModal(true);
    }
  };

  const handleCreate = () => {
    setEditingProduct({
      id: 0,
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
    setVariants([]);
    setDetectedVariantType(null);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!editingProduct) return;

    // Validate variants if product has them
    if (detectedVariantType && variants.length === 0) {
      alert('Este producto requiere al menos una variante (talla, capacidad o dimensión)');
      return;
    }

    setSaving(true);
    try {
      const isNew = editingProduct.id === 0;
      const url = isNew ? '/api/admin/products' : `/api/admin/products/${editingProduct.id}`;
      const method = isNew ? 'POST' : 'PATCH';

      // Prepare variants data
      const variantsData = detectedVariantType ? variants.map(v => ({
        id: v.id,
        label: v.variant_label,
        price: v.price,
        stock: v.stock,
        is_default: v.is_default
      })) : undefined;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editingProduct.name,
          category_id: editingProduct.category_id,
          price: detectedVariantType && variants.length > 0
            ? (variants.find(v => v.is_default) || variants[0])?.price || editingProduct.price
            : editingProduct.price,
          stock: detectedVariantType && variants.length > 0
            ? variants.reduce((sum, v) => sum + v.stock, 0)
            : editingProduct.stock,
          is_featured: editingProduct.is_featured,
          description: editingProduct.description,
          short_description: editingProduct.short_description,
          image_url: editingProduct.image_url,
          variants: variantsData
        })
      });

      if (res.ok) {
        const savedProduct = await res.json();
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
        setVariants([]);
      } else {
        const errorData = await res.json();
        const errorDetails = errorData.details ? `\n\nDetalles: ${errorData.details}` : '';
        alert(`${errorData.error || 'Error al guardar los cambios'}${errorDetails}`);
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
    setVariants([]);
    setDetectedVariantType(null);
  };

  // Variant management functions
  const addVariant = () => {
    const newVariant: ProductVariant = {
      variant_label: '',
      price: editingProduct?.price || 0,
      stock: 0,
      is_default: variants.length === 0 // First variant is default
    };
    setVariants([...variants, newVariant]);
  };

  const addPredefinedSize = (size: string) => {
    if (variants.some(v => v.variant_label === size)) return; // Already exists
    const newVariant: ProductVariant = {
      variant_label: size,
      price: editingProduct?.price || 0,
      stock: 0,
      is_default: variants.length === 0
    };
    setVariants([...variants, newVariant]);
  };

  const updateVariant = (index: number, field: keyof ProductVariant, value: string | number | boolean) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: value };

    // If setting as default, unset others
    if (field === 'is_default' && value === true) {
      updated.forEach((v, i) => {
        if (i !== index) v.is_default = false;
      });
    }

    setVariants(updated);
  };

  const removeVariant = (index: number) => {
    const updated = variants.filter((_, i) => i !== index);
    // If removed default, set first as default
    if (updated.length > 0 && !updated.some(v => v.is_default)) {
      updated[0].is_default = true;
    }
    setVariants(updated);
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

      {/* Low Stock Alert for Variant Products */}
      {activeTab === 'active' && (() => {
        const lowStockVariants = products.filter(p =>
          p.has_variants && p.variants && p.variants.some(v => v.stock <= 5)
        );

        if (lowStockVariants.length === 0) return null;

        const totalLowStock = lowStockVariants.reduce((count, p) => {
          return count + (p.variants?.filter(v => v.stock <= 5).length || 0);
        }, 0);

        const outOfStock = lowStockVariants.reduce((count, p) => {
          return count + (p.variants?.filter(v => v.stock === 0).length || 0);
        }, 0);

        return (
          <div className="mb-6 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div className="flex-1">
                <h3 className="font-semibold text-amber-800">Alerta de Stock Bajo en Variantes</h3>
                <p className="text-sm text-amber-700 mt-1">
                  {totalLowStock} variante{totalLowStock !== 1 ? 's' : ''} con poco stock
                  {outOfStock > 0 && <span className="text-red-600 font-medium"> ({outOfStock} agotada{outOfStock !== 1 ? 's' : ''})</span>}
                  {' '}en {lowStockVariants.length} producto{lowStockVariants.length !== 1 ? 's' : ''}:
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {lowStockVariants.slice(0, 5).map(p => (
                    <span key={p.id} className="inline-flex items-center gap-1 px-2 py-1 bg-white rounded-lg text-sm border border-amber-200">
                      <span className="font-medium text-gray-700">{p.name}</span>
                      <span className="text-amber-600">
                        ({p.variants?.filter(v => v.stock <= 5).map(v => `${v.variant_label}: ${v.stock}`).join(', ')})
                      </span>
                    </span>
                  ))}
                  {lowStockVariants.length > 5 && (
                    <span className="text-sm text-amber-600">+{lowStockVariants.length - 5} más</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

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

        {/* Table */}
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
                    <th className="px-4 lg:px-6 py-4 text-left text-sm font-medium text-gray-500 hidden md:table-cell">Variantes</th>
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
                    <td className="px-6 py-4 text-gray-900 font-medium">
                      {product.has_variants ? (
                        <span className="text-sm">Desde S/ {product.price.toFixed(2)}</span>
                      ) : (
                        `S/ ${product.price.toFixed(2)}`
                      )}
                    </td>

                    {activeTab === 'active' ? (
                      <>
                        <td className="px-6 py-4">
                          {product.has_variants && product.variants ? (
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.stock < 10 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                                }`}>
                                {product.stock}
                              </span>
                              {/* Low stock warning for variants */}
                              {product.variants.some(v => v.stock <= 5 && v.stock > 0) && (
                                <span className="text-amber-500" title="Algunas tallas tienen poco stock">
                                  ⚠️
                                </span>
                              )}
                              {product.variants.some(v => v.stock === 0) && (
                                <span className="text-red-500" title="Algunas tallas están agotadas">
                                  🚫
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.stock < 10 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                              }`}>
                              {product.stock}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 hidden md:table-cell">
                          {product.has_variants && product.variants ? (
                            <div className="space-y-1">
                              <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                                {product.variant_type === 'size' && '👕 Tallas'}
                                {product.variant_type === 'capacity' && '🥤 Onzas'}
                                {product.variant_type === 'dimensions' && '📦 Dimensiones'}
                              </span>
                              {/* Show low stock variants */}
                              {product.variants.filter(v => v.stock <= 5).length > 0 && (
                                <div className="text-xs text-amber-600">
                                  {product.variants.filter(v => v.stock === 0).map(v => (
                                    <span key={v.id} className="inline-block mr-1 text-red-500">
                                      {v.variant_label}: 0
                                    </span>
                                  ))}
                                  {product.variants.filter(v => v.stock > 0 && v.stock <= 5).map(v => (
                                    <span key={v.id} className="inline-block mr-1">
                                      {v.variant_label}: {v.stock}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          ) : product.has_variants ? (
                            <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                              {product.variant_type === 'size' && '👕 Tallas'}
                              {product.variant_type === 'capacity' && '🥤 Onzas'}
                              {product.variant_type === 'dimensions' && '📦 Dimensiones'}
                            </span>
                          ) : (
                            <span className="text-gray-300">-</span>
                          )}
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
        {showModal && editingProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Overlay */}
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={closeModal}
            />

            {/* Modal Content */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto m-4">
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center z-10">
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
                    placeholder="Ej: Polo Básico, Taza Personalizada, Caja Regalo..."
                  />
                  {detectedVariantType && (
                    <p className="mt-1 text-sm text-purple-600 flex items-center gap-1">
                      ✨ Se detectó que este producto necesita: {getVariantTypeLabel(detectedVariantType)}
                    </p>
                  )}
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

                {/* Precio y Stock - Solo si NO tiene variantes */}
                {!detectedVariantType && (
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
                )}

                {/* Sección de Variantes */}
                {detectedVariantType && (
                  <div className="border border-purple-200 rounded-xl p-4 bg-purple-50/50">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-purple-900">
                        {detectedVariantType === 'size' && '👕 Tallas y Precios'}
                        {detectedVariantType === 'capacity' && '🥤 Capacidades y Precios'}
                        {detectedVariantType === 'dimensions' && '📦 Dimensiones y Precios'}
                      </h3>
                      <span className="text-sm text-purple-600">
                        Stock total: {variants.reduce((sum, v) => sum + v.stock, 0)}
                      </span>
                    </div>

                    {/* Quick add sizes for polo */}
                    {detectedVariantType === 'size' && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-2">Agregar talla rápida:</p>
                        <div className="flex flex-wrap gap-2">
                          {PREDEFINED_SIZES.map(size => (
                            <button
                              key={size}
                              type="button"
                              onClick={() => addPredefinedSize(size)}
                              disabled={variants.some(v => v.variant_label === size)}
                              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${variants.some(v => v.variant_label === size)
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                : 'bg-white border border-purple-300 text-purple-700 hover:bg-purple-100 cursor-pointer'
                                }`}
                            >
                              {size}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Variants table */}
                    {variants.length > 0 && (
                      <div className="overflow-x-auto mb-4">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-purple-200">
                              <th className="text-left py-2 px-2 font-medium text-purple-800">
                                {detectedVariantType === 'size' && 'Talla'}
                                {detectedVariantType === 'capacity' && 'Onzas'}
                                {detectedVariantType === 'dimensions' && 'Base x Altura'}
                              </th>
                              <th className="text-left py-2 px-2 font-medium text-purple-800">Precio (S/)</th>
                              <th className="text-left py-2 px-2 font-medium text-purple-800">Stock</th>
                              <th className="text-center py-2 px-2 font-medium text-purple-800" title="La variante por defecto se mostrará primero al cliente">
                                Por defecto
                                <span className="ml-1 text-xs text-purple-500 cursor-help">ⓘ</span>
                              </th>
                              <th className="text-right py-2 px-2"></th>
                            </tr>
                          </thead>
                          <tbody>
                            {variants.map((variant, index) => (
                              <tr key={index} className="border-b border-purple-100">
                                <td className="py-2 px-2">
                                  <input
                                    type="text"
                                    value={variant.variant_label}
                                    onChange={(e) => updateVariant(index, 'variant_label', e.target.value)}
                                    placeholder={
                                      detectedVariantType === 'size' ? 'Ej: M' :
                                        detectedVariantType === 'capacity' ? 'Ej: 12oz' :
                                          'Ej: 10x15'
                                    }
                                    className="w-24 px-2 py-1 border border-gray-300 rounded-lg text-sm"
                                  />
                                </td>
                                <td className="py-2 px-2">
                                  <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={variant.price || ''}
                                    onChange={(e) => updateVariant(index, 'price', Math.max(0, parseFloat(e.target.value) || 0))}
                                    onFocus={(e) => e.target.select()}
                                    className="w-24 px-2 py-1 border border-gray-300 rounded-lg text-sm"
                                  />
                                </td>
                                <td className="py-2 px-2">
                                  <input
                                    type="number"
                                    min="0"
                                    value={variant.stock || ''}
                                    onChange={(e) => updateVariant(index, 'stock', Math.max(0, parseInt(e.target.value) || 0))}
                                    onFocus={(e) => e.target.select()}
                                    className="w-20 px-2 py-1 border border-gray-300 rounded-lg text-sm"
                                  />
                                </td>
                                <td className="py-2 px-2 text-center">
                                  <input
                                    type="radio"
                                    name="default_variant"
                                    checked={variant.is_default}
                                    onChange={() => updateVariant(index, 'is_default', true)}
                                    className="w-4 h-4 text-purple-600"
                                  />
                                </td>
                                <td className="py-2 px-2 text-right">
                                  <button
                                    type="button"
                                    onClick={() => removeVariant(index)}
                                    className="text-red-500 hover:text-red-700 cursor-pointer"
                                  >
                                    ✕
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Add variant button */}
                    <button
                      type="button"
                      onClick={addVariant}
                      className="w-full py-2 border-2 border-dashed border-purple-300 rounded-xl text-purple-600 hover:bg-purple-100 transition-colors cursor-pointer"
                    >
                      + Agregar variante manualmente
                    </button>
                  </div>
                )}

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
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !editingProduct.name || !editingProduct.category_id || (!!detectedVariantType && variants.length === 0)}
                  className="px-4 py-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
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
        )}
      </div>
    </div>
  );
}
