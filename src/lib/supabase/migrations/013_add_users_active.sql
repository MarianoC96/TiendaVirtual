-- Migration: Add active column to users table
-- This enables the ability to disable/enable user accounts in the admin panel

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true;

-- Set all existing users as active by default
UPDATE users SET active = true WHERE active IS NULL;
