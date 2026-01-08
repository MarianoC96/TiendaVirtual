-- Script para generar pedidos de prueba para historial 2026
-- Ejecutar en Supabase SQL Editor

-- Enero 2026: Pedido Entregado
INSERT INTO orders (guest_name, guest_email, items_json, subtotal, total, status, created_at, payment_method)
VALUES (
  'Juan Enero', 'juan.enero@test.com', 
  '[{"product": {"id": 1, "name": "Vaso Térmico", "price": 45.00}, "quantity": 1}]', 
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
  '[{"product": {"id": 1, "name": "Vaso Térmico", "price": 45.00}, "quantity": 3}]', 
  135.00, 135.00, 'delivered', '2026-03-20 09:15:00', 'Transferencia'
);

-- Abril 2026: Pedido Cancelado
INSERT INTO orders (guest_name, guest_email, items_json, subtotal, total, status, created_at, payment_method)
VALUES (
  'Ana Abril', 'ana.abr@test.com', 
  '[{"product": {"id": 1, "name": "Vaso Térmico", "price": 45.00}, "quantity": 1}]', 
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
  '[{"product": {"id": 1, "name": "Vaso Térmico", "price": 45.00}, "quantity": 1}]', 
  45.00, 45.00, 'cancelled', '2026-06-15 13:00:00', 'Yape', '2026-06-16 10:00:00', 'admin:1', 'manual'
);

-- Julio 2026: Pedido Entregado
INSERT INTO orders (guest_name, guest_email, items_json, subtotal, total, status, created_at, payment_method)
VALUES (
  'Pedro Julio', 'pedro.jul@test.com', 
  '[{"product": {"id": 1, "name": "Vaso Térmico", "price": 45.00}, "quantity": 2}]', 
  90.00, 90.00, 'delivered', '2026-07-28 18:00:00', 'Transferencia'
);

-- Agosto 2026: Pedido Expirado (+30 días simulation)
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
  '[{"product": {"id": 1, "name": "Vaso Térmico", "price": 45.00}, "quantity": 1}]', 
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
  '[{"product": {"id": 1, "name": "Vaso Térmico", "price": 45.00}, "quantity": 2}]', 
  90.00, 10.00, 80.00, 'delivered', '2026-11-20 12:00:00', 'Yape', '{"coupon": {"code": "NOV10", "amount": 10, "type": "fixed", "value": 10}}'
);

-- Diciembre 2026: Pedido Entregado
INSERT INTO orders (guest_name, guest_email, items_json, subtotal, total, status, created_at, payment_method)
VALUES (
  'Navidad Diciembre', 'navidad.dic@test.com', 
  '[{"product": {"id": 1, "name": "Vaso Térmico", "price": 45.00}, "quantity": 5}]', 
  225.00, 225.00, 'delivered', '2026-12-24 23:59:00', 'Plin'
);
