import { useState } from 'react';

interface FilterOptions {
    capacities: string[];
    clothingSizes: string[];
    dimensions: string[];
}

interface MobileFiltersProps {
    filterOptions: FilterOptions;
    selectedCapacity: string | null;
    setSelectedCapacity: (val: string | null) => void;
    selectedSize: string | null;
    setSelectedSize: (val: string | null) => void;
    priceRange: [number, number];
    setPriceRange: (val: [number, number]) => void;
    maxProductPrice: number;
    activeFiltersCount: number;
}

export function MobileFilters({
    filterOptions,
    selectedCapacity,
    setSelectedCapacity,
    selectedSize,
    setSelectedSize,
    priceRange,
    setPriceRange,
    maxProductPrice,
    activeFiltersCount
}: MobileFiltersProps) {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className="lg:hidden">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Main Toggle Button */}
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="w-full flex items-center justify-between p-4 text-left bg-white hover:bg-gray-50 transition-colors"
                >
                    <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                        </svg>
                        <span className="font-semibold text-gray-900">Filtros</span>
                        {activeFiltersCount > 0 && (
                            <span className="ml-2 bg-teal-100 text-teal-700 text-xs px-2 py-0.5 rounded-full font-medium">
                                {activeFiltersCount}
                            </span>
                        )}
                    </div>
                    <span className={`text-teal-600 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </span>
                </button>

                {/* Collapsible Content */}
                {expanded && (
                    <div className="border-t border-gray-100 animate-in slide-in-from-top-2 duration-200">

                        {/* 1. Capacidades */}
                        {filterOptions.capacities.length > 0 && (
                            <div className="p-4 border-b border-gray-100">
                                <p className="text-xs font-medium text-gray-500 mb-3 uppercase tracking-wide">Capacidad (oz)</p>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        onClick={() => setSelectedCapacity(null)}
                                        className={`px-3 py-1.5 text-sm rounded-full border transition-all ${!selectedCapacity
                                            ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                                            : 'bg-white text-gray-600 border-gray-200 hover:border-teal-300'
                                            }`}
                                    >
                                        Todas
                                    </button>
                                    {filterOptions.capacities.map(cap => (
                                        <button
                                            key={cap}
                                            onClick={() => setSelectedCapacity(selectedCapacity === cap ? null : cap)}
                                            className={`px-3 py-1.5 text-sm rounded-full border transition-all ${selectedCapacity === cap
                                                ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                                                : 'bg-white text-gray-600 border-gray-200 hover:border-teal-300'
                                                }`}
                                        >
                                            {cap}oz
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 2. Tallas */}
                        {filterOptions.clothingSizes.length > 0 && (
                            <div className="p-4 border-b border-gray-100">
                                <p className="text-xs font-medium text-gray-500 mb-3 uppercase tracking-wide">Tallas</p>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        onClick={() => setSelectedSize(null)}
                                        className={`px-3 py-1.5 text-sm rounded-full border transition-all ${!selectedSize
                                            ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                                            : 'bg-white text-gray-600 border-gray-200 hover:border-teal-300'
                                            }`}
                                    >
                                        Todas
                                    </button>
                                    {filterOptions.clothingSizes.map(size => (
                                        <button
                                            key={size}
                                            onClick={() => setSelectedSize(selectedSize === size ? null : size)}
                                            className={`px-3 py-1.5 text-sm rounded-full border transition-all ${selectedSize === size
                                                ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                                                : 'bg-white text-gray-600 border-gray-200 hover:border-teal-300'
                                                }`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 3. Medidas */}
                        {filterOptions.dimensions.length > 0 && (
                            <div className="p-4 border-b border-gray-100">
                                <p className="text-xs font-medium text-gray-500 mb-3 uppercase tracking-wide">Medidas</p>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        onClick={() => setSelectedSize(null)}
                                        className={`px-3 py-1.5 text-sm rounded-full border transition-all ${!selectedSize
                                            ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                                            : 'bg-white text-gray-600 border-gray-200 hover:border-teal-300'
                                            }`}
                                    >
                                        Todas
                                    </button>
                                    {filterOptions.dimensions.map(dim => (
                                        <button
                                            key={dim}
                                            onClick={() => setSelectedSize(selectedSize === dim ? null : dim)}
                                            className={`px-3 py-1.5 text-sm rounded-full border transition-all ${selectedSize === dim
                                                ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                                                : 'bg-white text-gray-600 border-gray-200 hover:border-teal-300'
                                                }`}
                                        >
                                            {dim}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 4. Precio Slider */}
                        <div className="p-4">
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Rango de Precio</p>
                                <span className="text-sm font-semibold text-teal-700">
                                    S/{priceRange[0]} - S/{priceRange[1]}
                                </span>
                            </div>
                            <div className="px-2 pb-2">
                                <div className="relative h-2 bg-gray-200 rounded-full">
                                    <div
                                        className="absolute top-0 h-full bg-teal-500 rounded-full"
                                        style={{
                                            left: `${(priceRange[0] / maxProductPrice) * 100}%`,
                                            right: `${100 - (priceRange[1] / maxProductPrice) * 100}%`
                                        }}
                                    />
                                    <input
                                        type="range"
                                        min="0"
                                        max={maxProductPrice}
                                        step="10"
                                        value={priceRange[0]}
                                        onChange={(e) => {
                                            const val = Math.min(Number(e.target.value), priceRange[1] - 10);
                                            setPriceRange([val, priceRange[1]]);
                                        }}
                                        className="absolute top-0 w-full h-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-teal-600 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:shadow-md z-20"
                                    />
                                    <input
                                        type="range"
                                        min="0"
                                        max={maxProductPrice}
                                        step="10"
                                        value={priceRange[1]}
                                        onChange={(e) => {
                                            const val = Math.max(Number(e.target.value), priceRange[0] + 10);
                                            setPriceRange([priceRange[0], val]);
                                        }}
                                        className="absolute top-0 w-full h-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-teal-600 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:shadow-md z-10"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
