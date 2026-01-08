-- Migración para mejorar cupones y agregar soft delete
-- Agrega soporte para reglas avanzadas de cupones y borrado lógico en cupones y descuentos

-- 1. Mejoras en la tabla coupons
ALTER TABLE coupons 
ADD COLUMN IF NOT EXISTS applies_to TEXT DEFAULT 'cart_value', -- 'product', 'category', 'cart_value'
ADD COLUMN IF NOT EXISTS target_id INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS usage_limit_per_user INTEGER DEFAULT 0, -- 0 significa sin límite
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS deleted_by TEXT;

-- 2. Soft delete en la tabla discounts
ALTER TABLE discounts
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS deleted_by TEXT;

-- Comentario: applies_to values
-- 'cart_value': Descuento al total del carrito (comportamiento actual)
-- 'product': Descuento solo a un producto específico (target_id)
-- 'category': Descuento a todos los productos de una categoría (target_id)
