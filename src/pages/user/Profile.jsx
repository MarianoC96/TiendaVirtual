import React, { useState } from 'react';
import { Box, Typography, Paper, Grid, TextField, Button, Avatar, Container, Divider } from '@mui/material';
import { useAuth } from '../../context/AuthContext';

const Profile = () => {
    const { user, updateProfile } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || 'Usuario Demo',
        email: user?.email || 'usuario@tienda.com',
        phone: user?.phone || '+1234567890',
        address: user?.address || 'Calle Principal 123',
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSave = () => {
        updateProfile(formData);
        setIsEditing(false);
    };

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>Mi Perfil</Typography>

            <Grid container spacing={4}>
                <Grid item xs={12} md={4}>
                    <Paper elevation={2} sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                        <Avatar
                            src={user?.avatar}
                            alt={user?.name}
                            sx={{ width: 120, height: 120, mb: 2, fontSize: '3rem' }}
                        >
                            {formData.name.charAt(0)}
                        </Avatar>
                        <Typography variant="h6">{formData.name}</Typography>
                        <Typography variant="body2" color="textSecondary">{formData.email}</Typography>
                        <Typography variant="overline" display="block" sx={{ mt: 2, color: 'primary.main', fontWeight: 'bold' }}>
                            {user?.role === 'admin' ? 'Administrador' : 'Cliente VIP'}
                        </Typography>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={8}>
                    <Paper elevation={2} sx={{ p: 4 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                            <Typography variant="h6">Información Personal</Typography>
                            <Button
                                variant={isEditing ? "outlined" : "contained"}
                                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                                color="primary"
                            >
                                {isEditing ? "Guardar Cambios" : "Editar Perfil"}
                            </Button>
                        </Box>
                        <Divider sx={{ mb: 3 }} />

                        <Grid container spacing={3}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Nombre Completo"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Correo Electrónico"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    disabled={!isEditing} // Email usually read-only or requires verify
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Teléfono"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Ciudad" // Mock field
                                    value="Ciudad de México"
                                    disabled={true}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Dirección de Envío"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    multiline
                                    rows={2}
                                />
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default Profile;
