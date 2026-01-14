// Shared utility functions for product variants

export type VariantType = 'size' | 'capacity' | 'dimensions';

/**
 * Detect variant type based on product name keywords
 * - size: polo, polos
 * - capacity: taza, tazas, tomatodo, tomatodos
 * - dimensions: caja, cajas, mousepad
 */
export function detectVariantType(name: string): VariantType | null {
    const n = name.toLowerCase();
    if (n.includes('polo') || n.includes('polos')) return 'size';
    if (n.includes('taza') || n.includes('tazas') || n.includes('tomatodo') || n.includes('tomatodos')) return 'capacity';
    if (n.includes('caja') || n.includes('cajas') || n.includes('mousepad')) return 'dimensions';
    return null;
}

/**
 * Get display label for variant type
 */
export function getVariantTypeLabel(type: VariantType | null): string {
    switch (type) {
        case 'size': return 'Tallas';
        case 'capacity': return 'Capacidades (oz)';
        case 'dimensions': return 'Dimensiones';
        default: return 'Variantes';
    }
}

/**
 * Get emoji icon for variant type
 */
export function getVariantTypeIcon(type: VariantType | null): string {
    switch (type) {
        case 'size': return '👕';
        case 'capacity': return '🥤';
        case 'dimensions': return '📦';
        default: return '📋';
    }
}

// Predefined sizes for polo/clothing
export const PREDEFINED_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];
