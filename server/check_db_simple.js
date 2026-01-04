const db = require('./db');

async function checkDatabase() {
    try {
        const [orders] = await db.query(`
      SELECT id, total, payment_method, created_at 
      FROM orders 
      ORDER BY created_at DESC 
      LIMIT 3
    `);

        console.log("Últimos pedidos:", JSON.stringify(orders, null, 2));
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

checkDatabase();
