'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ProductCard from './ProductCard';

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

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products/best-selling');
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        if (Array.isArray(data)) {
          setProducts(data);
        } else {
          setProducts([]);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-teal-100 text-teal-700 rounded-full text-sm font-medium mb-4">
            🔥 Los Más Vendidos
          </span>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Nuestras Tazas Favoritas
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Descubre las tazas más populares elegidas por nuestros clientes
          </p>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-600 border-t-transparent" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="text-center mt-12">
          <Link
            href="/productos"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 text-white font-semibold rounded-full hover:bg-gray-800 transition-colors"
          >
            Ver Todos los Productos
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
