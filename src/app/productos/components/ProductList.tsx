import ProductCard from '@/components/ProductCard';
import { Product, ViewMode } from '../types';

interface ProductListProps {
    filteredProducts: Product[];
    groupedProducts: { [key: string]: Product[] };
    viewMode: ViewMode;
    loading: boolean;
    onClearFilters: () => void;
}

export function ProductList({
    filteredProducts,
    groupedProducts,
    viewMode,
    loading,
    onClearFilters
}: ProductListProps) {
    if (loading) {
        return (
            <div className="flex justify-center py-20 flex-grow">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-600 border-t-transparent" />
            </div>
        );
    }

    if (filteredProducts.length === 0) {
        return (
            <div className="text-center py-20 flex-grow">
                <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No se encontraron productos</h3>
                <p className="text-gray-500">Intenta con otra búsqueda o filtro</p>
                <button
                    onClick={onClearFilters}
                    className="mt-4 text-teal-600 hover:underline font-medium"
                >
                    Limpiar filtros
                </button>
            </div>
        );
    }

    return (
        <div className="flex-grow">
            {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
                    {filteredProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            ) : (
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
    );
}
