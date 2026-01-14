-- Migración para agregar razón de eliminación en cupones y descuentos
-- Permite distinguir entre eliminación manual por admin o expiración automática

-- 1. Agregar columna deletion_reason a coupons
ALTER TABLE coupons
ADD COLUMN IF NOT EXISTS deletion_reason TEXT;
-- Valores posibles: 'manual' (eliminado por admin), 'expired' (expirado automáticamente)

-- 2. Agregar columna deletion_reason a discounts
ALTER TABLE discounts
ADD COLUMN IF NOT EXISTS deletion_reason TEXT;

-- Comentario: Cuando un cupón/descuento es eliminado:
-- - Si un admin lo elimina manualmente: deletion_reason = 'manual'
-- - Si el sistema lo expira automáticamente: deletion_reason = 'expired', deleted_by = 'system'
