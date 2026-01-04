import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Button, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, IconButton, Dialog,
    DialogTitle, DialogContent, DialogActions, TextField,
    Grid, FormControl, InputLabel, Select, MenuItem, InputAdornment, Divider, Chip,
    Radio, RadioGroup, FormControlLabel, Tooltip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import axios from 'axios';

const DiscountManager = () => {
    const [discounts, setDiscounts] = useState([]);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [open, setOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [viewDiscount, setViewDiscount] = useState(null);

    // durationType: 'dates' (Dates Range) or 'hours' (Duration from start)
    const [durationType, setDurationType] = useState('dates');

    const [formData, setFormData] = useState({
        name: '',
        categoryId: '',
        productId: '',
        discountPercentage: 10,
        // For 'dates' mode
        startDate: '',
        startTime: '00:00',
        endDate: '',
        endTime: '23:59',
        // For 'hours' mode
        durationHours: '',
        startImmediately: true,
        startDateTime: '' // If not starting immediately in 'hours' mode
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [discountsRes, productsRes, categoriesRes] = await Promise.all([
                axios.get('http://localhost:3001/api/discounts'),
                axios.get('http://localhost:3001/api/products'),
                axios.get('http://localhost:3001/api/categories')
            ]);
            setDiscounts(discountsRes.data);
            setProducts(productsRes.data);
            setCategories(categoriesRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const handleOpen = (discount = null) => {
        if (discount) {
            // Edit mode setup
            setEditingId(discount.id);
            const existingProduct = products.find(p => p.id === discount.product_id);

            // Helper to get YYYY-MM-DD and HH:mm from a Date object adjusted to Lima
            // Note: discount.start_date might be ISO string (UTC) or local string depending on how it was saved.
            // We force interpretation to Lima to be consistent.
            const getLimaParts = (isoString) => {
                const date = new Date(isoString);
                const dateStr = date.toLocaleDateString('en-CA', { timeZone: 'America/Lima' }); // YYYY-MM-DD
                const timeStr = date.toLocaleTimeString('en-GB', { timeZone: 'America/Lima', hour12: false }).slice(0, 5); // HH:mm
                return { dateStr, timeStr };
            };

            const startParts = getLimaParts(discount.start_date);
            const endParts = getLimaParts(discount.end_date);

            setDurationType('dates');

            setFormData({
                name: discount.name,
                categoryId: existingProduct ? existingProduct.category_id : '',
                productId: discount.product_id,
                discountPercentage: discount.percentage,

                startDate: startParts.dateStr,
                startTime: startParts.timeStr,
                endDate: endParts.dateStr,
                endTime: endParts.timeStr,

                durationHours: '',
                startImmediately: true,
                startDateTime: ''
            });
        } else {
            // New mode - Defaults in Lima Time
            setEditingId(null);

            const now = new Date();
            // Format Now to Lima
            const limaDateStr = now.toLocaleDateString('en-CA', { timeZone: 'America/Lima' });
            const limaTimeStr = now.toLocaleTimeString('en-GB', { timeZone: 'America/Lima', hour12: false }).slice(0, 5);

            // Tomorrow in Lima
            const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
            const limaTomorrowDateStr = tomorrow.toLocaleDateString('en-CA', { timeZone: 'America/Lima' });

            setFormData({
                name: '',
                categoryId: '',
                productId: '',
                discountPercentage: 10,

                startDate: limaDateStr,
                startTime: '00:00',
                endDate: limaTomorrowDateStr,
                endTime: '23:59',

                durationHours: '',
                startImmediately: true,
                startDateTime: `${limaDateStr}T${limaTimeStr}` // YYYY-MM-DDTHH:mm
            });
            setDurationType('dates');
        }
        setOpen(true);
    };

    const handleClose = () => setOpen(false);

    // Helper to format a Date object to "YYYY-MM-DD HH:mm:ss" in Lima Time
    const toLimaString = (date) => {
        const limaDate = new Date(date.toLocaleString('en-US', { timeZone: 'America/Lima' }));
        const year = limaDate.getFullYear();
        const month = String(limaDate.getMonth() + 1).padStart(2, '0');
        const day = String(limaDate.getDate()).padStart(2, '0');
        const hours = String(limaDate.getHours()).padStart(2, '0');
        const minutes = String(limaDate.getMinutes()).padStart(2, '0');
        const seconds = String(limaDate.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    };

    const handleSave = async () => {
        if (!formData.productId || !formData.name) {
            alert('Por favor completa los campos requeridos');
            return;
        }

        let startString, endString;

        if (durationType === 'dates') {
            if (!formData.startDate || !formData.endDate) {
                alert('Por favor selecciona las fechas de inicio y fin.');
                return;
            }
            // Use inputs directly, they are already "Lima Time" as requested by user
            startString = `${formData.startDate} ${formData.startTime}:00`;
            endString = `${formData.endDate} ${formData.endTime}:00`;

            // Validate: simple string comparison works for ISO-like dates, but better construct Dates just for check
            if (new Date(endString) <= new Date(startString)) {
                alert('La fecha de fin debe ser posterior a la fecha de inicio.');
                return;
            }

        } else {
            // Hours mode
            if (!formData.durationHours || formData.durationHours <= 0) {
                alert('Por favor introduce una duración válida en horas.');
                return;
            }

            let startDateObj;

            if (formData.startImmediately) {
                // Current time in Lima context
                const now = new Date();
                startString = toLimaString(now);
                startDateObj = now;
            } else {
                if (!formData.startDateTime) {
                    alert('Por favor selecciona cuándo inicia el descuento.');
                    return;
                }
                // startDateTime is YYYY-MM-DDTHH:mm
                startString = formData.startDateTime.replace('T', ' ') + ':00';
                startDateObj = new Date(startString);
            }

            // Calculate End Date
            // We add duration to the object, then convert THAT result to Lima String
            const durMs = formData.durationHours * 60 * 60 * 1000;
            const endDateObj = new Date(startDateObj.getTime() + durMs);
            endString = toLimaString(endDateObj);
        }

        const discountPayload = {
            name: formData.name,
            product_id: formData.productId,
            percentage: parseInt(formData.discountPercentage),
            start_date: startString,
            end_date: endString,
            is_active: true
        };

        const token = localStorage.getItem('auth-token');
        const config = {
            headers: { Authorization: `Bearer ${token}` }
        };

        try {
            if (editingId) {
                await axios.put(`http://localhost:3001/api/discounts/${editingId}`, discountPayload, config);
            } else {
                await axios.post('http://localhost:3001/api/discounts', discountPayload, config);
            }
            fetchData();
            setOpen(false);
        } catch (error) {
            console.error('Error saving discount:', error);
            alert('Error al guardar descuento: ' + (error.response?.data?.message || 'Error desconocido'));
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este descuento?')) {
            const token = localStorage.getItem('auth-token');
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };
            try {
                await axios.delete(`http://localhost:3001/api/discounts/${id}`, config);
                fetchData();
            } catch (error) {
                console.error('Error deleting discount:', error);
                alert('Error al eliminar: ' + (error.response?.data?.message || 'Error desconocido'));
            }
        }
    };

    // Filter products based on selected category
    const filteredProducts = formData.categoryId
        ? products.filter(p => p.category_id === formData.categoryId)
        : [];

    // Calculate preview price
    const selectedProduct = products.find(p => p.id === formData.productId);
    const originalPrice = selectedProduct ? parseFloat(selectedProduct.price) : 0;
    const discountedPrice = originalPrice - (originalPrice * (formData.discountPercentage / 100));

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4" fontWeight="bold">Descuentos</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpen()}
                    sx={{ backgroundColor: '#1a237e' }}
                >
                    Nuevo Descuento
                </Button>
            </Box>

            <TableContainer component={Paper} elevation={3}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                            <TableCell>Nombre</TableCell>
                            <TableCell>Producto</TableCell>
                            <TableCell>Porcentaje</TableCell>
                            <TableCell>Inicia</TableCell>
                            <TableCell>Termina</TableCell>
                            <TableCell>Estado</TableCell>
                            <TableCell align="right">Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {discounts.map((discount) => (
                            <TableRow key={discount.id} hover>
                                <TableCell>{discount.name}</TableCell>
                                <TableCell>{discount.product_name || 'Producto eliminado'}</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', color: 'green' }}>{discount.percentage}%</TableCell>
                                <TableCell>
                                    {/* Display Date nicely. If DB returns UTC ISO, we force Lima Display. 
                                        If DB returns local string (e.g. 2026-01-02 21:36:00), new Date() parses it as local.
                                        To be safe and consistent, we can format explicitly. */}
                                    {new Date(discount.start_date).toLocaleDateString('es-PE', { timeZone: 'America/Lima' })} {new Date(discount.start_date).toLocaleTimeString('es-PE', { timeZone: 'America/Lima', hour: '2-digit', minute: '2-digit' })}
                                </TableCell>
                                <TableCell>
                                    {new Date(discount.end_date).getFullYear() > 2090
                                        ? 'Permanente'
                                        : `${new Date(discount.end_date).toLocaleDateString('es-PE', { timeZone: 'America/Lima' })} ${new Date(discount.end_date).toLocaleTimeString('es-PE', { timeZone: 'America/Lima', hour: '2-digit', minute: '2-digit' })}`}
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        // Simple logic check: Active if within date range
                                        label={new Date() >= new Date(discount.start_date) && new Date() <= new Date(discount.end_date) ? 'Activo' : 'Inactivo'}
                                        color={new Date() >= new Date(discount.start_date) && new Date() <= new Date(discount.end_date) ? 'success' : 'default'}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell align="right">
                                    <Tooltip title="Ver Detalle">
                                        <IconButton color="info" onClick={() => setViewDiscount(discount)}>
                                            <VisibilityIcon />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Editar">
                                        <IconButton color="primary" onClick={() => handleOpen(discount)}>
                                            <EditIcon />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Eliminar">
                                        <IconButton color="error" onClick={() => handleDelete(discount.id)}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog
                open={open}
                onClose={handleClose}
                maxWidth="md"
                fullWidth
                PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
            >
                <DialogTitle sx={{ bgcolor: '#fff', pb: 1, borderBottom: '1px solid #f0f0f0' }}>
                    <Typography variant="h5" fontWeight="bold" color="primary">
                        {editingId ? 'Editar Descuento' : 'Crear Nuevo Descuento'}
                    </Typography>
                </DialogTitle>
                <DialogContent sx={{ pt: 4 }}>
                    <Box component="form" sx={{ mt: 2 }}>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Nombre de la Promoción"
                                    placeholder="Ej. Oferta de Verano"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    variant="outlined"
                                />
                            </Grid>

                            {/* Category Selection */}
                            <Grid item xs={12}>
                                <FormControl fullWidth variant="outlined">
                                    <InputLabel id="category-select-label">Selecciona una Categoría</InputLabel>
                                    <Select
                                        labelId="category-select-label"
                                        value={formData.categoryId}
                                        label="Selecciona una Categoría"
                                        onChange={(e) => setFormData({ ...formData, categoryId: e.target.value, productId: '' })}
                                        disabled={!!editingId}
                                    >
                                        <MenuItem value=""><em>Seleccionar...</em></MenuItem>
                                        {categories.map(c => (
                                            <MenuItem key={c.id} value={c.id}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <span>{c.icon}</span>
                                                    <span>{c.name}</span>
                                                </Box>
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            {/* Product Selection */}
                            <Grid item xs={12}>
                                <FormControl fullWidth variant="outlined" disabled={!formData.categoryId || !!editingId}>
                                    <InputLabel id="product-select-label">Producto</InputLabel>
                                    <Select
                                        labelId="product-select-label"
                                        value={formData.productId}
                                        label="Producto"
                                        onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                                    >
                                        <MenuItem value=""><em>Seleccionar...</em></MenuItem>
                                        {filteredProducts.map(p => (
                                            <MenuItem key={p.id} value={p.id}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                                    <Typography>{p.name}</Typography>
                                                    <Typography color="text.secondary">${p.price}</Typography>
                                                </Box>
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    type="number"
                                    label="Porcentaje de Descuento"
                                    value={formData.discountPercentage}
                                    InputProps={{
                                        endAdornment: <InputAdornment position="end">%</InputAdornment>,
                                        inputProps: { min: 1, max: 99 }
                                    }}
                                    onChange={(e) => {
                                        let val = parseInt(e.target.value);
                                        if (val > 100) val = 100;
                                        if (val < 0) val = 0;
                                        setFormData({ ...formData, discountPercentage: val })
                                    }}
                                    helperText="Introduce un valor entre 1 y 100"
                                />
                            </Grid>

                            {/* Duration Type Selector */}
                            <Grid item xs={12}>
                                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                    Vigencia del Descuento
                                </Typography>
                                <RadioGroup
                                    row
                                    value={durationType}
                                    onChange={(e) => setDurationType(e.target.value)}
                                >
                                    <FormControlLabel value="dates" control={<Radio />} label="Por Rango de Fechas" />
                                    <FormControlLabel value="hours" control={<Radio />} label="Por Duración (Horas)" />
                                </RadioGroup>
                            </Grid>

                            {/* Date Range Inputs */}
                            {durationType === 'dates' && (
                                <>
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="caption" color="textSecondary">Inicio (Hora: {formData.startTime})</Typography>
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            <TextField
                                                type="date"
                                                fullWidth
                                                value={formData.startDate}
                                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                            />
                                            <TextField
                                                type="time"
                                                fullWidth
                                                value={formData.startTime}
                                                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                            />
                                        </Box>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="caption" color="textSecondary">Fin (Hora: {formData.endTime})</Typography>
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            <TextField
                                                type="date"
                                                fullWidth
                                                value={formData.endDate}
                                                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                            />
                                            <TextField
                                                type="time"
                                                fullWidth
                                                value={formData.endTime}
                                                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                            />
                                        </Box>
                                    </Grid>
                                </>
                            )}

                            {/* Hours Duration Inputs */}
                            {durationType === 'hours' && (
                                <>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            type="number"
                                            label="Duración (Horas)"
                                            value={formData.durationHours}
                                            onChange={(e) => setFormData({ ...formData, durationHours: e.target.value })}
                                            helperText="¿Cuántas horas durará el descuento?"
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <FormControlLabel
                                            control={
                                                <Radio
                                                    checked={formData.startImmediately}
                                                    onClick={() => setFormData({ ...formData, startImmediately: true })}
                                                />
                                            }
                                            label="Iniciar inmediatamente"
                                        />
                                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                            <Radio
                                                checked={!formData.startImmediately}
                                                onClick={() => setFormData({ ...formData, startImmediately: false })}
                                            />
                                            <TextField
                                                type="datetime-local"
                                                disabled={formData.startImmediately}
                                                value={formData.startDateTime}
                                                onChange={(e) => setFormData({ ...formData, startDateTime: e.target.value, startImmediately: false })}
                                                fullWidth
                                                size="small"
                                            />
                                        </Box>
                                    </Grid>
                                </>
                            )}

                            {/* Elegant Text-Only Price Preview at Bottom */}
                            {formData.productId && (
                                <Grid item xs={12}>
                                    <Box sx={{ mt: 1, p: 2, bgcolor: '#fafafa', borderRadius: 1, border: '1px solid #eee' }}>
                                        <Typography variant="body2" color="text.secondary" gutterBottom>
                                            Resumen del Descuento
                                        </Typography>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                            <Typography variant="body2" sx={{ textDecoration: 'line-through', color: '#999' }}>
                                                ${originalPrice.toFixed(2)}
                                            </Typography>
                                            <Typography variant="h6" sx={{ fontWeight: 500, color: '#333' }}>
                                                ${discountedPrice.toFixed(2)}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Grid>
                            )}
                        </Grid>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3, bgcolor: '#fff', borderTop: '1px solid #f0f0f0' }}>
                    <Button onClick={handleClose} sx={{ color: '#666' }}>Cancelar</Button>
                    <Button
                        onClick={handleSave}
                        variant="contained"
                        color="primary"
                        startIcon={editingId ? <EditIcon /> : <AddIcon />}
                        sx={{ px: 4 }}
                    >
                        {editingId ? 'Guardar Cambios' : 'Crear Descuento'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={!!viewDiscount} onClose={() => setViewDiscount(null)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 'bold' }}>Detalle del Descuento</DialogTitle>
                <DialogContent dividers>
                    {viewDiscount && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Box sx={{ p: 2, bgcolor: '#e3f2fd', borderRadius: 2, textAlign: 'center' }}>
                                <Typography variant="overline" color="textSecondary">DESCUENTO</Typography>
                                <Typography variant="h3" fontWeight="bold" color="primary">
                                    {viewDiscount.percentage}%
                                </Typography>
                            </Box>

                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <Typography variant="caption" color="textSecondary">Nombre</Typography>
                                    <Typography variant="body1" fontWeight="medium">{viewDiscount.name}</Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="caption" color="textSecondary">Producto Afectado</Typography>
                                    <Typography variant="body1" fontWeight="medium">{viewDiscount.product_name || 'Desconocido'}</Typography>
                                </Grid>

                                <Grid item xs={6}>
                                    <Typography variant="caption" color="textSecondary">Fecha Inicio</Typography>
                                    <Typography variant="body2">
                                        {new Date(viewDiscount.start_date).toLocaleDateString('es-PE', { timeZone: 'America/Lima' })}
                                        <br />
                                        {new Date(viewDiscount.start_date).toLocaleTimeString('es-PE', { timeZone: 'America/Lima', hour: '2-digit', minute: '2-digit' })}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="caption" color="textSecondary">Fecha Fin</Typography>
                                    <Typography variant="body2">
                                        {new Date(viewDiscount.end_date).getFullYear() > 2090
                                            ? 'Indefinido'
                                            : (
                                                <>
                                                    {new Date(viewDiscount.end_date).toLocaleDateString('es-PE', { timeZone: 'America/Lima' })}
                                                    <br />
                                                    {new Date(viewDiscount.end_date).toLocaleTimeString('es-PE', { timeZone: 'America/Lima', hour: '2-digit', minute: '2-digit' })}
                                                </>
                                            )}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="caption" color="textSecondary">Estado</Typography>
                                    <Box sx={{ mt: 0.5 }}>
                                        <Chip
                                            label={new Date() >= new Date(viewDiscount.start_date) && new Date() <= new Date(viewDiscount.end_date) ? 'Activo' : 'Inactivo'}
                                            color={new Date() >= new Date(viewDiscount.start_date) && new Date() <= new Date(viewDiscount.end_date) ? 'success' : 'default'}
                                            size="small"
                                        />
                                    </Box>
                                </Grid>
                            </Grid>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setViewDiscount(null)}>Cerrar</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default DiscountManager;
