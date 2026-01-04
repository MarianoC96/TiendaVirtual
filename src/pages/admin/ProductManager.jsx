import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Button, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, IconButton, Dialog,
    DialogTitle, DialogContent, DialogActions, TextField,
    Grid, Select, MenuItem, FormControl, InputLabel, Chip, Avatar, InputAdornment, Divider
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';
// import { products as initialProducts, categories } from '../../data/mockData';
// import { generateProductId } from '../../data/adminMockData';

const ProductManager = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]); // Fetch categories too

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await axios.get('http://localhost:3001/api/products');
            setProducts(res.data);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await axios.get('http://localhost:3001/api/categories');
            setCategories(res.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };
    const [open, setOpen] = useState(false);
    const [currentProduct, setCurrentProduct] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredProducts = products.filter(product =>
        (product.name && product.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (product.category_name && product.category_name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const emptyProduct = {
        name: '',
        price: '',
        stock: '',
        category: '',
        description: '',
        image: '',
        categoryId: ''
    };

    const handleOpen = (product = null) => {
        if (product) {
            setCurrentProduct({
                ...product,
                category: product.category_slug,
                image: product.image_url
            });
            setIsEditing(true);
        } else {
            setCurrentProduct(emptyProduct);
            setIsEditing(false);
        }
        setOpen(true);
    };

    const handleClose = () => setOpen(false);

    const handleSave = async () => {
        try {
            const payload = {
                ...currentProduct,
                category_id: categories.find(c => c.slug === currentProduct.category)?.id,
                image_url: currentProduct.image
            };

            if (isEditing) {
                await axios.put(`http://localhost:3001/api/products/${currentProduct.id}`, payload);
            } else {
                await axios.post('http://localhost:3001/api/products', payload);
            }
            fetchProducts();
            setOpen(false);
        } catch (error) {
            console.error('Error saving product:', error);
            alert('Error al guardar el producto');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
            try {
                await axios.delete(`http://localhost:3001/api/products/${id}`);
                fetchProducts();
            } catch (error) {
                console.error('Error deleting product:', error);
            }
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4" fontWeight="bold">Productos</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpen()}
                    sx={{ backgroundColor: '#1a237e' }}
                >
                    Nuevo Producto
                </Button>
            </Box>

            <TextField
                fullWidth
                variant="outlined"
                placeholder="Buscar por nombre o categoría..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ mb: 3, backgroundColor: 'white' }}
            />

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                            <TableCell>Producto</TableCell>
                            <TableCell>Categoría</TableCell>
                            <TableCell>Precio</TableCell>
                            <TableCell>Stock</TableCell>
                            <TableCell>Estado</TableCell>
                            <TableCell align="right">Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredProducts.map((product) => (
                            <TableRow key={product.id}>
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Avatar
                                            src={product.image_url}
                                            variant="rounded"
                                            sx={{ width: 50, height: 50 }}
                                        />
                                        <Box>
                                            <Typography variant="subtitle2">{product.name}</Typography>
                                            <Typography variant="caption" color="textSecondary">ID: {product.id}</Typography>
                                        </Box>
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Chip label={product.category_name || 'Sin categoría'} size="small" />
                                </TableCell>
                                <TableCell>S/ {product.price}</TableCell>
                                <TableCell>{product.stock}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={product.stock > 5 ? "En Stock" : product.stock > 0 ? "Bajo Stock" : "Agotado"}
                                        color={product.stock > 5 ? "success" : product.stock > 0 ? "warning" : "error"}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell align="right">
                                    <IconButton color="primary" onClick={() => handleOpen(product)}>
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton color="error" onClick={() => handleDelete(product.id)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
                <DialogTitle sx={{ bgcolor: '#f5f5f5', borderBottom: '1px solid #e0e0e0', pb: 2 }}>
                    <Typography variant="h6" fontWeight="bold">
                        {isEditing ? 'Editar Producto' : 'Nuevo Producto'}
                    </Typography>
                </DialogTitle>
                <DialogContent sx={{ pt: 3 }}>
                    <Box component="form" sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" color="primary" sx={{ mb: 2, fontWeight: 'bold' }}>
                            INFORMACIÓN BÁSICA
                        </Typography>
                        <Grid container spacing={3}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Nombre del Producto"
                                    placeholder="Ej. Laptop Gamer HP..."
                                    value={currentProduct?.name || ''}
                                    onChange={(e) => setCurrentProduct({ ...currentProduct, name: e.target.value })}
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth variant="outlined">
                                    <InputLabel id="category-label">Categoría</InputLabel>
                                    <Select
                                        labelId="category-label"
                                        value={currentProduct?.category || ''}
                                        label="Categoría"
                                        onChange={(e) => setCurrentProduct({ ...currentProduct, category: e.target.value })}
                                    >
                                        {categories.map(c => (
                                            <MenuItem key={c.id} value={c.slug}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <span>{c.icon}</span>
                                                    {c.name}
                                                </Box>
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    type="number"
                                    label="Precio"
                                    value={currentProduct?.price || ''}
                                    onChange={(e) => setCurrentProduct({ ...currentProduct, price: e.target.value })}
                                    InputProps={{
                                        startAdornment: <InputAdornment position="start">S/</InputAdornment>,
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    type="number"
                                    label="Stock Disponible"
                                    value={currentProduct?.stock || ''}
                                    onChange={(e) => setCurrentProduct({ ...currentProduct, stock: e.target.value })}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <Divider sx={{ my: 1 }} />
                                <Typography variant="subtitle2" color="primary" sx={{ my: 2, fontWeight: 'bold' }}>
                                    DETALLES VISUALES
                                </Typography>
                            </Grid>

                            <Grid item xs={12} md={8}>
                                <TextField
                                    fullWidth
                                    label="URL de la Imagen Principal"
                                    placeholder="https://ejemplo.com/imagen.jpg"
                                    value={currentProduct?.image || ''}
                                    onChange={(e) => setCurrentProduct({ ...currentProduct, image: e.target.value })}
                                    helperText="Copia y pega el enlace directo de la imagen"
                                />
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={4}
                                    label="Descripción del Producto"
                                    placeholder="Detalla las características principales..."
                                    value={currentProduct?.description || ''}
                                    onChange={(e) => setCurrentProduct({ ...currentProduct, description: e.target.value })}
                                    sx={{ mt: 3 }}
                                />
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Paper
                                    sx={{
                                        p: 2,
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        bgcolor: '#f9f9f9',
                                        border: '1px dashed #ccc'
                                    }}
                                >
                                    {currentProduct?.image ? (
                                        <Box
                                            component="img"
                                            src={currentProduct.image}
                                            alt="Vista previa"
                                            sx={{ maxWidth: '100%', maxHeight: 150, borderRadius: 1, objectFit: 'contain' }}
                                        />
                                    ) : (
                                        <Box sx={{ textAlign: 'center', color: '#999' }}>
                                            <Typography variant="body2">Vista Previa</Typography>
                                            <Typography variant="caption">La imagen aparecerá aquí</Typography>
                                        </Box>
                                    )}
                                </Paper>
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
                        {isEditing ? 'Guardar Cambios' : 'Crear Producto'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ProductManager;
