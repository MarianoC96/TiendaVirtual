import {
    Product as SchemaProduct,
    Category as SchemaCategory,
    ProductVariant as SchemaProductVariant
} from '@/lib/schema';

// Export the same variant type to avoid duplication errors and ensure compatibility
export type ProductVariant = SchemaProductVariant;

export interface Product extends SchemaProduct {
    category_name?: string;
    // We can also keep specific aliases if used in filters
    product_variants?: ProductVariant[];
}

export interface Category extends SchemaCategory { }

export type ViewMode = 'grid' | 'grouped';
