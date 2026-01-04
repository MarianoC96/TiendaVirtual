const db = require('./db');

async function validate() {
    try {
        console.log('Checking users table...');
        const [rows] = await db.query('DESCRIBE users');
        console.log('Users table schema:', rows.map(r => r.Field).join(', '));
        
        console.log('Checking database content...');
        const [users] = await db.query('SELECT * FROM users');
        console.log('Users count:', users.length);
        
        process.exit(0);
    } catch (error) {
        console.error('Validation failed:', error.message);
        process.exit(1);
    }
}

validate();
