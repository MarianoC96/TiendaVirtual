const express = require('express');
const router = express.Router();
const db = require('../db');

// Registro de usuario
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    try {
        // Verificar si existe el email
        const [existingUsers] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            return res.status(400).json({ message: 'El correo electrónico ya está registrado' });
        }

        // Insertar usuario (en producción la contraseña debe ser hasheada)
        const [result] = await db.query(
            'INSERT INTO users (name, email, password, role, avatar) VALUES (?, ?, ?, ?, ?)',
            [name, email, password, 'user', `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`]
        );

        const newUser = {
            id: result.insertId,
            name,
            email,
            role: 'user'
        };

        res.status(201).json({
            message: 'Usuario registrado exitosamente',
            user: newUser
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
});

// Login de usuario
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const [users] = await db.query('SELECT * FROM users WHERE email = ? AND password = ?', [email, password]);

        if (users.length === 0) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        const user = users[0];

        // Actualizar último login
        await db.query('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);

        // En producción aquí se generaría un JWT
        const token = Buffer.from(JSON.stringify({ userId: user.id, timestamp: Date.now() })).toString('base64');

        res.json({
            message: 'Login exitoso',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar
            },
            token
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
});

// Validar sesión
router.get('/me', async (req, res) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        // En producción validaríamos la firma del JWT
        // Aquí decodificamos el base64 simple
        const decodedStr = Buffer.from(token, 'base64').toString('utf-8');
        const decoded = JSON.parse(decodedStr);

        const [users] = await db.query('SELECT * FROM users WHERE id = ?', [decoded.userId]);

        if (users.length === 0) {
            return res.status(401).json({ message: 'Usuario no encontrado' });
        }

        const user = users[0];
        res.json({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar
        });
    } catch (error) {
        console.error('Token validation error:', error);
        res.status(401).json({ message: 'Token inválido' });
    }
});

module.exports = router;
