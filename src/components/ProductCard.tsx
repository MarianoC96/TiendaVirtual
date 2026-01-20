'use client';

import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { getRemainingTime } from '@/lib/schema';
import { useEffect, useState } from 'react';
import VariantSelector from './VariantSelector';

import { Product, VariantType } from '@/lib/schema';

interface SelectedVariant {
  id: number;
  product_id: number;
  variant_type: VariantType;
  variant_label: string;
  label: string;
  price: number;
  stock: number;
  is_default: boolean;
  in_stock: boolean;
}

export default function ProductCard({ product, hideDiscountBadge = false }: { product: Product; hideDiscountBadge?: boolean }) {
  const { addItem, getItemQuantity } = useCart();
  const [timeRemaining, setTimeRemaining] = useState<ReturnType<typeof getRemainingTime>>(null);
  const [selectedVariant, setSelectedVariant] = useState<SelectedVariant | null>(null);

  // Get cart quantity - consider variant if selected
  const inCartQuantity = getItemQuantity(product.id, selectedVariant?.id);

  // Check stock - use variant stock if applicable
  const isInStock = product.has_variants && selectedVariant
    ? selectedVariant.in_stock && selectedVariant.stock > 0
    : (typeof product.in_stock === 'number' ? product.in_stock === 1 : Boolean(product.in_stock)) && product.stock > 0;

  // Calculate final price - use variant price if selected. 
  // If original_price is present, product.price is already discounted, so we use original_price as base.
  const basePrice = selectedVariant
    ? selectedVariant.price
    : (product.original_price || product.price);

  const finalPrice = product.discount_percentage && product.discount_percentage > 0
    ? basePrice * (1 - product.discount_percentage / 100)
    : basePrice;

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

  const handleVariantSelect = (variant: SelectedVariant) => {
    setSelectedVariant(variant);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // For variant products, require a variant selection
    if (product.has_variants && !selectedVariant) {
      alert('Por favor selecciona una opción');
      return;
    }

    if (!isInStock) return;

    // Check if we have enough stock for one more
    const currentStock = selectedVariant ? selectedVariant.stock : product.stock;
    if (inCartQuantity >= currentStock) {
      alert(`Solo quedan ${currentStock} unidades disponibles`);
      return;
    }

    addItem({
      ...product,
      price: finalPrice,
      stock: currentStock,
      in_stock: isInStock,
      image_url: product.image_url,
      selected_variant: selectedVariant ? {
        ...selectedVariant
      } : undefined
    });
  };

  return (
    <Link href={`/producto/${product.id}`} className="block group">
      <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
        {/* Image Container */}
        <div className="relative aspect-square bg-gradient-to-br from-teal-50 to-cyan-50 overflow-hidden">
          <img
            src={product.image_url || '/images/placeholder.svg'}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* Discount Badge - Now Top Right */}
          {!hideDiscountBadge && product.discount_percentage && product.discount_percentage > 0 && (
            <span className="absolute top-3 right-3 z-10 px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded-full shadow-md">
              {product.discount_percentage}% OFF
            </span>
          )}

          {/* Has Variants Badge - Now Top Left */}
          {product.has_variants && (
            <span className="absolute top-3 left-3 z-10 px-2 py-1 bg-purple-500 text-white text-xs font-medium rounded-full opacity-90">
              {product.variant_type === 'size' && '👕 Tallas'}
              {product.variant_type === 'capacity' && '🥤 Opciones'}
              {product.variant_type === 'dimensions' && '📦 Tamaños'}
            </span>
          )}

          {/* Countdown Timer - Now Top Left */}
          {timeRemaining && !timeRemaining.isExpired && !product.has_variants && (
            <div className="absolute top-3 left-3 z-10 bg-black/70 text-white text-xs px-2 py-1 rounded-lg backdrop-blur-sm">
              ⏰ {timeRemaining.days}d {timeRemaining.hours}h
            </div>
          )}

          {/* Quick Add Button */}
          <button
            onClick={handleAddToCart}
            disabled={!isInStock || (product.has_variants && !selectedVariant)}
            className={`absolute bottom-3 right-3 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all cursor-pointer ${isInStock && (!product.has_variants || selectedVariant)
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
          <p className="text-xs text-teal-700 font-medium uppercase tracking-wide mb-1">
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

          {/* Variant Selector */}
          {product.has_variants && product.variant_type && (
            <VariantSelector
              productId={product.id}
              variantType={product.variant_type}
              onSelect={handleVariantSelect}
              selectedVariantId={selectedVariant?.id}
              compact={true}
            />
          )}

          {/* Price */}
          <div className="flex items-center gap-2 mt-3">
            {product.has_variants && !selectedVariant ? (
              <span className="text-lg font-bold text-gray-900">
                Desde S/ {product.price.toFixed(2)}
              </span>
            ) : (
              <>
                <span className="text-xl font-bold text-gray-900">
                  S/ {finalPrice.toFixed(2)}
                </span>
                {product.original_price && product.original_price > finalPrice && (
                  <span className="text-sm text-gray-500 line-through">
                    S/ {product.original_price.toFixed(2)}
                  </span>
                )}
              </>
            )}
          </div>

          {/* Stock Status */}
          {!isInStock && (
            <span className="inline-block mt-2 text-xs text-red-600 font-medium">
              {product.has_variants && selectedVariant ? `${selectedVariant.label} agotado` : 'Agotado'}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
