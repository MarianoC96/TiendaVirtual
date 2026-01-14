-- Migration to add payment method and contact number columns to orders table
-- Also ensures orders have shipping_address for display

-- Add payment_method column (yape, plin, transferencia)
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS payment_method TEXT;

-- Add contact_number column for customer contact
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS contact_number TEXT;

-- Comment: When displaying orders in admin panel:
-- - payment_method: 'yape', 'plin', 'transferencia'
-- - contact_number: optional customer contact number (9+ digits)
-- - shipping_address: already exists, but ensure it's displayed in order details
