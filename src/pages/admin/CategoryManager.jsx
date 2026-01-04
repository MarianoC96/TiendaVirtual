import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Button, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, IconButton, Dialog,
    DialogTitle, DialogContent, DialogActions, TextField,
    Grid
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';
// import { categories as initialCategories } from '../../data/mockData';
// import { generateCategoryId } from '../../data/adminMockData';

const CategoryManager = () => {
    const [categories, setCategories] = useState([]);
    const [open, setOpen] = useState(false);
    const [currentCategory, setCurrentCategory] = useState({ name: '', icon: '', description: '', slug: '' });
    const [isEditing, setIsEditing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredCategories = categories.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.slug.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await axios.get('http://localhost:3001/api/categories');
            setCategories(res.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const handleOpen = (category = null) => {
        if (category) {
            setCurrentCategory(category);
            setIsEditing(true);
        } else {
            setCurrentCategory({ name: '', icon: '', description: '', slug: '' });
            setIsEditing(false);
        }
        setOpen(true);
    };

    const handleClose = () => setOpen(false);

    const handleSave = async () => {
        try {
            if (isEditing) {
                await axios.put(`http://localhost:3001/api/categories/${currentCategory.id}`, currentCategory);
            } else {
                await axios.post('http://localhost:3001/api/categories', currentCategory);
            }
            fetchCategories();
            setOpen(false);
        } catch (error) {
            console.error('Error saving category:', error);
            alert('Error al guardar categoría');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar esta categoría?')) {
            try {
                await axios.delete(`http://localhost:3001/api/categories/${id}`);
                fetchCategories();
            } catch (error) {
                console.error('Error deleting category:', error);
            }
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4" fontWeight="bold">Categorías</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpen()}
                    sx={{ backgroundColor: '#1a237e' }}
                >
                    Nueva Categoría
                </Button>
            </Box>

            <TextField
                fullWidth
                variant="outlined"
                placeholder="Buscar por nombre o slug..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ mb: 3, backgroundColor: 'white' }}
            />

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                            <TableCell>Icono</TableCell>
                            <TableCell>Nombre</TableCell>
                            <TableCell>Slug</TableCell>
                            <TableCell>Descripción</TableCell>
                            <TableCell align="right">Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredCategories.map((category) => (
                            <TableRow key={category.id}>
                                <TableCell sx={{ fontSize: '1.5rem' }}>{category.icon}</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>{category.name}</TableCell>
                                <TableCell>{category.slug}</TableCell>
                                <TableCell>{category.description}</TableCell>
                                <TableCell align="right">
                                    <IconButton color="primary" onClick={() => handleOpen(category)}>
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton color="error" onClick={() => handleDelete(category.id)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
                <DialogTitle sx={{ bgcolor: '#f5f5f5', borderBottom: '1px solid #e0e0e0', pb: 2 }}>
                    <Typography variant="h6" fontWeight="bold">
                        {isEditing ? 'Editar Categoría' : 'Nueva Categoría'}
                    </Typography>
                </DialogTitle>
                <DialogContent sx={{ pt: 3 }}>
                    <Box component="form" sx={{ mt: 2 }}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} sm={8}>
                                <TextField
                                    fullWidth
                                    label="Nombre de la Categoría"
                                    placeholder="Ej. Electrónica"
                                    value={currentCategory.name}
                                    onChange={(e) => setCurrentCategory({ ...currentCategory, name: e.target.value })}
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <TextField
                                    fullWidth
                                    label="Icono (Emoji)"
                                    placeholder="💻"
                                    value={currentCategory.icon}
                                    onChange={(e) => setCurrentCategory({ ...currentCategory, icon: e.target.value })}
                                    inputProps={{ style: { textAlign: 'center', fontSize: '1.5rem' } }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Slug (URL)"
                                    placeholder="ej-electronica"
                                    value={currentCategory.slug}
                                    onChange={(e) => setCurrentCategory({ ...currentCategory, slug: e.target.value })}
                                    helperText="Identificador único para la URL (sin espacios)"
                                    InputProps={{
                                        startAdornment: <Typography color="textSecondary" sx={{ mr: 1 }}>/</Typography>
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={3}
                                    label="Descripción"
                                    placeholder="Breve descripción de la categoría..."
                                    value={currentCategory.description}
                                    onChange={(e) => setCurrentCategory({ ...currentCategory, description: e.target.value })}
                                />
                            </Grid>
                        </Grid>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3, bgcolor: '#f5f5f5', borderTop: '1px solid #e0e0e0' }}>
                    <Button onClick={handleClose} sx={{ color: '#666' }}>Cancelar</Button>
                    <Button
                        onClick={handleSave}
                        variant="contained"
                        color="primary"
                        startIcon={isEditing ? <EditIcon /> : <AddIcon />}
                        sx={{ px: 4 }}
                    >
                        {isEditing ? 'Guardar Cambios' : 'Crear Categoría'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default CategoryManager;
