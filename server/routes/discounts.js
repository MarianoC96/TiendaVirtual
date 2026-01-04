const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireAuth } = require('../middleware/authMiddleware');

router.get('/', async (req, res) => {
    try {
        const [discounts] = await db.query(`
            SELECT d.*, p.name as product_name 
            FROM discounts d 
            LEFT JOIN products p ON d.product_id = p.id
            WHERE d.is_deleted = FALSE
        `);
        res.json(discounts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/', requireAuth, async (req, res) => {
    const { name, product_id, percentage, start_date, end_date } = req.body;
    const created_by = req.user.id;

    try {
        const [result] = await db.query(
            'INSERT INTO discounts (name, product_id, percentage, start_date, end_date, created_by, is_deleted) VALUES (?, ?, ?, ?, ?, ?, FALSE)',
            [name, product_id, percentage, start_date, end_date, created_by]
        );
        res.status(201).json({ id: result.insertId, ...req.body });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Soft Delete
router.delete('/:id', requireAuth, async (req, res) => {
    try {
        await db.query('UPDATE discounts SET is_deleted = TRUE, is_active = FALSE WHERE id = ?', [req.params.id]);
        res.json({ message: 'Descuento eliminado visualmente' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.put('/:id', requireAuth, async (req, res) => {
    const { name, product_id, percentage, start_date, end_date, is_active } = req.body;
    try {
        await db.query(
            'UPDATE discounts SET name=?, product_id=?, percentage=?, start_date=?, end_date=?, is_active=? WHERE id=?',
            [name, product_id, percentage, start_date, end_date, is_active, req.params.id]
        );
        res.json({ message: 'Descuento actualizado correctamente' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
