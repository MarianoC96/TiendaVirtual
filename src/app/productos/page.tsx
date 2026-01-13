'use client';

import { useState, useEffect, Suspense, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ProductCard from '@/components/ProductCard';

interface Product {
  id: number;
  name: string;
  category: string;
  category_name?: string;
  price: number;
  original_price?: number | null;
  discount_percentage?: number;
  discount_end_date?: string | null;
  in_stock: number | boolean;
  stock: number;
  rating: number;
  review_count: number;
  short_description?: string;
  image_url?: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;
}

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // URL params for initial state
  const urlQuery = searchParams.get('q') || '';
  const urlCategory = searchParams.get('categoria') || null;

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Client-side filter states
  const [searchQuery, setSearchQuery] = useState(urlQuery);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(urlCategory);
  const [viewMode, setViewMode] = useState<'grid' | 'grouped'>('grid');

  // Sync state with URL params when they change (e.g., from navigation)
  useEffect(() => {
    setSearchQuery(urlQuery);
    setSelectedCategory(urlCategory);
  }, [urlQuery, urlCategory]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          fetch('/api/products'), // Fetch ALL products for smart filtering
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
  }, []);

  // Sync URL with state (optional, or just use state)
  // We'll keep URL simplified for sharing, but main logic is client-side now

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.short_description?.toLowerCase().includes(searchQuery.toLowerCase());

      // Match by category slug - find the category and check if product belongs to it
      let matchesCategory = true;
      if (selectedCategory) {
        const selectedCat = categories.find(c => c.slug === selectedCategory);
        if (selectedCat) {
          matchesCategory = product.category_name?.toLowerCase() === selectedCat.name.toLowerCase() ||
            product.category?.toLowerCase() === selectedCat.name.toLowerCase();
        } else {
          matchesCategory = false;
        }
      }

      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory, categories]);

  // Grouping Logic
  const groupedProducts = useMemo(() => {
    if (viewMode !== 'grouped') return {};

    const groups: { [key: string]: Product[] } = {};
    filteredProducts.forEach(p => {
      const catName = p.category_name || 'Otros';
      if (!groups[catName]) groups[catName] = [];
      groups[catName].push(p);
    });
    return groups;
  }, [filteredProducts, viewMode]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header & Controls */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                Explorar Productos
              </h1>
              <p className="text-gray-600 mt-1">
                {filteredProducts.length} {filteredProducts.length === 1 ? 'producto encontrado' : 'productos encontrados'}
              </p>
            </div>

            {/* Smart Search Bar */}
            <div className="relative w-full md:w-96">
              <input
                type="text"
                placeholder="Buscar por nombre, descripción..."
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 shadow-sm transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-2 text-sm text-gray-600 bg-white p-1 rounded-lg border border-gray-200 w-fit">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-md flex items-center gap-2 transition-colors ${viewMode === 'grid' ? 'bg-teal-50 text-teal-700 font-medium' : 'hover:bg-gray-50'}`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              Cuadrícula
            </button>
            <button
              onClick={() => setViewMode('grouped')}
              className={`px-3 py-1.5 rounded-md flex items-center gap-2 transition-colors ${viewMode === 'grouped' ? 'bg-teal-50 text-teal-700 font-medium' : 'hover:bg-gray-50'}`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              Agrupado por Categoría
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Categories */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
              <h3 className="font-semibold text-gray-900 mb-4">Filtrar por Categoría</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`w-full text-left px-4 py-2 rounded-xl transition-colors ${!selectedCategory
                    ? 'bg-teal-100 text-teal-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                    }`}
                >
                  Todas
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.slug)}
                    className={`w-full text-left px-4 py-2 rounded-xl transition-colors flex items-center gap-2 ${selectedCategory === cat.slug
                      ? 'bg-teal-100 text-teal-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                      }`}
                  >
                    <span>{cat.icon}</span>
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Products Display */}
          <div className="flex-grow">
            {loading ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-600 border-t-transparent" />
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No se encontraron productos</h3>
                <p className="text-gray-500">Intenta con otra búsqueda o filtro</p>
                <button
                  onClick={() => { setSearchQuery(''); setSelectedCategory(null); }}
                  className="mt-4 text-teal-600 hover:underline font-medium"
                >
                  Limpiar filtros
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              // Standard Grid View
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              // Grouped By Category View
              <div className="space-y-12 animate-in fade-in duration-500">
                {Object.entries(groupedProducts).map(([categoryName, items]) => (
                  <div key={categoryName}>
                    <h3 className="flex items-center gap-3 text-lg font-bold text-gray-800 mb-6 border-b border-gray-200 pb-2">
                      <span className="w-1.5 h-6 bg-teal-500 rounded-full"></span>
                      {categoryName}
                      <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                        {items.length}
                      </span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {items.map((product) => (
                        <ProductCard key={product.id} product={product} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-600 border-t-transparent" />
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}
