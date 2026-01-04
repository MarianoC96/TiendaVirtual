const db = require('./db');

async function updateDb() {
    try {
        console.log('Updating database for soft delete support...');

        // Update Coupons Table
        try {
            await db.query(`ALTER TABLE coupons ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE`);
            console.log('Added is_deleted to coupons');
        } catch (e) {
            if (e.code !== 'ER_DUP_FIELDNAME') console.log('Error adding is_deleted to coupons:', e.message);
        }

        try {
            await db.query(`ALTER TABLE coupons ADD COLUMN created_by INT`);
            await db.query(`ALTER TABLE coupons ADD FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE Set NULL`);
            console.log('Added created_by to coupons');
        } catch (e) {
            if (e.code !== 'ER_DUP_FIELDNAME') console.log('Error adding created_by to coupons:', e.message);
        }

        // Update Discounts Table
        try {
            await db.query(`ALTER TABLE discounts ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE`);
            console.log('Added is_deleted to discounts');
        } catch (e) {
            if (e.code !== 'ER_DUP_FIELDNAME') console.log('Error adding is_deleted to discounts:', e.message);
        }

        try {
            await db.query(`ALTER TABLE discounts ADD COLUMN created_by INT`);
            await db.query(`ALTER TABLE discounts ADD FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE Set NULL`);
            console.log('Added created_by to discounts');
        } catch (e) {
            if (e.code !== 'ER_DUP_FIELDNAME') console.log('Error adding created_by to discounts:', e.message);
        }

        console.log('Database update complete.');
        process.exit(0);
    } catch (error) {
        console.error('Error updating DB:', error);
        process.exit(1);
    }
}

updateDb();
