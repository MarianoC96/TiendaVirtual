'use client';

import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { getRemainingTime } from '@/lib/schema';
import { useEffect, useState } from 'react';

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
  discount_info?: {
    id?: number;
    applies_to?: string;
    amount: number;
    type: string;
    value: number;
    label: string;
  };
}

export default function ProductCard({ product }: { product: Product }) {
  const { addItem, getItemQuantity } = useCart();
  const [timeRemaining, setTimeRemaining] = useState<ReturnType<typeof getRemainingTime>>(null);

  const inCartQuantity = getItemQuantity(product.id);
  // Fix stock check logic: handle both number (0/1) and boolean types
  const isInStock = (typeof product.in_stock === 'number' ? product.in_stock === 1 : Boolean(product.in_stock)) && product.stock > 0;
  const finalPrice = product.discount_percentage && product.discount_percentage > 0
    ? product.price * (1 - product.discount_percentage / 100)
    : product.price;

  useEffect(() => {
    if (product.discount_end_date) {
      const updateCountdown = () => {
        setTimeRemaining(getRemainingTime(product.discount_end_date ?? null));
      };
      updateCountdown();
      const interval = setInterval(updateCountdown, 1000);
      return () => clearInterval(interval);
    }
  }, [product.discount_end_date]);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isInStock) return;

    addItem({
      id: product.id,
      name: product.name,
      price: finalPrice,
      original_price: product.original_price,
      discount_percentage: product.discount_percentage,
      image_url: product.image_url,
      short_description: product.short_description,
      stock: product.stock,
      in_stock: isInStock,
      discount_info: product.discount_info
    });
  };

  return (
    <Link href={`/producto/${product.id}`} className="block group">
      <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
        {/* Image Container */}
        <div className="relative aspect-square bg-gradient-to-br from-teal-50 to-cyan-50 overflow-hidden">
          <img
            src={product.image_url || 'https://via.placeholder.com/300x300/fef2f2/666?text=☕'}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* Discount Badge */}
          {product.discount_percentage && product.discount_percentage > 0 && (
            <span className="absolute top-3 left-3 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
              -{product.discount_percentage}%
            </span>
          )}

          {/* Countdown Timer */}
          {timeRemaining && !timeRemaining.isExpired && (
            <div className="absolute top-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded-lg backdrop-blur-sm">
              ⏰ {timeRemaining.days}d {timeRemaining.hours}h
            </div>
          )}

          {/* Quick Add Button */}
          <button
            onClick={handleAddToCart}
            disabled={!isInStock}
            className={`absolute bottom-3 right-3 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all ${isInStock
              ? 'bg-teal-600 text-white hover:bg-teal-700 hover:scale-110'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
          >
            {inCartQuantity > 0 ? (
              <span className="text-sm font-bold">{inCartQuantity}</span>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            )}
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Category */}
          <p className="text-xs text-teal-600 font-medium uppercase tracking-wide mb-1">
            {product.category_name || product.category}
          </p>

          {/* Name */}
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-teal-600 transition-colors">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-3">
            <div className="flex text-amber-400 text-sm">
              {[...Array(5)].map((_, i) => (
                <span key={i}>{i < Math.floor(product.rating) ? '★' : '☆'}</span>
              ))}
            </div>
            <span className="text-xs text-gray-500">({product.review_count})</span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-gray-900">
              S/ {finalPrice.toFixed(2)}
            </span>
            {product.original_price && product.original_price > finalPrice && (
              <span className="text-sm text-gray-400 line-through">
                S/ {product.original_price.toFixed(2)}
              </span>
            )}
          </div>

          {/* Stock Status */}
          {!isInStock && (
            <span className="inline-block mt-2 text-xs text-red-600 font-medium">
              Agotado
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
