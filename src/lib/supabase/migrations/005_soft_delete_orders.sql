-- Migración para implementar eliminación suave de pedidos
-- Ejecutar en Supabase SQL Editor

-- Agregar columnas para soft delete
ALTER TABLE orders ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS deleted_by TEXT; -- 'user_id:X' o 'system:expired'
ALTER TABLE orders ADD COLUMN IF NOT EXISTS deletion_reason TEXT; -- 'manual' o 'expired_30_days'

-- Índice para consultas eficientes de pedidos no eliminados
CREATE INDEX IF NOT EXISTS idx_orders_deleted_at ON orders (deleted_at);

-- Comentarios explicativos:
-- deleted_at: fecha/hora de eliminación, NULL si no está eliminado
-- deleted_by: quién eliminó el pedido (ej: "admin:1" o "system:auto_expire")
-- deletion_reason: razón de eliminación ("manual" o "expired_30_days")
