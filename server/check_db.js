const db = require('./db');
require('dotenv').config();

async function checkDatabase() {
    try {
        console.log("--- CONFIGURACIÓN DETECTADA ---");
        console.log("Host:", process.env.DB_HOST || 'localhost (default)');
        console.log("Usuario:", process.env.DB_USER || 'root (default)');
        console.log("Base de Datos:", process.env.DB_NAME || 'tienda_online (default)');
        console.log("--------------------------------\n");

        console.log("Conectando a la base de datos...");

        // Check latest 5 orders with user info
        const [orders] = await db.query(`
      SELECT o.id, o.total, o.payment_method, o.status, o.created_at, u.name as user_name 
      FROM orders o 
      LEFT JOIN users u ON o.user_id = u.id 
      ORDER BY o.created_at DESC 
      LIMIT 5
    `);

        console.log("\n--- ÚLTIMOS 5 PEDIDOS EN LA BD ---");
        if (orders.length === 0) {
            console.log("No se encontraron pedidos.");
        } else {
            console.table(orders.map(o => ({
                ID: o.id,
                Usuario: o.user_name || 'Invitado',
                Total: o.total,
                Pago: o.payment_method,
                Fecha: o.created_at
            })));
        }

        // Check users count
        const [users] = await db.query('SELECT count(*) as count FROM users');
        console.log(`\nTotal Usuarios: ${users[0].count}`);

        // Check products count
        const [products] = await db.query('SELECT count(*) as count FROM products');
        console.log(`Total Productos: ${products[0].count}`);

        process.exit(0);
    } catch (error) {
        console.error("Error accediendo a la BD:", error);
        process.exit(1);
    }
}

checkDatabase();
