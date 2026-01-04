const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken, requireAuth } = require('../middleware/authMiddleware');

// Generate distinct alphanumeric code
const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
    let result = '';
    for (let i = 0; i < 10; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

// GET all coupons (only non-deleted)
router.get('/', async (req, res) => {
    try {
        const [coupons] = await db.query('SELECT * FROM coupons WHERE is_deleted = FALSE ORDER BY created_at DESC');
        res.json(coupons);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST check/verify coupon
router.post('/verify', async (req, res) => {
    const { code, cartItems, userId } = req.body;

    if (!userId) {
        return res.status(401).json({ message: 'Debes iniciar sesión para usar un cupón.' });
    }

    if (!code) return res.status(400).json({ message: 'Código es requerido' });

    try {
        const [rows] = await db.query('SELECT * FROM coupons WHERE code = ? AND is_active = TRUE AND is_deleted = FALSE', [code]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Cupón no válido o no encontrado' });
        }
        const coupon = rows[0];
        const now = new Date();

        if (new Date(coupon.expiration_date) < now) {
            return res.status(400).json({ message: 'El cupón ha expirado' });
        }

        if (new Date(coupon.start_date) > now) {
            return res.status(400).json({ message: 'El cupón aún no está activo' });
        }

        // Global Limit Check
        if (coupon.usage_limit > 0 && coupon.usage_count >= coupon.usage_limit) {
            return res.status(400).json({ message: 'El cupón ha alcanzado su límite de usos global' });
        }

        // Per User Limit Check
        if (coupon.usage_limit_per_user > 0) {
            const [userUsage] = await db.query('SELECT COUNT(*) as count FROM orders WHERE user_id = ? AND coupon_code = ?', [userId, code]);
            if (userUsage[0].count >= coupon.usage_limit_per_user) {
                return res.status(400).json({ message: 'Has alcanzado el límite de usos para este cupón' });
            }
        }

        // Verify Applicability to Cart
        let applicableItems = [];
        let discountAmount = 0;
        let applicableTotal = 0;

        cartItems.forEach(item => {
            let isApplicable = false;

            // Ensure types match for comparison
            if (coupon.target_type === 'category') {
                if (item.category_id && parseInt(item.category_id) === parseInt(coupon.target_id)) isApplicable = true;
            } else if (coupon.target_type === 'product') {
                if (item.id && parseInt(item.id) === parseInt(coupon.target_id)) isApplicable = true;
            }

            if (isApplicable) {
                applicableItems.push(item);
                applicableTotal += item.price * item.quantity;
            }
        });

        if (applicableItems.length === 0) {
            let msg = coupon.target_type === 'category'
                ? 'Este cupón solo aplica a productos de una categoría específica y no tienes ninguno en tu carrito.'
                : 'Este cupón solo aplica a un producto específico y no está en tu carrito.';
            return res.status(400).json({ message: msg });
        }

        // Calculate Discount
        if (coupon.discount_type === 'percentage') {
            discountAmount = applicableTotal * (coupon.discount_value / 100);
        } else {
            discountAmount = parseFloat(coupon.discount_value);
            if (discountAmount > applicableTotal) discountAmount = applicableTotal;
        }

        res.json({
            valid: true,
            coupon_id: coupon.id,
            name: coupon.name,
            code: coupon.code,
            type: coupon.discount_type,
            discount_amount: parseFloat(discountAmount.toFixed(2)),
            message: 'Cupón aplicado correctamente',
            affected_items: applicableItems.map(i => i.name)
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST Create Coupon
router.post('/', requireAuth, async (req, res) => {
    const {
        name, discount_type, discount_value, target_type, target_id,
        start_date, expiration_date, usage_limit, usage_limit_per_user
    } = req.body;

    const created_by = req.user.id;

    let code = generateCode();

    try {
        const [result] = await db.query(
            `INSERT INTO coupons 
            (code, name, discount_type, discount_value, target_type, target_id, start_date, expiration_date, usage_limit, usage_limit_per_user, created_by, is_deleted) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, FALSE)`,
            [code, name, discount_type, discount_value, target_type, target_id, start_date, expiration_date, usage_limit, usage_limit_per_user, created_by]
        );
        res.status(201).json({ id: result.insertId, code, ...req.body });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

// DELETE Coupon (Soft Delete)
router.delete('/:id', requireAuth, async (req, res) => {
    try {
        await db.query('UPDATE coupons SET is_deleted = TRUE, is_active = FALSE WHERE id = ?', [req.params.id]);
        res.json({ message: 'Cupón eliminado visualmente' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// UPDATE Coupon
router.put('/:id', requireAuth, async (req, res) => {
    const { name, discount_type, discount_value, target_type, target_id, start_date, expiration_date, usage_limit, usage_limit_per_user, is_active } = req.body;
    try {
        let updateQuery = `UPDATE coupons SET 
            name=?, discount_type=?, discount_value=?, target_type=?, target_id=?, 
            start_date=?, expiration_date=?, usage_limit=?, usage_limit_per_user=? 
            WHERE id=?`;
        let params = [name, discount_type, discount_value, target_type, target_id, start_date, expiration_date, usage_limit, usage_limit_per_user, req.params.id];

        if (is_active !== undefined) {
            updateQuery = `UPDATE coupons SET 
            name=?, discount_type=?, discount_value=?, target_type=?, target_id=?, 
            start_date=?, expiration_date=?, usage_limit=?, usage_limit_per_user=?, is_active=? 
            WHERE id=?`;
            params = [name, discount_type, discount_value, target_type, target_id, start_date, expiration_date, usage_limit, usage_limit_per_user, is_active, req.params.id];
        }

        await db.query(updateQuery, params);
        res.json({ message: 'Cupón actualizado' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
