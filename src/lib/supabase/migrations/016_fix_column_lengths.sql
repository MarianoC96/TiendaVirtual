-- Fix column length issues
-- The error "value too long for type character varying(10)" suggests a column has a length limit.
-- We suspect 'order_code' or 'payment_method' might be restricted in the live database.

-- 1. Ensure order_code is TEXT (or at least VARCHAR(20) to fit MAE2026xxxxxx)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'order_code') THEN
        ALTER TABLE orders ALTER COLUMN order_code TYPE TEXT;
    END IF;
END $$;

-- 2. Ensure payment_method is TEXT (to fit 'transferencia')
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'payment_method') THEN
        ALTER TABLE orders ALTER COLUMN payment_method TYPE TEXT;
    END IF;
END $$;

-- 3. Ensure other potential text columns are safe
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'contact_number') THEN
        ALTER TABLE orders ALTER COLUMN contact_number TYPE TEXT;
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'shipping_address') THEN
        ALTER TABLE orders ALTER COLUMN shipping_address TYPE TEXT;
    END IF;
END $$;
