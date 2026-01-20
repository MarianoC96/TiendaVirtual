'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { getRemainingTime } from '@/lib/schema';
import ProductCustomizer from '@/components/ProductCustomizer';

import { Product, ProductVariant, VariantType } from '@/lib/schema';

interface CustomizationData {
  uploadedImage: string | null;
  x: number;
  y: number;
  width: number;
  height: number;
  previewBase64: string | null;
}

// Helper to get variant type label
function getVariantTypeLabel(type: VariantType | null | undefined): string {
  switch (type) {
    case 'size': return 'Talla';
    case 'capacity': return 'Capacidad';
    case 'dimensions': return 'Dimensiones';
    default: return 'Opción';
  }
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
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${id}`);
        if (!res.ok) throw new Error('Product not found');
        const data = await res.json();
        setProduct(data);

        // Auto-select default variant if product has variants
        if (data.has_variants && data.variants && data.variants.length > 0) {
          const defaultVariant = data.variants.find((v: ProductVariant) => v.is_default) || data.variants[0];
          setSelectedVariant(defaultVariant);
        }
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

    // Require variant selection for variant products
    if (product.has_variants && !selectedVariant) {
      alert('Por favor selecciona una opción');
      return;
    }

    const effectivePrice = selectedVariant ? selectedVariant.price : finalPrice;
    const effectiveStock = selectedVariant ? selectedVariant.stock : product.stock;

    const itemData: Product = {
      ...product,
      price: effectivePrice,
      stock: effectiveStock,
      in_stock: selectedVariant ? selectedVariant.in_stock : product.in_stock === 1,
      image_url: customization?.previewBase64 || product.image_url,
      customization: customization?.uploadedImage ? customization : undefined,
      selected_variant: selectedVariant ? {
        ...selectedVariant
      } : undefined
    };

    for (let i = 0; i < quantity; i++) {
      addItem(itemData);
    }
    setQuantity(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-600 border-t-transparent" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center py-16">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Producto no encontrado</h1>
        <Link href="/productos" className="text-teal-600 hover:underline">
          Volver a productos
        </Link>
      </div>
    );
  }

  // Use variant values if selected, otherwise use product values
  const currentStock = selectedVariant ? selectedVariant.stock : product.stock;
  const currentInStock = selectedVariant
    ? selectedVariant.in_stock
    : (typeof product.in_stock === 'number' ? product.in_stock === 1 : Boolean(product.in_stock)) && product.stock > 0;

  const basePrice = selectedVariant ? selectedVariant.price : product.price;
  const finalPrice = product.discount_percentage && product.discount_percentage > 0
    ? basePrice * (1 - product.discount_percentage / 100)
    : basePrice;

  const inCartQuantity = getItemQuantity(product.id, selectedVariant?.id);
  const isCustomizable = product.customizable === 1;
  const productType = (product.product_type || 'cup') as 'cup' | 'tshirt' | 'notebook' | 'set';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link href="/" className="hover:text-teal-600">Inicio</Link>
          <span>/</span>
          <Link href="/productos" className="hover:text-teal-600">Productos</Link>
          <span>/</span>
          <span className="text-gray-900">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Image / Customizer */}
          <div className="space-y-6">
            <div className="relative">
              {/* Discount Badge */}
              {/* Discount Badge - Fixed "0" bug and moved to Right */}
              {(product.discount_percentage || 0) > 0 && (
                <span className="absolute top-4 right-4 z-20 px-3 py-1.5 bg-red-500 text-white font-bold rounded-full shadow-lg">
                  {product.discount_percentage}% OFF
                </span>
              )}

              {/* Countdown Timer - Moved to Left */}
              {timeRemaining && !timeRemaining.isExpired && (
                <div className="absolute top-4 left-4 z-20 bg-black/70 backdrop-blur-sm text-white px-3 py-1.5 rounded-xl">
                  <div className="flex items-center gap-1 text-sm font-bold">
                    <span>⏰</span>
                    <span>{String(timeRemaining.days).padStart(2, '0')}d</span>
                    <span>:</span>
                    <span>{String(timeRemaining.hours).padStart(2, '0')}h</span>
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
                className="w-full py-3 border-2 border-teal-600 text-teal-600 font-semibold rounded-xl hover:bg-teal-50 transition-colors flex items-center justify-center gap-2 cursor-pointer"
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
              <p className="text-sm font-medium text-teal-600 uppercase tracking-wide mb-2">
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

            {/* Variant Selector */}
            {product.has_variants && product.variants && product.variants.length > 0 && (
              <div className="border border-purple-200 rounded-2xl p-6 bg-purple-50/50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-purple-900">
                    {product.variant_type === 'size' && '👕 Selecciona tu talla'}
                    {product.variant_type === 'capacity' && '🥤 Selecciona la capacidad'}
                    {product.variant_type === 'dimensions' && '📦 Selecciona el tamaño'}
                  </h3>
                </div>

                <div className="flex flex-wrap gap-3">
                  {product.variants.map(variant => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(variant)}
                      disabled={!variant.in_stock}
                      className={`relative px-5 py-3 rounded-xl border-2 transition-all cursor-pointer ${selectedVariant?.id === variant.id
                        ? 'bg-purple-600 text-white border-purple-600 shadow-lg shadow-purple-200'
                        : variant.in_stock
                          ? 'bg-white text-gray-700 border-gray-200 hover:border-purple-400 hover:shadow-md'
                          : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                        }`}
                    >
                      <span className={`font-semibold text-lg ${!variant.in_stock ? 'line-through' : ''}`}>
                        {variant.label}
                      </span>
                      <span className={`block text-sm ${selectedVariant?.id === variant.id ? 'text-purple-200' : 'text-gray-500'
                        }`}>
                        S/ {variant.price.toFixed(2)}
                      </span>

                      {/* Stock indicator */}
                      {variant.in_stock && (
                        <span className={`block text-xs mt-1 ${selectedVariant?.id === variant.id ? 'text-purple-200' : 'text-gray-400'
                          }`}>
                          {variant.stock} disponibles
                        </span>
                      )}

                      {!variant.in_stock && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                          Agotado
                        </span>
                      )}

                      {variant.in_stock && variant.stock <= 3 && (
                        <span className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full">
                          ¡Últimos!
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                {selectedVariant && (
                  <p className="mt-4 text-sm text-purple-700">
                    ✓ {getVariantTypeLabel(product.variant_type)} seleccionada: <strong>{selectedVariant.label}</strong> - Stock: <strong>{selectedVariant.stock}</strong>
                  </p>
                )}
              </div>
            )}

            {/* Price */}
            <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-2xl p-6">
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-4xl font-bold text-teal-600">
                  S/ {finalPrice.toFixed(2)}
                </span>
                {product.original_price && product.original_price > finalPrice && (
                  <span className="text-xl text-gray-400 line-through">
                    S/ {product.original_price.toFixed(2)}
                  </span>
                )}
              </div>
              {(product.discount_percentage || 0) > 0 && (
                <p className="text-green-600 font-medium">
                  ¡Ahorras S/ {(basePrice - finalPrice).toFixed(2)}!
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
              {currentInStock ? (
                <>
                  <span className="w-3 h-3 bg-green-500 rounded-full" />
                  <span className="text-green-600 font-medium">
                    En stock ({currentStock} disponibles)
                    {selectedVariant && <span className="text-gray-500 text-sm ml-1">- {selectedVariant.label}</span>}
                  </span>
                </>
              ) : (
                <>
                  <span className="w-3 h-3 bg-red-500 rounded-full" />
                  <span className="text-red-600 font-medium">
                    Agotado
                    {selectedVariant && <span className="text-gray-500 text-sm ml-1">- {selectedVariant.label}</span>}
                  </span>
                </>
              )}
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-4">
              <span className="font-medium text-gray-700">Cantidad:</span>
              <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="px-4 py-2 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  -
                </button>
                <span className="px-6 py-2 font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => Math.min(currentStock, q + 1))}
                  className="px-4 py-2 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to Cart */}
            <button
              onClick={handleAddToCart}
              disabled={!currentInStock || (product.has_variants && !selectedVariant)}
              className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all cursor-pointer ${currentInStock && (!product.has_variants || selectedVariant)
                ? 'bg-gradient-to-r from-teal-600 to-cyan-500 text-white hover:shadow-xl hover:scale-[1.02]'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
            >
              {inCartQuantity > 0 && (
                <span className="w-6 h-6 bg-cyan-500 rounded-full text-sm flex items-center justify-center">
                  {inCartQuantity}
                </span>
              )}
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {!currentInStock
                ? 'Agotado'
                : product.has_variants && !selectedVariant
                  ? `Selecciona ${getVariantTypeLabel(product.variant_type).toLowerCase()}`
                  : customization?.uploadedImage
                    ? 'Agregar Personalizado al Carrito'
                    : 'Agregar al Carrito'}
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
