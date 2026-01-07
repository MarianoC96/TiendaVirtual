'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { getRemainingTime } from '@/lib/schema';
import ProductCustomizer from '@/components/ProductCustomizer';

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
  description?: string;
  short_description?: string;
  image_url?: string;
  customizable?: number;
  product_type?: string;
}

interface CustomizationData {
  uploadedImage: string | null;
  x: number;
  y: number;
  width: number;
  height: number;
  previewBase64: string | null;
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const { addItem, getItemQuantity } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [timeRemaining, setTimeRemaining] = useState<ReturnType<typeof getRemainingTime>>(null);
  const [customization, setCustomization] = useState<CustomizationData | null>(null);
  const [showCustomizer, setShowCustomizer] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${id}`);
        if (!res.ok) throw new Error('Product not found');
        const data = await res.json();
        setProduct(data);
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  // Countdown timer
  useEffect(() => {
    if (product?.discount_end_date) {
      const updateCountdown = () => {
        setTimeRemaining(getRemainingTime(product.discount_end_date ?? null));
      };
      updateCountdown();
      const interval = setInterval(updateCountdown, 1000);
      return () => clearInterval(interval);
    }
  }, [product?.discount_end_date]);

  const handleCustomizationChange = useCallback((data: CustomizationData) => {
    setCustomization(data);
  }, []);

  const handleAddToCart = () => {
    if (!product) return;

    const itemData = {
      id: product.id,
      name: product.name,
      price: finalPrice,
      original_price: product.original_price,
      discount_percentage: product.discount_percentage,
      image_url: customization?.previewBase64 || product.image_url,
      short_description: product.short_description,
      stock: product.stock,
      in_stock: product.in_stock === 1,
      customization: customization?.uploadedImage ? customization : undefined
    };

    for (let i = 0; i < quantity; i++) {
      addItem(itemData);
    }
    setQuantity(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-rose-600 border-t-transparent" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center py-16">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Producto no encontrado</h1>
        <Link href="/productos" className="text-rose-600 hover:underline">
          Volver a productos
        </Link>
      </div>
    );
  }

  // Fix stock check to be consistent with API response types
  const isInStock = (typeof product.in_stock === 'number' ? product.in_stock === 1 : Boolean(product.in_stock)) && product.stock > 0;
  const finalPrice = product.discount_percentage && product.discount_percentage > 0
    ? product.price * (1 - product.discount_percentage / 100)
    : product.price;
  const inCartQuantity = getItemQuantity(product.id);
  const isCustomizable = product.customizable === 1;
  const productType = (product.product_type || 'cup') as 'cup' | 'tshirt' | 'notebook' | 'set';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link href="/" className="hover:text-rose-600">Inicio</Link>
          <span>/</span>
          <Link href="/productos" className="hover:text-rose-600">Productos</Link>
          <span>/</span>
          <span className="text-gray-900">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Image / Customizer */}
          <div className="space-y-6">
            <div className="relative">
              {/* Discount Badge */}
              {product.discount_percentage && product.discount_percentage > 0 && (
                <span className="absolute top-4 left-4 z-10 px-3 py-1 bg-red-500 text-white font-bold rounded-full">
                  -{product.discount_percentage}% OFF
                </span>
              )}

              {/* Countdown Timer */}
              {timeRemaining && !timeRemaining.isExpired && (
                <div className="absolute top-4 right-4 z-10 bg-red-500/90 backdrop-blur-sm text-white px-4 py-2 rounded-xl">
                  <p className="text-xs font-medium mb-1">¡Oferta termina en!</p>
                  <div className="flex items-center gap-1 text-lg font-bold">
                    <span>{String(timeRemaining.days).padStart(2, '0')}d</span>
                    <span>:</span>
                    <span>{String(timeRemaining.hours).padStart(2, '0')}h</span>
                    <span>:</span>
                    <span>{String(timeRemaining.minutes).padStart(2, '0')}m</span>
                  </div>
                </div>
              )}

              <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
                <img
                  src={customization?.previewBase64 || product.image_url || 'https://via.placeholder.com/600x400/fef2f2/666?text=☕'}
                  alt={product.name}
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>

            {/* Customizer Toggle */}
            {isCustomizable && (
              <button
                onClick={() => setShowCustomizer(!showCustomizer)}
                className="w-full py-3 border-2 border-rose-600 text-rose-600 font-semibold rounded-xl hover:bg-rose-50 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {showCustomizer ? 'Ocultar Personalizador' : '✨ Personalizar con mi imagen'}
              </button>
            )}

            {/* Product Customizer */}
            {showCustomizer && isCustomizable && (
              <ProductCustomizer
                productType={productType}
                productName={product.name}
                onCustomizationChange={handleCustomizationChange}
              />
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <p className="text-sm font-medium text-rose-600 uppercase tracking-wide mb-2">
                {product.category_name || product.category}
              </p>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <span key={i}>{i < Math.floor(product.rating) ? '★' : '☆'}</span>
                  ))}
                </div>
                <span className="text-gray-600">
                  {product.rating.toFixed(1)} ({product.review_count} reseñas)
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="bg-gradient-to-r from-rose-50 to-orange-50 rounded-2xl p-6">
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-4xl font-bold text-rose-600">
                  S/ {finalPrice.toFixed(2)}
                </span>
                {product.original_price && product.original_price > finalPrice && (
                  <span className="text-xl text-gray-400 line-through">
                    S/ {product.original_price.toFixed(2)}
                  </span>
                )}
              </div>
              {product.discount_percentage && product.discount_percentage > 0 && (
                <p className="text-green-600 font-medium">
                  ¡Ahorras S/ {(product.price - finalPrice).toFixed(2)}!
                </p>
              )}
            </div>

            {/* Customization Badge */}
            {isCustomizable && (
              <div className="flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-3 rounded-xl">
                <span className="text-xl">✨</span>
                <span className="font-medium">¡Este producto es personalizable!</span>
              </div>
            )}

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              {isInStock ? (
                <>
                  <span className="w-3 h-3 bg-green-500 rounded-full" />
                  <span className="text-green-600 font-medium">
                    En stock ({product.stock} disponibles)
                  </span>
                </>
              ) : (
                <>
                  <span className="w-3 h-3 bg-red-500 rounded-full" />
                  <span className="text-red-600 font-medium">Agotado</span>
                </>
              )}
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-4">
              <span className="font-medium text-gray-700">Cantidad:</span>
              <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="px-4 py-2 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  -
                </button>
                <span className="px-6 py-2 font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                  className="px-4 py-2 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to Cart */}
            <button
              onClick={handleAddToCart}
              disabled={!isInStock}
              className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all ${isInStock
                ? 'bg-gradient-to-r from-rose-600 to-orange-500 text-white hover:shadow-xl hover:scale-[1.02]'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
            >
              {inCartQuantity > 0 && (
                <span className="w-6 h-6 bg-orange-500 rounded-full text-sm flex items-center justify-center">
                  {inCartQuantity}
                </span>
              )}
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {!isInStock ? 'Agotado' : customization?.uploadedImage ? 'Agregar Personalizado al Carrito' : 'Agregar al Carrito'}
            </button>

            {/* Description */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Descripción</h3>
              <p className="text-gray-600 leading-relaxed">
                {product.description || product.short_description || 'Sin descripción disponible.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
