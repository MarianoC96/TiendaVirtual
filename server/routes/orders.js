const express = require('express');
const router = express.Router();
const db = require('../db');

// Obtener órdenes de un usuario
router.get('/user/:userId', async (req, res) => {
    try {
        const [orders] = await db.query('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC', [req.params.userId]);

        // Para cada orden, obtener items
        for (let order of orders) {
            const [items] = await db.query(`
                SELECT oi.*, p.name as productName, p.image_url 
                FROM order_items oi 
                LEFT JOIN products p ON oi.product_id = p.id 
                WHERE oi.order_id = ?
            `, [order.id]);
            order.items = items;
        }

        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Obtener todas las órdenes (Admin) con filtros
router.get('/', async (req, res) => {
    try {
        const { month, year } = req.query;
        let query = `
            SELECT o.*, u.name as user_name, u.email as user_email 
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.id
        `;
        let params = [];
        let conditions = [];

        if (month && year) {
            conditions.push('MONTH(o.created_at) = ? AND YEAR(o.created_at) = ?');
            params.push(month, year);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' ORDER BY o.id ASC';

        const [orders] = await db.query(query, params);

        // Populate items for each order (optional but good for detailed export)
        for (let order of orders) {
            const [items] = await db.query(`
                SELECT oi.*, p.name as productName 
                FROM order_items oi 
                LEFT JOIN products p ON oi.product_id = p.id 
                WHERE oi.order_id = ?
            `, [order.id]);
            order.items = items;
        }

        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Actualizar estado de orden
router.patch('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        // Map user friendly status to DB ENUM if needed, but assuming frontend sends correct ENUM values:
        // 'pending', 'processing', 'shipped', 'delivered', 'cancelled'

        // Simple validation
        const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Estado inválido' });
        }

        await db.query('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id]);
        res.json({ message: 'Estado actualizado correctamente' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Crear orden
router.post('/', async (req, res) => {
    const { userId, items, total, shippingAddress, paymentMethod, couponCode, couponDiscount } = req.body;

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Validar y descontar stock para cada producto
        for (let item of items) {
            // Check current stock locking the row
            const [rows] = await connection.query('SELECT stock, name FROM products WHERE id = ? FOR UPDATE', [item.id]);

            if (rows.length === 0) {
                throw new Error(`Producto con ID ${item.id} no encontrado`);
            }

            const product = rows[0];

            if (product.stock < item.quantity) {
                throw new Error(`Stock insuficiente para el producto "${product.name}". Disponible: ${product.stock}, Solicitado: ${item.quantity}`);
            }

            // Deduct stock
            await connection.query('UPDATE products SET stock = stock - ? WHERE id = ?', [item.quantity, item.id]);
        }

        // 2. Crear la orden
        // Ensure to save coupon data
        const [orderResult] = await connection.query(
            'INSERT INTO orders (user_id, total, status, shipping_address, payment_method, coupon_code, coupon_discount_amount) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [
                userId,
                total,
                'pending',
                shippingAddress,
                paymentMethod,
                couponCode || null,
                couponDiscount || 0
            ]
        );

        const orderId = orderResult.insertId;

        // 3. Insertar items de la orden
        for (let item of items) {
            await connection.query(
                'INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES (?, ?, ?, ?)',
                [orderId, item.id, item.quantity, item.price]
            );
        }

        // 4. Update Coupon Usage Count if applicable
        if (couponCode) {
            await connection.query('UPDATE coupons SET usage_count = usage_count + 1 WHERE code = ?', [couponCode]);
        }

        await connection.commit();
        res.status(201).json({ message: 'Orden creada exitosamente', orderId });
    } catch (error) {
        await connection.rollback();
        console.error("Error al crear la orden:", error.message);
        res.status(400).json({ message: error.message });
    } finally {
        connection.release();
    }
});

module.exports = router;
