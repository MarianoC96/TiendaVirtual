'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useProducts } from './hooks/useProducts';
import { useProductFilters } from './hooks/useProductFilters';
import { ProductsHeader } from './components/ProductsHeader';
import { MobileFilters } from './components/MobileFilters';
import { CategorySidebar } from './components/CategorySidebar';
import { ProductList } from './components/ProductList';

function ProductsContent() {
  const searchParams = useSearchParams();

  // URL params for initial state
  const urlQuery = searchParams.get('q') || '';
  const urlCategory = searchParams.get('categoria') || null;

  const { products, categories, loading: loadingProducts } = useProducts();

  const {
    searchQuery, setSearchQuery,
    selectedCategory, setSelectedCategory,
    viewMode, setViewMode,
    selectedCapacity, setSelectedCapacity,
    selectedSize, setSelectedSize,
    priceRange, setPriceRange,
    maxProductPrice,
    filterOptions,
    filteredProducts,
    groupedProducts,
    activeFiltersCount,
    clearFilters
  } = useProductFilters({
    products,
    categories,
    initialSearchQuery: urlQuery,
    initialCategory: urlCategory
  });

  const selectedCategoryName = categories.find(c => c.slug === selectedCategory)?.name;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <ProductsHeader
          totalProducts={filteredProducts.length}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          viewMode={viewMode}
          setViewMode={setViewMode}
          selectedCategoryName={selectedCategoryName}
        />

        <div className="flex flex-col lg:flex-row gap-8">

          <MobileFilters
            filterOptions={filterOptions}
            selectedCapacity={selectedCapacity}
            setSelectedCapacity={setSelectedCapacity}
            selectedSize={selectedSize}
            setSelectedSize={setSelectedSize}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            maxProductPrice={maxProductPrice}
            activeFiltersCount={activeFiltersCount}
          />

          <CategorySidebar
            categories={categories}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
          />

          <ProductList
            filteredProducts={filteredProducts}
            groupedProducts={groupedProducts}
            viewMode={viewMode}
            loading={loadingProducts}
            onClearFilters={clearFilters}
          />

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
