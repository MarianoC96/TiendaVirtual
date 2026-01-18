'use client';

import { useState, useEffect } from 'react';

type VariantType = 'size' | 'capacity' | 'dimensions';

interface Variant {
    id: number;
    type: VariantType;
    label: string;
    price: number;
    stock: number;
    is_default: boolean;
    in_stock: boolean;
}

interface VariantSelectorProps {
    productId: number;
    variantType: VariantType;
    onSelect: (variant: Variant) => void;
    selectedVariantId?: number;
    compact?: boolean; // For smaller display in cards
}

// Get variant type display info
function getVariantTypeInfo(type: VariantType) {
    switch (type) {
        case 'size':
            return { label: 'Talla', icon: '👕' };
        case 'capacity':
            return { label: 'Capacidad', icon: '🥤' };
        case 'dimensions':
            return { label: 'Dimensiones', icon: '📦' };
    }
}

export default function VariantSelector({
    productId,
    variantType,
    onSelect,
    selectedVariantId,
    compact = false
}: VariantSelectorProps) {
    const [variants, setVariants] = useState<Variant[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchVariants = async () => {
            try {
                setLoading(true);
                setError(null);
                const res = await fetch(`/api/products/${productId}/variants`);

                // Handle 404 gracefully - product might not have variants table yet
                if (res.status === 404) {
                    setVariants([]);
                    return;
                }

                if (!res.ok) {
                    // Don't throw error for non-critical failures
                    console.warn('Could not fetch variants for product', productId);
                    setVariants([]);
                    return;
                }

                const data = await res.json();

                // If response is an error object, treat as empty
                if (data.error) {
                    setVariants([]);
                    return;
                }

                setVariants(data);

                // Auto-select default variant if none selected
                if (!selectedVariantId && data.length > 0) {
                    const defaultVariant = data.find((v: Variant) => v.is_default) || data[0];
                    onSelect(defaultVariant);
                }
            } catch (err) {
                // Silently fail - variants are optional
                console.warn('Variants fetch failed:', err);
                setVariants([]);
            } finally {
                setLoading(false);
            }
        };

        fetchVariants();
    }, [productId]);

    if (loading) {
        return (
            <div className={`flex items-center gap-2 ${compact ? 'text-xs' : 'text-sm'}`}>
                <div className="w-4 h-4 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-gray-500">Cargando opciones...</span>
            </div>
        );
    }

    if (error || variants.length === 0) {
        return null;
    }

    const info = getVariantTypeInfo(variantType);

    // Compact mode for product cards
    if (compact) {
        return (
            <div className="mt-2">
                <p className="text-xs text-gray-500 mb-1">{info.icon} {info.label}:</p>
                <div className="flex flex-wrap gap-1">
                    {variants.map(variant => (
                        <button
                            key={variant.id}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onSelect(variant);
                            }}
                            disabled={!variant.in_stock}
                            className={`px-2 py-0.5 text-xs rounded-md border transition-all cursor-pointer ${selectedVariantId === variant.id
                                ? 'bg-teal-600 text-white border-teal-600'
                                : variant.in_stock
                                    ? 'bg-white text-gray-700 border-gray-300 hover:border-teal-400'
                                    : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed line-through'
                                }`}
                        >
                            {variant.label}
                            {variant.type === 'capacity' && ' oz'}
                            {variant.type === 'dimensions' && ' cm'}
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    // Full mode for product detail page
    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                    {info.icon} Selecciona {info.label.toLowerCase()}:
                </label>
                {selectedVariantId && (
                    <span className="text-sm text-teal-600 font-medium">
                        S/ {variants.find(v => v.id === selectedVariantId)?.price.toFixed(2)}
                    </span>
                )}
            </div>

            <div className="flex flex-wrap gap-2">
                {variants.map(variant => (
                    <button
                        key={variant.id}
                        onClick={() => onSelect(variant)}
                        disabled={!variant.in_stock}
                        className={`relative px-4 py-2 rounded-xl border-2 transition-all cursor-pointer ${selectedVariantId === variant.id
                            ? 'bg-teal-50 text-teal-700 border-teal-500 shadow-md shadow-teal-100'
                            : variant.in_stock
                                ? 'bg-white text-gray-700 border-gray-200 hover:border-teal-300 hover:shadow-sm'
                                : 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed'
                            }`}
                    >
                        <span className={`font-medium ${!variant.in_stock ? 'line-through' : ''}`}>
                            {variant.label}
                            {variant.type === 'capacity' && ' oz'}
                            {variant.type === 'dimensions' && ' cm'}
                        </span>
                        <span className={`block text-xs ${selectedVariantId === variant.id ? 'text-teal-600' : 'text-gray-500'
                            }`}>
                            S/ {variant.price.toFixed(2)}
                        </span>

                        {!variant.in_stock && (
                            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                                Agotado
                            </span>
                        )}

                        {variant.in_stock && variant.stock <= 5 && (
                            <span className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                                ¡Últimos {variant.stock}!
                            </span>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}
