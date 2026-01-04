const db = require('./db');

async function initCoupons() {
    try {
        console.log('Initializing Coupons tables...');

        // 1. Create coupons table
        const createCouponsTable = `
      CREATE TABLE IF NOT EXISTS coupons (
        id INT AUTO_INCREMENT PRIMARY KEY,
        code VARCHAR(10) UNIQUE NOT NULL,
        name VARCHAR(100) NOT NULL,
        discount_type ENUM('percentage', 'fixed') NOT NULL,
        discount_value DECIMAL(10, 2) NOT NULL,
        target_type ENUM('category', 'product') NOT NULL,
        target_id INT NOT NULL,
        start_date DATETIME NOT NULL,
        expiration_date DATETIME NOT NULL,
        usage_limit INT NOT NULL DEFAULT 0, -- 0 means unlimited? Or user meant specific quantity. Let's assume mandatory input.
        usage_limit_per_user INT NOT NULL DEFAULT 1,
        usage_count INT DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
        await db.query(createCouponsTable);
        console.log('Checked/Created coupons table.');

        // 2. Alter orders table to include coupon info if not exists
        // We check if column exists first to avoid error, or just try ADD COLUMN and catch error.
        try {
            await db.query(`ALTER TABLE orders ADD COLUMN coupon_code VARCHAR(10)`);
            console.log('Added coupon_code to orders.');
        } catch (e) {
            if (e.code !== 'ER_DUP_FIELDNAME') console.log('coupon_code column might already exist or error:', e.message);
        }

        try {
            await db.query(`ALTER TABLE orders ADD COLUMN coupon_discount_amount DECIMAL(10,2) DEFAULT 0.00`);
            console.log('Added coupon_discount_amount to orders.');
        } catch (e) {
            if (e.code !== 'ER_DUP_FIELDNAME') console.log('coupon_discount_amount column might already exist or error:', e.message);
        }

        console.log('Coupons initialization complete.');
        process.exit(0);
    } catch (error) {
        console.error('Error initializing coupons:', error);
        process.exit(1);
    }
}

initCoupons();
