// TypeScript interfaces for the database entities

export interface Category {
  id: number;
  name: string;
  icon: string;
  slug: string;
  description: string;
}

// Variant types
export type VariantType = 'size' | 'capacity' | 'dimensions';

export interface ProductVariant {
  id: number;
  product_id: number;
  variant_type: VariantType;
  variant_label: string;
  price: number;
  stock: number;
  is_default: boolean;
  created_at?: string;
}

export interface Product {
  id: number;
  name: string;
  category: string;
  category_id: number;
  category_name?: string;
  price: number;
  original_price: number | null;
  discount_percentage: number;
  discount_end_date: string | null;
  in_stock: boolean;
  stock: number;
  rating: number;
  review_count: number;
  description: string;
  short_description: string;
  image_url: string;
  is_featured: boolean;
  is_on_sale: boolean;
  total_sold: number;
  // Variant fields
  has_variants?: boolean;
  variant_type?: VariantType | null;
  variants?: ProductVariant[];
  selected_variant?: ProductVariant;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
  itemCount: number;
}

export interface Discount {
  id: number;
  name: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  applies_to: 'product' | 'category';
  target_id: number;
  target_name?: string;
  start_date: string | null;
  end_date: string | null;
  active: number;
  created_by: number | null;
  created_at: string;
  creator_name?: string;
}

// Helper function for discount countdown
export function getRemainingTime(endTime: string | null) {
  if (!endTime) return null;

  const now = new Date().getTime();
  const end = new Date(endTime).getTime();
  const difference = end - now;

  if (difference > 0) {
    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds, isExpired: false };
  }

  return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
}
