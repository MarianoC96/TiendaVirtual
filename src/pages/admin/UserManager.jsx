import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Button, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, IconButton, Chip, Avatar, TextField,
    CircularProgress, Alert, Tabs, Tab
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit'; // Kept for consistency if needed later
import PersonIcon from '@mui/icons-material/Person';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const UserManager = () => {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [tabValue, setTabValue] = useState(0); // 0: Users, 1: Admins
    const { getToken, user: currentUser } = useAuth();

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const token = getToken();
            const response = await axios.get('http://localhost:3001/api/users', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(response.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching users:', err);
            setError('Error al cargar usuarios');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const toggleRole = async (id, currentRole) => {
        try {
            const newRole = currentRole === 'admin' ? 'user' : 'admin';
            const token = getToken();
            await axios.patch(`http://localhost:3001/api/users/${id}/role`,
                { role: newRole },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setUsers(users.map(user =>
                user.id === id ? { ...user, role: newRole } : user
            ));
        } catch (err) {
            console.error('Error updating role:', err);
            setError('Error al actualizar el rol');
        }
    };

    const toggleStatus = async (id, currentStatus) => {
        try {
            const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
            const token = getToken();
            await axios.patch(`http://localhost:3001/api/users/${id}/status`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setUsers(users.map(user =>
                user.id === id ? { ...user, status: newStatus } : user
            ));
        } catch (err) {
            console.error('Error updating status:', err);
            setError('Error al actualizar el estado');
        }
    };

    // Filter by search term
    const searchedUsers = users.filter(user =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Filter by role based on active tab
    const displayedUsers = searchedUsers.filter(user => {
        if (tabValue === 0) return user.role === 'user';   // Tab 0: Usuarios
        if (tabValue === 1) return user.role === 'admin';  // Tab 1: Administradores
        return true;
    });

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    if (loading) return (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
        </Box>
    );

    if (error) return <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>;

    return (
        <Box>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>Gestión de Personal y Usuarios</Typography>
                <Typography variant="body1" color="text.secondary">
                    Administra los accesos y roles de la plataforma.
                </Typography>
            </Box>

            {/* Search Bar */}
            <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Buscar por nombre o email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    size="small"
                    InputProps={{
                        startAdornment: (
                            <Box sx={{ mr: 1, color: 'text.secondary', display: 'flex' }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M15.5 14H14.71L14.43 13.73C15.41 12.59 16 11.11 16 9.5C16 5.91 13.09 3 9.5 3C5.91 3 3 5.91 3 9.5C3 13.09 5.91 16 9.5 16C11.11 16 12.59 15.41 13.73 14.43L14 14.71V15.5L19 20.49L20.49 19L15.5 14ZM9.5 14C7.01 14 5 11.99 5 9.5C5 7.01 7.01 5 9.5 5C11.99 5 14 7.01 14 9.5C14 11.99 11.99 14 9.5 14Z" fill="currentColor" />
                                </svg>
                            </Box>
                        )
                    }}
                />
            </Paper>

            {/* Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={tabValue} onChange={handleTabChange} aria-label="user role tabs">
                    <Tab
                        icon={<PersonIcon />}
                        iconPosition="start"
                        label={`Usuarios (${users.filter(u => u.role === 'user').length})`}
                    />
                    <Tab
                        icon={<AdminPanelSettingsIcon />}
                        iconPosition="start"
                        label={`Administradores (${users.filter(u => u.role === 'admin').length})`}
                    />
                </Tabs>
            </Box>

            {/* User Table */}
            <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 2 }}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                            <TableCell sx={{ fontWeight: 'bold' }}>Usuario</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Rol</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Estado</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Último Acceso</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 'bold' }}>Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {displayedUsers.length > 0 ? (
                            displayedUsers.map((user) => (
                                <TableRow key={user.id} hover>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Avatar
                                                src={user.avatar}
                                                alt={user.name}
                                                sx={{
                                                    bgcolor: user.role === 'admin' ? 'secondary.main' : 'primary.main',
                                                    width: 40,
                                                    height: 40
                                                }}
                                            >
                                                {user.name?.charAt(0).toUpperCase()}
                                            </Avatar>
                                            <Box>
                                                <Typography variant="subtitle2" fontWeight="bold">{user.name}</Typography>
                                                <Typography variant="caption" color="text.secondary">ID: {user.id}</Typography>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={user.role === 'admin' ? 'ADMINISTRADOR' : 'USUARIO'}
                                            color={user.role === 'admin' ? 'secondary' : 'default'}
                                            variant={user.role === 'admin' ? 'filled' : 'outlined'}
                                            size="small"
                                            sx={{ fontWeight: 'bold', borderRadius: 1 }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={user.status === 'active' ? 'ACTIVO' : 'INACTIVO'}
                                            color={user.status === 'active' ? 'success' : 'error'}
                                            size="small"
                                            variant="filled"
                                            sx={{ fontWeight: 'bold', minWidth: 80 }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" color="text.secondary">
                                            {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Nunca'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="right">
                                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                                            <Button
                                                size="small"
                                                variant={user.role === 'admin' ? "outlined" : "contained"}
                                                color="primary"
                                                onClick={() => toggleRole(user.id, user.role)}
                                                disabled={user.id === currentUser?.id}
                                                sx={{ textTransform: 'none', px: 2 }}
                                            >
                                                {user.role === 'admin' ? 'Quitar Admin' : 'Hacer Admin'}
                                            </Button>
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                color={user.status === 'active' ? 'error' : 'success'}
                                                onClick={() => toggleStatus(user.id, user.status)}
                                                sx={{ textTransform: 'none' }}
                                            >
                                                {user.status === 'active' ? 'Desactivar' : 'Activar'}
                                            </Button>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                                    <Typography variant="body1" color="text.secondary">
                                        No se encontraron resultados en esta categoría.
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default UserManager;
