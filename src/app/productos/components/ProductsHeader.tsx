import { ViewMode } from '../types';

interface ProductsHeaderProps {
    totalProducts: number;
    searchQuery: string;
    setSearchQuery: (q: string) => void;
    viewMode: ViewMode;
    setViewMode: (mode: ViewMode) => void;
}

export function ProductsHeader({
    totalProducts,
    searchQuery,
    setSearchQuery,
    viewMode,
    setViewMode
}: ProductsHeaderProps) {
    return (
        <div className="mb-8 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                        Explorar Productos
                    </h1>
                    <p className="text-gray-600 mt-1">
                        {totalProducts} {totalProducts === 1 ? 'producto encontrado' : 'productos encontrados'}
                    </p>
                </div>

                {/* Smart Search Bar */}
                <div className="relative w-full md:w-96">
                    <input
                        type="text"
                        placeholder="Buscar por nombre, descripción..."
                        className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 shadow-sm transition-all outline-none"
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
    );
}
