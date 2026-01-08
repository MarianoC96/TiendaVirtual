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

-- Index para búsquedas rápidas por usuario
CREATE INDEX IF NOT EXISTS idx_worker_permissions_user ON worker_permissions(user_id);

-- Comentario: Los valores de 'role' en la tabla 'users' deben ser: 'admin', 'worker', 'user'
-- Actualizar usuarios existentes si es necesario:
-- UPDATE users SET role = 'admin' WHERE role = 'administrador';
-- UPDATE users SET role = 'worker' WHERE role = 'trabajador';
-- UPDATE users SET role = 'user' WHERE role = 'usuario' OR role IS NULL;
