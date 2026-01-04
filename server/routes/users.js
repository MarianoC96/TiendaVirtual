const express = require('express');
const router = express.Router();
const db = require('../db');

// Obtener todos los usuarios (Admin)
router.get('/', async (req, res) => {
    try {
        const [users] = await db.query('SELECT id, name, email, role, status, avatar, last_login, created_at FROM users');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Actualizar rol de usuario
router.patch('/:id/role', async (req, res) => {
    const { role } = req.body;
    try {
        await db.query('UPDATE users SET role = ? WHERE id = ?', [role, req.params.id]);
        res.json({ message: 'Rol actualizado correctamente' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Actualizar estado de usuario
router.patch('/:id/status', async (req, res) => {
    const { status } = req.body;
    try {
        await db.query('UPDATE users SET status = ? WHERE id = ?', [status, req.params.id]);
        res.json({ message: 'Estado actualizado correctamente' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Actualizar perfil de usuario
router.put('/:id', async (req, res) => {
    const { name, email, phone, address, avatar } = req.body;
    try {
        await db.query(
            'UPDATE users SET name=?, email=?, phone=?, address=?, avatar=? WHERE id=?',
            [name, email, phone, address, avatar, req.params.id]
        );
        res.json({ message: 'Usuario actualizado correctamente' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
