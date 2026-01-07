-- Migration: 001_create_tables
-- Description: Create all base tables for the tienda virtual

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  category_id INTEGER NOT NULL REFERENCES categories(id),
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  discount_percentage INTEGER DEFAULT 0,
  discount_end_date TIMESTAMPTZ,
  in_stock BOOLEAN DEFAULT true,
  stock INTEGER DEFAULT 0,
  rating DECIMAL(2,1) DEFAULT 5.0,
  review_count INTEGER DEFAULT 0,
  description TEXT,
  short_description TEXT,
  image_url TEXT,
  is_featured BOOLEAN DEFAULT false,
  is_on_sale BOOLEAN DEFAULT false,
  total_sold INTEGER DEFAULT 0,
  customizable BOOLEAN DEFAULT true,
  product_type TEXT DEFAULT 'cup',
  template_image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  role TEXT DEFAULT 'client',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  guest_email TEXT,
  guest_name TEXT,
  guest_phone TEXT,
  shipping_address TEXT,
  items_json JSONB NOT NULL,
  customization_json JSONB,
  subtotal DECIMAL(10,2) NOT NULL,
  discount DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  coupon_code TEXT,
  payment_method TEXT,
  status TEXT DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Coupons table
CREATE TABLE IF NOT EXISTS coupons (
  id SERIAL PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  discount_type TEXT NOT NULL,
  discount_value DECIMAL(10,2) NOT NULL,
  min_purchase DECIMAL(10,2) DEFAULT 0,
  max_uses INTEGER,
  uses INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  deactivated_by INTEGER REFERENCES users(id),
  deactivated_at TIMESTAMPTZ
);

-- Discounts table
CREATE TABLE IF NOT EXISTS discounts (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  discount_type TEXT NOT NULL,
  discount_value DECIMAL(10,2) NOT NULL,
  applies_to TEXT NOT NULL,
  target_id INTEGER NOT NULL,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  active BOOLEAN DEFAULT true,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_is_on_sale ON products(is_on_sale);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_discounts_target ON discounts(applies_to, target_id);
