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
  'María García',
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

-- Pedido 2: Pedido atrasado (hace 3 días) - Debería mostrarse en rojo
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
  'Carlos López',
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
