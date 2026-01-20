import { Product as SchemaProduct, Category as SchemaCategory } from '@/lib/schema';

export interface ProductVariant {
    id: number;
    variant_type: 'size' | 'capacity' | 'dimensions';
    variant_label: string;
    price: number;
    stock: number;
}

// Extending or redefining based on usage in page.tsx
export interface Product extends Omit<SchemaProduct, 'variants'> {
    category_name?: string;
    product_variants?: ProductVariant[];
}

export interface Category extends SchemaCategory {
    // Add any extra fields if page.tsx had them, seemingly standard.
}

export type ViewMode = 'grid' | 'grouped';
