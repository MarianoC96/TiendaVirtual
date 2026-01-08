-- Script para eliminar los pedidos de prueba generados para el año 2026
-- Ejecutar en Supabase SQL Editor para limpiar los datos de prueba

DELETE FROM orders 
WHERE guest_email LIKE '%@test.com' 
  AND created_at >= '2026-01-01 00:00:00' 
  AND created_at <= '2026-12-31 23:59:59';

-- Esto eliminará todos los pedidos creados con los correos @test.com en el año 2026
