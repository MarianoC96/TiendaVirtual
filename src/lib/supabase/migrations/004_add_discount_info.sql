-- Migración para agregar campo discount_info a la tabla orders
-- Este campo almacena información sobre los descuentos aplicados al pedido
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
