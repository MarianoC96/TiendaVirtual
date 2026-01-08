-- Add audit columns to products table
ALTER TABLE products
ADD COLUMN IF NOT EXISTS created_by BIGINT REFERENCES users(id),
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS deleted_by TEXT;

-- Index for faster filtering by deleted status
CREATE INDEX IF NOT EXISTS idx_products_deleted_at ON products(deleted_at);
