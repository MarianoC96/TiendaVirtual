-- Start of file: 001_create_tables.sql
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

-- End of file: 001_create_tables.sql

-- Start of file: 002_sample_orders.sql
-- Script para insertar pedidos de prueba
-- Ejecutar en Supabase SQL Editor o herramienta SQL

-- Pedido 1: Pedido reciente (hoy) - Normal
INSERT INTO orders (
  user_id,
  guest_email,
  guest_name,
  guest_phone,
  shipping_address,
  items_json,
  subtotal,
  discount,
  total,
  coupon_code,
  payment_method,
  status,
  notes,
  created_at
) VALUES (
  NULL,
  'maria.garcia@email.com',
  'MarÃ­a GarcÃ­a',
  '987654321',
  'Av. Javier Prado 1234, San Isidro, Lima',
  '[{"product":{"id":1,"name":"Taza Personalizada Premium","price":35.00,"image_url":"https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=200"},"quantity":2},{"product":{"id":2,"name":"Polo Estampado","price":45.00,"image_url":"https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200"},"quantity":1}]',
  115.00,
  10.00,
  105.00,
  'DESCUENTO10',
  'yape',
  'pending',
  'Por favor enviar antes del viernes',
  NOW()
);

-- Pedido 2: Pedido atrasado (hace 3 dÃ­as) - DeberÃ­a mostrarse en rojo
INSERT INTO orders (
  user_id,
  guest_email,
  guest_name,
  guest_phone,
  shipping_address,
  items_json,
  subtotal,
  discount,
  total,
  coupon_code,
  payment_method,
  status,
  notes,
  created_at
) VALUES (
  NULL,
  'carlos.lopez@email.com',
  'Carlos LÃ³pez',
  '912345678',
  'Jr. Las Begonias 456, Miraflores, Lima',
  '[{"product":{"id":3,"name":"Gorra Bordada","price":25.00,"image_url":"https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=200"},"quantity":3},{"product":{"id":1,"name":"Taza Personalizada Premium","price":35.00,"image_url":"https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=200"},"quantity":1}]',
  110.00,
  0.00,
  110.00,
  NULL,
  'transferencia',
  'processing',
  'Cliente espera entrega urgente',
  NOW() - INTERVAL '3 days'
);

-- End of file: 002_sample_orders.sql

-- Start of file: 003_sample_discounts.sql
-- Script para insertar descuentos de ejemplo
-- Ejecutar en Supabase SQL Editor

-- 1. Descuento por CategorÃ­a (20% en toda la categorÃ­a de Tazas - asumiendo category_id = 1)
INSERT INTO discounts (
  name,
  discount_type,
  discount_value,
  applies_to,
  target_id,
  start_date,
  end_date,
  active,
  created_by
) VALUES (
  'PromociÃ³n Tazas Enero',
  'percentage',
  20,
  'category',
  1, -- ID de la categorÃ­a (ajustar segÃºn tu base de datos)
  '2026-01-01',
  '2026-01-31',
  true,
  1
);

-- 2. Descuento por Producto (S/10 de descuento en producto especÃ­fico - asumiendo product_id = 1)
INSERT INTO discounts (
  name,
  discount_type,
  discount_value,
  applies_to,
  target_id,
  start_date,
  end_date,
  active,
  created_by
) VALUES (
  'Oferta Especial Taza Premium',
  'fixed',
  10.00,
  'product',
  1, -- ID del producto (ajustar segÃºn tu base de datos)
  NULL, -- Sin fecha de inicio (siempre activo)
  NULL, -- Sin fecha de fin
  true,
  1
);

-- 3. Descuento por Valor del Carrito (15% si el carrito supera S/100)
INSERT INTO discounts (
  name,
  discount_type,
  discount_value,
  applies_to,
  target_id,
  start_date,
  end_date,
  active,
  created_by
) VALUES (
  'Â¡Descuento por compra grande!',
  'percentage',
  15,
  'cart_value',
  100, -- Valor mÃ­nimo del carrito: S/100
  '2026-01-01',
  '2026-12-31',
  true,
  1
);

-- End of file: 003_sample_discounts.sql

-- Start of file: 004_add_discount_info.sql
-- MigraciÃ³n para agregar campo discount_info a la tabla orders
-- Este campo almacena informaciÃ³n sobre los descuentos aplicados al pedido
-- Ejecutar en Supabase SQL Editor

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS discount_info JSONB;

-- Ejemplo de estructura del campo discount_info:
-- {
--   "coupon": { "code": "VERANO20", "amount": 10.00, "type": "percentage", "value": 20 },
--   "cart_discount": { "name": "Promo Verano", "amount": 15.00, "type": "percentage", "value": 15, "min_value": 100 },
--   "product_discounts": [{ "product_id": 1, "product_name": "Taza X", "amount": 5.00, "type": "fixed" }],
--   "category_discounts": [{ "category_id": 2, "category_name": "Tazas", "amount": 8.00, "type": "percentage", "value": 10 }]
-- }

-- End of file: 004_add_discount_info.sql

-- Start of file: 005_soft_delete_orders.sql
-- MigraciÃ³n para implementar eliminaciÃ³n suave de pedidos
-- Ejecutar en Supabase SQL Editor

-- Agregar columnas para soft delete
ALTER TABLE orders ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS deleted_by TEXT; -- 'user_id:X' o 'system:expired'
ALTER TABLE orders ADD COLUMN IF NOT EXISTS deletion_reason TEXT; -- 'manual' o 'expired_30_days'

-- Ãndice para consultas eficientes de pedidos no eliminados
CREATE INDEX IF NOT EXISTS idx_orders_deleted_at ON orders (deleted_at);

-- Comentarios explicativos:
-- deleted_at: fecha/hora de eliminaciÃ³n, NULL si no estÃ¡ eliminado
-- deleted_by: quiÃ©n eliminÃ³ el pedido (ej: "admin:1" o "system:auto_expire")
-- deletion_reason: razÃ³n de eliminaciÃ³n ("manual" o "expired_30_days")

-- End of file: 005_soft_delete_orders.sql

-- Start of file: 006_test_history_orders_2026.sql
-- Script para generar pedidos de prueba para historial 2026
-- Ejecutar en Supabase SQL Editor

-- Enero 2026: Pedido Entregado
INSERT INTO orders (guest_name, guest_email, items_json, subtotal, total, status, created_at, payment_method)
VALUES (
  'Juan Enero', 'juan.enero@test.com', 
  '[{"product": {"id": 1, "name": "Vaso TÃ©rmico", "price": 45.00}, "quantity": 1}]', 
  45.00, 45.00, 'delivered', '2026-01-15 10:30:00', 'Yape'
);

-- Febrero 2026: Pedido Entregado
INSERT INTO orders (guest_name, guest_email, items_json, subtotal, total, status, created_at, payment_method)
VALUES (
  'Maria Febrero', 'maria.feb@test.com', 
  '[{"product": {"id": 2, "name": "Taza Personalizada", "price": 25.00}, "quantity": 2}]', 
  50.00, 50.00, 'delivered', '2026-02-14 14:20:00', 'Plin'
);

-- Marzo 2026: Pedido Entregado
INSERT INTO orders (guest_name, guest_email, items_json, subtotal, total, status, created_at, payment_method)
VALUES (
  'Carlos Marzo', 'carlos.mar@test.com', 
  '[{"product": {"id": 1, "name": "Vaso TÃ©rmico", "price": 45.00}, "quantity": 3}]', 
  135.00, 135.00, 'delivered', '2026-03-20 09:15:00', 'Transferencia'
);

-- Abril 2026: Pedido Cancelado
INSERT INTO orders (guest_name, guest_email, items_json, subtotal, total, status, created_at, payment_method)
VALUES (
  'Ana Abril', 'ana.abr@test.com', 
  '[{"product": {"id": 1, "name": "Vaso TÃ©rmico", "price": 45.00}, "quantity": 1}]', 
  45.00, 45.00, 'cancelled', '2026-04-10 16:45:00', 'Yape'
);

-- Mayo 2026: Pedido Entregado
INSERT INTO orders (guest_name, guest_email, items_json, subtotal, total, status, created_at, payment_method)
VALUES (
  'Luis Mayo', 'luis.may@test.com', 
  '[{"product": {"id": 2, "name": "Taza Personalizada", "price": 25.00}, "quantity": 4}]', 
  100.00, 100.00, 'delivered', '2026-05-05 11:30:00', 'Plin'
);

-- Junio 2026: Pedido Eliminado Manualmente (Soft Delete)
INSERT INTO orders (guest_name, guest_email, items_json, subtotal, total, status, created_at, payment_method, deleted_at, deleted_by, deletion_reason)
VALUES (
  'Sofia Junio', 'sofia.jun@test.com', 
  '[{"product": {"id": 1, "name": "Vaso TÃ©rmico", "price": 45.00}, "quantity": 1}]', 
  45.00, 45.00, 'cancelled', '2026-06-15 13:00:00', 'Yape', '2026-06-16 10:00:00', 'admin:1', 'manual'
);

-- Julio 2026: Pedido Entregado
INSERT INTO orders (guest_name, guest_email, items_json, subtotal, total, status, created_at, payment_method)
VALUES (
  'Pedro Julio', 'pedro.jul@test.com', 
  '[{"product": {"id": 1, "name": "Vaso TÃ©rmico", "price": 45.00}, "quantity": 2}]', 
  90.00, 90.00, 'delivered', '2026-07-28 18:00:00', 'Transferencia'
);

-- Agosto 2026: Pedido Expirado (+30 dÃ­as simulation)
INSERT INTO orders (guest_name, guest_email, items_json, subtotal, total, status, created_at, payment_method, deleted_at, deleted_by, deletion_reason)
VALUES (
  'Lucia Agosto', 'lucia.ago@test.com', 
  '[{"product": {"id": 2, "name": "Taza Personalizada", "price": 25.00}, "quantity": 1}]', 
  25.00, 25.00, 'delivered', '2026-08-10 08:30:00', 'Yape', '2026-09-11 00:00:00', 'system:auto_expire', 'expired_30_days'
);

-- Septiembre 2026: Pedido Entregado
INSERT INTO orders (guest_name, guest_email, items_json, subtotal, total, status, created_at, payment_method)
VALUES (
  'Miguel Septiembre', 'miguel.sep@test.com', 
  '[{"product": {"id": 1, "name": "Vaso TÃ©rmico", "price": 45.00}, "quantity": 1}]', 
  45.00, 45.00, 'delivered', '2026-09-15 15:45:00', 'Plin'
);

-- Octubre 2026: Pedido Entregado
INSERT INTO orders (guest_name, guest_email, items_json, subtotal, total, status, created_at, payment_method)
VALUES (
  'Elena Octubre', 'elena.oct@test.com', 
  '[{"product": {"id": 2, "name": "Taza Personalizada", "price": 25.00}, "quantity": 10}]', 
  250.00, 250.00, 'delivered', '2026-10-31 20:00:00', 'Transferencia'
);

-- Noviembre 2026: Pedido Entregado con descuento
INSERT INTO orders (guest_name, guest_email, items_json, subtotal, discount, total, status, created_at, payment_method, discount_info)
VALUES (
  'Jorge Noviembre', 'jorge.nov@test.com', 
  '[{"product": {"id": 1, "name": "Vaso TÃ©rmico", "price": 45.00}, "quantity": 2}]', 
  90.00, 10.00, 80.00, 'delivered', '2026-11-20 12:00:00', 'Yape', '{"coupon": {"code": "NOV10", "amount": 10, "type": "fixed", "value": 10}}'
);

-- Diciembre 2026: Pedido Entregado
INSERT INTO orders (guest_name, guest_email, items_json, subtotal, total, status, created_at, payment_method)
VALUES (
  'Navidad Diciembre', 'navidad.dic@test.com', 
  '[{"product": {"id": 1, "name": "Vaso TÃ©rmico", "price": 45.00}, "quantity": 5}]', 
  225.00, 225.00, 'delivered', '2026-12-24 23:59:00', 'Plin'
);

-- End of file: 006_test_history_orders_2026.sql

-- Start of file: 007_cleanup_test_orders_2026.sql
-- Script para eliminar los pedidos de prueba generados para el aÃ±o 2026
-- Ejecutar en Supabase SQL Editor para limpiar los datos de prueba

DELETE FROM orders 
WHERE guest_email LIKE '%@test.com' 
  AND created_at >= '2026-01-01 00:00:00' 
  AND created_at <= '2026-12-31 23:59:59';

-- Esto eliminarÃ¡ todos los pedidos creados con los correos @test.com en el aÃ±o 2026

-- End of file: 007_cleanup_test_orders_2026.sql

-- Start of file: 008_enhance_coupons.sql
-- MigraciÃ³n para mejorar cupones y agregar soft delete
-- Agrega soporte para reglas avanzadas de cupones y borrado lÃ³gico en cupones y descuentos

-- 1. Mejoras en la tabla coupons
ALTER TABLE coupons 
ADD COLUMN IF NOT EXISTS applies_to TEXT DEFAULT 'cart_value', -- 'product', 'category', 'cart_value'
ADD COLUMN IF NOT EXISTS target_id INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS usage_limit_per_user INTEGER DEFAULT 0, -- 0 significa sin lÃ­mite
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS deleted_by TEXT;

-- 2. Soft delete en la tabla discounts
ALTER TABLE discounts
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS deleted_by TEXT;

-- Comentario: applies_to values
-- 'cart_value': Descuento al total del carrito (comportamiento actual)
-- 'product': Descuento solo a un producto especÃ­fico (target_id)
-- 'category': Descuento a todos los productos de una categorÃ­a (target_id)

-- End of file: 008_enhance_coupons.sql

-- Start of file: 009_audit_categories.sql
-- MigraciÃ³n para agregar auditorÃ­a y soft delete a categories
-- Fecha: 2026-01-08

ALTER TABLE categories
ADD COLUMN IF NOT EXISTS created_by INTEGER REFERENCES users(id),
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS deleted_by TEXT;

-- Actualizar categories existentes para tener un creador por defecto (Admin ID 1)
UPDATE categories SET created_by = 1 WHERE created_by IS NULL;

-- End of file: 009_audit_categories.sql

-- Start of file: 010_audit_products.sql
-- Add audit columns to products table
ALTER TABLE products
ADD COLUMN IF NOT EXISTS created_by BIGINT REFERENCES users(id),
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS deleted_by TEXT;

-- Index for faster filtering by deleted status
CREATE INDEX IF NOT EXISTS idx_products_deleted_at ON products(deleted_at);

-- End of file: 010_audit_products.sql

-- Start of file: 011_roles_and_permissions.sql
-- Migration: Sistema de Roles y Permisos
-- Roles: 'admin', 'worker', 'user'

-- Tabla de permisos para trabajadores
CREATE TABLE IF NOT EXISTS worker_permissions (
  id SERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  permission_key TEXT NOT NULL, -- 'dashboard', 'productos', 'categorias', 'pedidos', 'historial', 'descuentos', 'cupones'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  granted_by BIGINT REFERENCES users(id),
  UNIQUE(user_id, permission_key)
);

-- Index para bÃºsquedas rÃ¡pidas por usuario
CREATE INDEX IF NOT EXISTS idx_worker_permissions_user ON worker_permissions(user_id);

-- Comentario: Los valores de 'role' en la tabla 'users' deben ser: 'admin', 'worker', 'user'
-- Actualizar usuarios existentes si es necesario:
-- UPDATE users SET role = 'admin' WHERE role = 'administrador';
-- UPDATE users SET role = 'worker' WHERE role = 'trabajador';
-- UPDATE users SET role = 'user' WHERE role = 'usuario' OR role IS NULL;

-- End of file: 011_roles_and_permissions.sql

-- Start of file: 012_product_variants.sql
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
  price DECIMAL(10,2) NOT NULL,      -- Precio especÃ­fico de esta variante
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

-- End of file: 012_product_variants.sql

-- Start of file: 013_add_users_active.sql
-- Migration: Add active column to users table
-- This enables the ability to disable/enable user accounts in the admin panel

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true;

-- Set all existing users as active by default
UPDATE users SET active = true WHERE active IS NULL;

-- End of file: 013_add_users_active.sql

-- Start of file: 014_deletion_reason.sql
-- MigraciÃ³n para agregar razÃ³n de eliminaciÃ³n en cupones y descuentos
-- Permite distinguir entre eliminaciÃ³n manual por admin o expiraciÃ³n automÃ¡tica

-- 1. Agregar columna deletion_reason a coupons
ALTER TABLE coupons
ADD COLUMN IF NOT EXISTS deletion_reason TEXT;
-- Valores posibles: 'manual' (eliminado por admin), 'expired' (expirado automÃ¡ticamente)

-- 2. Agregar columna deletion_reason a discounts
ALTER TABLE discounts
ADD COLUMN IF NOT EXISTS deletion_reason TEXT;

-- Comentario: Cuando un cupÃ³n/descuento es eliminado:
-- - Si un admin lo elimina manualmente: deletion_reason = 'manual'
-- - Si el sistema lo expira automÃ¡ticamente: deletion_reason = 'expired', deleted_by = 'system'

-- End of file: 014_deletion_reason.sql

-- Start of file: 015_payment_method_contact.sql
-- Migration to add payment method and contact number columns to orders table
-- Also ensures orders have shipping_address for display

-- Add payment_method column (yape, plin, transferencia)
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS payment_method TEXT;

-- Add contact_number column for customer contact
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS contact_number TEXT;

-- Comment: When displaying orders in admin panel:
-- - payment_method: 'yape', 'plin', 'transferencia'
-- - contact_number: optional customer contact number (9+ digits)
-- - shipping_address: already exists, but ensure it's displayed in order details

-- End of file: 015_payment_method_contact.sql

-- Start of file: 016_fix_column_lengths.sql
-- Fix column length issues
-- The error "value too long for type character varying(10)" suggests a column has a length limit.
-- We suspect 'order_code' or 'payment_method' might be restricted in the live database.

-- 1. Ensure order_code is TEXT (or at least VARCHAR(20) to fit MAE2026xxxxxx)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'order_code') THEN
        ALTER TABLE orders ALTER COLUMN order_code TYPE TEXT;
    END IF;
END $$;

-- 2. Ensure payment_method is TEXT (to fit 'transferencia')
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'payment_method') THEN
        ALTER TABLE orders ALTER COLUMN payment_method TYPE TEXT;
    END IF;
END $$;

-- 3. Ensure other potential text columns are safe
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'contact_number') THEN
        ALTER TABLE orders ALTER COLUMN contact_number TYPE TEXT;
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'shipping_address') THEN
        ALTER TABLE orders ALTER COLUMN shipping_address TYPE TEXT;
    END IF;
END $$;

-- End of file: 016_fix_column_lengths.sql

