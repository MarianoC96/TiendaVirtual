-- Migration: 012_product_variants
-- Description: Add product variants system with individual pricing
-- Run this in Supabase SQL Editor

-- =====================================================
-- 1. CREATE PRODUCT VARIANTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS product_variants (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_type TEXT NOT NULL,        -- 'size' | 'capacity' | 'dimensions'
  variant_label TEXT NOT NULL,       -- 'M', '12oz', '10x15'
  price DECIMAL(10,2) NOT NULL,      -- Precio específico de esta variante
  stock INTEGER DEFAULT 0,
  is_default BOOLEAN DEFAULT false,  -- Variante por defecto a mostrar
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 2. CREATE INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_default ON product_variants(product_id, is_default);

-- =====================================================
-- 3. ADD COLUMNS TO PRODUCTS TABLE
-- =====================================================
ALTER TABLE products ADD COLUMN IF NOT EXISTS has_variants BOOLEAN DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS variant_type TEXT; -- 'size' | 'capacity' | 'dimensions' | null

-- =====================================================
-- 4. ENABLE RLS (Row Level Security) - Optional but recommended
-- =====================================================
-- If you have RLS enabled on products, you may want to add policies for product_variants
-- ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow public read access" ON product_variants FOR SELECT USING (true);
-- CREATE POLICY "Allow authenticated insert" ON product_variants FOR INSERT WITH CHECK (true);
-- CREATE POLICY "Allow authenticated update" ON product_variants FOR UPDATE USING (true);
-- CREATE POLICY "Allow authenticated delete" ON product_variants FOR DELETE USING (true);

-- =====================================================
-- VERIFICATION QUERY (run after migration)
-- =====================================================
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'product_variants';
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'products' AND column_name IN ('has_variants', 'variant_type');
