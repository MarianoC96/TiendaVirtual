const express = require('express');
const router = express.Router();
const db = require('../db');

// Obtener todas las categorías
router.get('/', async (req, res) => {
    try {
        const [categories] = await db.query('SELECT * FROM categories');
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Crear categoría
router.post('/', async (req, res) => {
    const { name, slug, icon, description } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO categories (name, slug, icon, description) VALUES (?, ?, ?, ?)',
            [name, slug, icon, description]
        );
        res.status(201).json({ id: result.insertId, ...req.body });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Actualizar categoría
router.put('/:id', async (req, res) => {
    const { name, slug, icon, description } = req.body;
    try {
        await db.query(
            'UPDATE categories SET name=?, slug=?, icon=?, description=? WHERE id=?',
            [name, slug, icon, description, req.params.id]
        );
        res.json({ message: 'Categoría actualizada' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Eliminar categoría
router.delete('/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM categories WHERE id = ?', [req.params.id]);
        res.json({ message: 'Categoría eliminada' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
