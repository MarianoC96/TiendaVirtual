-- Migración para agregar auditoría y soft delete a categories
-- Fecha: 2026-01-08

ALTER TABLE categories
ADD COLUMN IF NOT EXISTS created_by INTEGER REFERENCES users(id),
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS deleted_by TEXT;

-- Actualizar categories existentes para tener un creador por defecto (Admin ID 1)
UPDATE categories SET created_by = 1 WHERE created_by IS NULL;
