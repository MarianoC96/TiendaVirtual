const express = require('express');
const router = express.Router();
const db = require('../db');

// Obtener estadísticas del dashboard
router.get('/', async (req, res) => {
    try {
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 19).replace('T', ' ');

        // 1. Ingresos Totales del Mes
        const [revenueResult] = await db.query(
            `SELECT SUM(total) as total FROM orders WHERE created_at >= ? AND status != 'cancelled'`,
            [firstDayOfMonth]
        );
        const totalRevenueMonth = revenueResult[0].total || 0;

        // 1.5 Ingresos Totales Historicos
        const [lifetimeRevenueResult] = await db.query(
            `SELECT SUM(total) as total FROM orders WHERE status != 'cancelled'`
        );
        const totalRevenueLifetime = lifetimeRevenueResult[0].total || 0;

        // 2. Pedidos del Mes
        const [ordersResult] = await db.query(
            `SELECT COUNT(*) as count FROM orders WHERE created_at >= ?`,
            [firstDayOfMonth]
        );
        const totalOrdersMonth = ordersResult[0].count || 0;

        // 3. Clientes Nuevos del Mes
        const [customersResult] = await db.query(
            `SELECT COUNT(*) as count FROM users WHERE role = 'user' AND created_at >= ?`,
            [firstDayOfMonth]
        );
        const newCustomersMonth = customersResult[0].count || 0;

        // 4. Stock Crítico (Productos con stock <= 5)
        const LOW_STOCK_THRESHOLD = 5;
        const [lowStockResult] = await db.query(
            `SELECT COUNT(*) as count FROM products WHERE stock <= ?`,
            [LOW_STOCK_THRESHOLD]
        );
        const lowStockCount = lowStockResult[0].count || 0;

        // 5. Alertas de Inventario (Lista detallada)
        const [inventoryAlerts] = await db.query(
            `SELECT id, name, stock as currentStock FROM products WHERE stock <= ? ORDER BY stock ASC LIMIT 5`,
            [LOW_STOCK_THRESHOLD]
        );

        // 5.5 Pedidos Pendientes (Anteriores a hoy)
        // Comparamos solo fechas: Si la fecha del pedido es menor a la fecha de hoy, cuenta como atrasado.
        const [overdueResult] = await db.query(
            `SELECT COUNT(*) as count FROM orders WHERE (status = 'pending' OR status = 'processing') AND DATE(created_at) < CURDATE()`
        );

        // 5. Alertas de Inventario (Lista detallada)ivos
        const [activeDiscounts] = await db.query(
            `SELECT d.id, d.name, d.percentage as discountPercentage, d.end_date as endDate, p.name as productName, 
            (SELECT COUNT(*) FROM order_items oi WHERE oi.product_id = d.product_id) as usageCount
            FROM discounts d
            JOIN products p ON d.product_id = p.id
            WHERE d.start_date <= NOW() AND d.end_date >= NOW() AND d.is_active = TRUE`
        );

        // 6. Cupones Activos
        const [activeCoupons] = await db.query(
            `SELECT id, code, discount_type, discount_value, expiration_date as expirationDate, usage_limit, usage_count as times_used
             FROM coupons 
             WHERE start_date <= NOW() AND expiration_date >= NOW() AND is_active = TRUE`
        );

        res.json({
            stats: {
                totalRevenue: { month: totalRevenueMonth, lifetime: totalRevenueLifetime },
                totalOrders: { month: totalOrdersMonth },
                totalCustomers: { new: newCustomersMonth },
                lowStockProducts: lowStockCount,
                overduePendingOrders: overdueResult[0].count || 0,
            },
            inventoryAlerts: inventoryAlerts.map(i => ({
                id: i.id,
                name: i.name,
                currentStock: i.currentStock,
                status: 'critical' // Asignamos 'critical' por defecto si es bajo stock
            })),
            discounts: activeDiscounts,
            coupons: activeCoupons
        });

    } catch (err) {
        console.error('Error al obtener datos del dashboard:', err);
        res.status(500).json({ message: 'Error al obtener datos del dashboard' });
    }
});

module.exports = router;
