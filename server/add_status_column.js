const db = require('./db');

async function migrate() {
    try {
        console.log('Adding status column to users table...');
        await db.query("ALTER TABLE users ADD COLUMN status ENUM('active', 'inactive') DEFAULT 'active'");
        console.log('Migration successful!');
        process.exit(0);
    } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
            console.log('Column already exists.');
        } else {
            console.error('Migration failed:', error);
        }
        process.exit(1);
    }
}

migrate();
