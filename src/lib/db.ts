import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase environment variables not set. Please configure:');
  console.warn('   NEXT_PUBLIC_SUPABASE_URL');
  console.warn('   NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

// Client-side Supabase client (uses anon key, respects RLS)
export const supabase: SupabaseClient = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
);

// Server-side Supabase client (uses service role, bypasses RLS)
export const supabaseAdmin: SupabaseClient = createClient(
  supabaseUrl || '',
  supabaseServiceRoleKey || supabaseAnonKey || '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Helper type for database tables
export type Tables = {
  categories: {
    id: number;
    name: string;
    icon: string;
    slug: string;
    description: string | null;
    created_at: string;
  };
  products: {
    id: number;
    name: string;
    category: string;
    category_id: number;
    price: number;
    original_price: number | null;
    discount_percentage: number;
    discount_end_date: string | null;
    in_stock: boolean;
    stock: number;
    rating: number;
    review_count: number;
    description: string | null;
    short_description: string | null;
    image_url: string | null;
    is_featured: boolean;
    is_on_sale: boolean;
    total_sold: number;
    customizable: boolean;
    product_type: string;
    template_image: string | null;
    created_at: string;
  };
  users: {
    id: number;
    email: string;
    password_hash: string;
    name: string;
    phone: string | null;
    role: string;
    created_at: string;
  };
  orders: {
    id: number;
    user_id: number | null;
    guest_email: string | null;
    guest_name: string | null;
    guest_phone: string | null;
    shipping_address: string | null;
    items_json: object;
    customization_json: object | null;
    subtotal: number;
    discount: number;
    total: number;
    coupon_code: string | null;
    payment_method: string | null;
    status: string;
    notes: string | null;
    created_at: string;
  };
  coupons: {
    id: number;
    code: string;
    name: string;
    discount_type: string;
    discount_value: number;
    min_purchase: number;
    max_uses: number | null;
    uses: number;
    active: boolean;
    expires_at: string | null;
    created_by: number | null;
    created_at: string;
    deactivated_by: number | null;
    deactivated_at: string | null;
  };
  discounts: {
    id: number;
    name: string;
    discount_type: string;
    discount_value: number;
    applies_to: string;
    target_id: number;
    start_date: string | null;
    end_date: string | null;
    active: boolean;
    created_by: number | null;
    created_at: string;
  };
};

// Export default for backward compatibility
export default supabaseAdmin;
