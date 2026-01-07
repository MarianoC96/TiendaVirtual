-- Script para insertar descuentos de ejemplo
-- Ejecutar en Supabase SQL Editor

-- 1. Descuento por Categoría (20% en toda la categoría de Tazas - asumiendo category_id = 1)
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
  'Promoción Tazas Enero',
  'percentage',
  20,
  'category',
  1, -- ID de la categoría (ajustar según tu base de datos)
  '2026-01-01',
  '2026-01-31',
  true,
  1
);

-- 2. Descuento por Producto (S/10 de descuento en producto específico - asumiendo product_id = 1)
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
  1, -- ID del producto (ajustar según tu base de datos)
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
  '¡Descuento por compra grande!',
  'percentage',
  15,
  'cart_value',
  100, -- Valor mínimo del carrito: S/100
  '2026-01-01',
  '2026-12-31',
  true,
  1
);
