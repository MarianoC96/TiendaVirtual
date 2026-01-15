'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import ProductCard from './ProductCard';

interface DiscountBanner {
    id: number;
    name: string;
    discount_type: string;
    discount_value: number;
    category?: {
        name: string;
        slug: string;
        icon?: string;
    };
}

interface Product {
    id: number;
    name: string;
    category: string;
    category_name?: string;
    price: number;
    final_price: number;
    discount_info?: {
        amount: number;
        type: string;
        value: number;
        label: string;
    };
    in_stock: boolean;
    stock: number;
    rating: number;
    review_count: number;
    image_url?: string;
    customization?: any;
}

export default function OffersSection() {
    const [products, setProducts] = useState<Product[]>([]);
    const [banners, setBanners] = useState<DiscountBanner[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const [selectedCategory, setSelectedCategory] = useState('all');

    useEffect(() => {
        const fetchOffers = async () => {
            try {
                const res = await fetch('/api/products/offers');
                if (!res.ok) throw new Error('Error al obtener ofertas');
                const data = await res.json();
                setProducts(data.products || []);
                setBanners(data.banners || []);
            } catch (error) {
                console.error('Error al obtener ofertas:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchOffers();
    }, []);

    // Extraer categorías únicas de productos
    const categories = useMemo(() => {
        const uniqueCats = new Set(products.map(p => p.category_name).filter(Boolean));
        return Array.from(uniqueCats).sort() as string[];
    }, [products]);

    // Filtrar Productos (Lista plana, orden aleatorio inicialmente)
    const filteredProducts = useMemo(() => {
        let result = products;

        // Aplicar filtros
        if (searchTerm || selectedCategory !== 'all') {
            result = result.filter(p => {
                const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
                const matchesCategory = selectedCategory === 'all' || p.category_name === selectedCategory;
                return matchesSearch && matchesCategory;
            });
        }

        return result;
    }, [products, searchTerm, selectedCategory]);

    // Mezclar productos solo una vez al cargar para mostrar "variedad"
    const [displayProducts, setDisplayProducts] = useState<Product[]>([]);

    useEffect(() => {
        if (products.length > 0) {
            // Mezcla simple
            const shuffled = [...products].sort(() => 0.5 - Math.random());
            setDisplayProducts(shuffled);
        }
    }, [products]);

    // Actualizar visualización cuando cambian los filtros
    useEffect(() => {
        if (searchTerm || selectedCategory !== 'all') {
            setDisplayProducts(filteredProducts);
        } else if (products.length > 0 && selectedCategory === 'all' && !searchTerm) {
            // Si se borran los filtros, ¿volver a mezclar o volver a la lista mezclada completa?
            // Vamos a coincidir con filteredProducts (que son todos los productos) pero conservando el orden "aleatorio".
            // Confiaremos en el estado de mezcla inicial si estrictamente "todos" está activo,
            // pero 'filteredProducts' cambia de referencia.
            // Usemos solo filteredProducts.
            setDisplayProducts(filteredProducts);
        }
    }, [filteredProducts, searchTerm, selectedCategory]);


    const hasResults = displayProducts.length > 0;

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20 bg-teal-50">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-600 border-t-transparent" />
            </div>
        );
    }

    if (products.length === 0 && banners.length === 0) return (
        <div className="text-center py-20 bg-gray-50">
            <div className="text-6xl mb-4">🏷️</div>
            <h3 className="text-2xl font-bold text-gray-800">No hay ofertas activas</h3>
            <p className="text-gray-500 mt-2">Estamos preparando nuevas promociones para ti.</p>
        </div>
    );

    return (
        <section className="py-12 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header & Search */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
                        <span className="bg-gradient-to-r from-teal-600 to-cyan-500 bg-clip-text text-transparent">
                            Nuestras Ofertas
                        </span>
                    </h1>
                    <p className="text-gray-600 mb-10 max-w-2xl mx-auto text-lg">
                        Descubre precios increíbles en tus productos favoritos.
                    </p>

                    {/* Filters Container */}
                    <div className="max-w-4xl mx-auto bg-white p-4 rounded-2xl shadow-lg border border-gray-100 flex flex-col md:flex-row gap-4 items-center mb-16 relative z-20">

                        {/* Category Select */}
                        <div className="relative w-full md:w-1/3">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="text-xl">📂</span>
                            </div>
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="block w-full pl-10 pr-10 py-3 border-none bg-gray-50 rounded-xl text-gray-700 focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all appearance-none cursor-pointer hover:bg-gray-100 font-medium"
                            >
                                <option value="all">Todas las Categorías</option>
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>

                        {/* Divider for Desktop */}
                        <div className="hidden md:block w-px h-10 bg-gray-200"></div>

                        {/* Search Input */}
                        <div className="relative w-full md:flex-1">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-10 pr-3 py-3 border-none bg-transparent rounded-xl text-gray-900 placeholder-gray-400 focus:ring-0 focus:bg-gray-50 transition-all"
                                placeholder="¿Qué producto buscas?"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                                >
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Category Banners (Only show if 'all' selected and no search) */}
                {!searchTerm && selectedCategory === 'all' && banners.length > 0 && (
                    <div className="mb-16 grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-bottom-4 duration-700">
                        {banners.map((banner) => (
                            <div
                                key={banner.id}
                                className="relative overflow-hidden rounded-3xl bg-white shadow-xl hover:shadow-2xl transition-shadow border border-teal-50 p-8 flex items-center justify-between group cursor-default"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-teal-50 via-white to-cyan-50 opacity-80 group-hover:opacity-100 transition-opacity" />
                                <div className="absolute -right-10 -top-10 w-40 h-40 bg-cyan-100 rounded-full blur-3xl opacity-50 group-hover:opacity-70 transition-opacity" />

                                <div className="relative z-10">
                                    <div className="inline-block px-3 py-1 bg-white/80 backdrop-blur-sm rounded-full text-xs font-bold text-teal-600 uppercase tracking-wider mb-3 shadow-sm">
                                        Oferta Especial
                                    </div>
                                    <h3 className="text-3xl font-black text-gray-900 mb-2 leading-tight">
                                        {banner.category?.name}
                                    </h3>
                                    <div className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-cyan-600">
                                        {banner.discount_type === 'percentage'
                                            ? `${banner.discount_value}% OFF`
                                            : `-S/ ${banner.discount_value}`
                                        }
                                    </div>
                                </div>
                                <div className="relative z-10 w-24 h-24 bg-white rounded-2xl flex items-center justify-center shadow-lg text-5xl transform group-hover:scale-110 transition-transform duration-300">
                                    {banner.category?.icon || '🎁'}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Unified Product Grid */}
                {hasResults ? (
                    <div className="animate-in fade-in duration-700">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {displayProducts.map((product) => (
                                <div key={product.id} className="transform hover:-translate-y-1 transition-transform duration-300">
                                    <div className="relative group h-full">
                                        <ProductCard product={product} />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Show 'Varied' message only when viewing all items initially */}
                        {!searchTerm && selectedCategory === 'all' && (
                            <p className="text-center text-gray-400 text-sm mt-12 italic">

                            </p>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-24 bg-white rounded-3xl shadow-sm border border-gray-100 max-w-2xl mx-auto">
                        <div className="text-6xl mb-6 animate-bounce">🔍</div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">No encontramos resultados</h3>
                        <p className="text-gray-500">
                            Intenta ajustar tus filtros o buscar con otro término.<br />
                            {selectedCategory !== 'all' && <span className="text-teal-600 font-medium mt-2 block">Tip: Prueba cambiando la categoría a "Todas"</span>}
                        </p>
                        <button
                            onClick={() => { setSearchTerm(''); setSelectedCategory('all'); }}
                            className="mt-8 px-6 py-2.5 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors shadow-lg hover:shadow-xl"
                        >
                            Limpiar Filtros
                        </button>
                    </div>
                )}


            </div>
        </section>
    );
}
