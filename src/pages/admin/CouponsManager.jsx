import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Button, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, IconButton, Dialog,
    DialogTitle, DialogContent, DialogActions, TextField,
    Grid, FormControl, InputLabel, Select, MenuItem, InputAdornment,
    Chip, Radio, RadioGroup, FormControlLabel, Tooltip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import axios from 'axios';

const CouponsManager = () => {
    const [coupons, setCoupons] = useState([]);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [open, setOpen] = useState(false);

    // Initial State for New Coupon
    const initialState = {
        name: '',
        discount_type: 'percentage', // percentage or fixed
        discount_value: '',
        target_type: 'category', // category or product
        target_id: '',
        start_date: '',
        expiration_date: '',
        usage_limit: '',
        usage_limit_per_user: 1
    };

    const [formData, setFormData] = useState(initialState);
    const [editingId, setEditingId] = useState(null);
    const [viewCoupon, setViewCoupon] = useState(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [successDialogOpen, setSuccessDialogOpen] = useState(false);
    const [createdCoupon, setCreatedCoupon] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [couponsRes, productsRes, categoriesRes] = await Promise.all([
                axios.get('http://localhost:3001/api/coupons'),
                axios.get('http://localhost:3001/api/products'),
                axios.get('http://localhost:3001/api/categories')
            ]);
            setCoupons(couponsRes.data);
            setProducts(productsRes.data);
            setCategories(categoriesRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const handleCreate = () => {
        const now = new Date();
        const limaDateStr = now.toLocaleDateString('en-CA', { timeZone: 'America/Lima' });
        const limaTimeStr = now.toLocaleTimeString('en-GB', { timeZone: 'America/Lima', hour12: false }).slice(0, 5);

        const later = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        const limaLaterDateStr = later.toLocaleDateString('en-CA', { timeZone: 'America/Lima' });

        setFormData({
            ...initialState,
            start_date: `${limaDateStr}T${limaTimeStr}`,
            expiration_date: `${limaLaterDateStr}T${limaTimeStr}`
        });
        setEditingId(null);
        setOpen(true);
    };

    const handleEdit = (coupon) => {
        const formatDate = (dateStr) => {
            const date = new Date(dateStr);
            const pad = n => n < 10 ? '0' + n : n;
            return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
        };

        setFormData({
            name: coupon.name,
            discount_type: coupon.discount_type,
            discount_value: coupon.discount_value,
            target_type: coupon.target_type,
            target_id: coupon.target_id,
            start_date: formatDate(coupon.start_date),
            expiration_date: formatDate(coupon.expiration_date),
            usage_limit: coupon.usage_limit,
            usage_limit_per_user: coupon.usage_limit_per_user
        });
        setEditingId(coupon.id);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setEditingId(null);
        setFormData(initialState);
    };

    const handleSuccessClose = () => setSuccessDialogOpen(false);

    const handleSave = async () => {
        if (!formData.name || !formData.discount_value || !formData.target_id || !formData.start_date || !formData.expiration_date) {
            alert('Por favor completa los campos requeridos');
            return;
        }

        const toLimaString = (isoString) => isoString.replace('T', ' ') + ':00';

        const payload = {
            ...formData,
            start_date: toLimaString(formData.start_date),
            expiration_date: toLimaString(formData.expiration_date),
            usage_limit: parseInt(formData.usage_limit) || 0,
            usage_limit_per_user: parseInt(formData.usage_limit_per_user) || 1,
            discount_value: parseFloat(formData.discount_value)
        };

        const token = localStorage.getItem('auth-token');
        const config = {
            headers: { Authorization: `Bearer ${token}` }
        };

        try {
            if (editingId) {
                await axios.put(`http://localhost:3001/api/coupons/${editingId}`, payload, config);
                alert('Cupón actualizado correctamente');
                fetchData();
                handleClose();
            } else {
                const response = await axios.post('http://localhost:3001/api/coupons', payload, config);
                fetchData();
                handleClose();
                setCreatedCoupon(response.data);
                setSuccessDialogOpen(true);
            }
        } catch (error) {
            console.error('Error saving coupon:', error);
            alert('Error al guardar cupón: ' + (error.response?.data?.message || 'Error desconocido'));
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Eliminar este cupón?')) {
            const token = localStorage.getItem('auth-token');
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };
            try {
                await axios.delete(`http://localhost:3001/api/coupons/${id}`, config);
                fetchData();
            } catch (error) {
                console.error(error);
                alert('Error al eliminar: ' + (error.response?.data?.message || 'Error desconocido'));
            }
        }
    };

    const filteredCoupons = coupons.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.code.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
                <Typography variant="h4" fontWeight="bold">Gestión de Cupones</Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                        size="small"
                        placeholder="Buscar cupones..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        slotProps={{
                            input: {
                                startAdornment: <InputAdornment position="start">🔍</InputAdornment>
                            }
                        }}
                    />
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleCreate}
                        sx={{ backgroundColor: '#1a237e' }}
                    >
                        Crear Cupón
                    </Button>
                </Box>
            </Box>

            <TableContainer component={Paper} elevation={3}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                            <TableCell>Código</TableCell>
                            <TableCell>Nombre</TableCell>
                            <TableCell>Descuento</TableCell>
                            <TableCell>Aplica A</TableCell>
                            <TableCell>Usos</TableCell>
                            <TableCell>Vence</TableCell>
                            <TableCell align="right">Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredCoupons.map((coupon) => (
                            <TableRow key={coupon.id} hover>
                                <TableCell>
                                    <Chip label={coupon.code} color="primary" variant="outlined" sx={{ fontWeight: 'bold' }} />
                                </TableCell>
                                <TableCell>{coupon.name}</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', color: 'green' }}>
                                    {coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : `S/ ${coupon.discount_value}`}
                                </TableCell>
                                <TableCell>
                                    {coupon.target_type === 'category'
                                        ? `Categoría: ${categories.find(c => c.id === coupon.target_id)?.name || '...'}`
                                        : `Producto: ${products.find(p => p.id === coupon.target_id)?.name || '...'}`
                                    }
                                </TableCell>
                                <TableCell>
                                    {coupon.usage_count} / {coupon.usage_limit === 0 ? '∞' : coupon.usage_limit}
                                </TableCell>
                                <TableCell>
                                    {new Date(coupon.expiration_date).toLocaleDateString()}
                                </TableCell>
                                <TableCell align="right">
                                    <Tooltip title="Ver Detalle">
                                        <IconButton color="info" onClick={() => setViewCoupon(coupon)}>
                                            <VisibilityIcon />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Editar">
                                        <IconButton color="primary" onClick={() => handleEdit(coupon)}>
                                            <EditIcon />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Eliminar">
                                        <IconButton color="error" onClick={() => handleDelete(coupon.id)}>
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
                        {editingId ? 'Editar Cupón' : 'Crear Nuevo Cupón'}
                    </Typography>
                </DialogTitle>
                <DialogContent sx={{ pt: 4 }}>
                    <Box component="form" sx={{ mt: 2 }}>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Nombre del Cupón"
                                    placeholder="Ej. Descuento de Bienvenida"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </Grid>

                            {/* Target Type Selector */}
                            <Grid item xs={12}>
                                <Typography variant="subtitle2" gutterBottom>Aplicar a:</Typography>
                                <RadioGroup
                                    row
                                    value={formData.target_type}
                                    onChange={(e) => setFormData({ ...formData, target_type: e.target.value, target_id: '' })}
                                >
                                    <FormControlLabel value="category" control={<Radio />} label="Categoría" />
                                    <FormControlLabel value="product" control={<Radio />} label="Producto Específico" />
                                </RadioGroup>
                            </Grid>

                            {/* Target Selection */}
                            <Grid item xs={12}>
                                <FormControl fullWidth>
                                    <InputLabel>
                                        {formData.target_type === 'category' ? 'Selecciona Categoría' : 'Selecciona Producto'}
                                    </InputLabel>
                                    <Select
                                        value={formData.target_id}
                                        label={formData.target_type === 'category' ? 'Selecciona Categoría' : 'Selecciona Producto'}
                                        onChange={(e) => {
                                            const newTargetId = e.target.value;
                                            let newDiscountValue = formData.discount_value;

                                            if (formData.target_type === 'product' && formData.discount_type === 'fixed') {
                                                const product = products.find(p => p.id === newTargetId);
                                                if (product && parseFloat(newDiscountValue) > product.price * 0.9) {
                                                    newDiscountValue = (product.price * 0.9).toFixed(2);
                                                }
                                            }
                                            setFormData({ ...formData, target_id: newTargetId, discount_value: newDiscountValue });
                                        }}
                                    >
                                        {formData.target_type === 'category'
                                            ? categories.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)
                                            : products.map(p => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)
                                        }
                                    </Select>
                                </FormControl>
                            </Grid>

                            {/* Discount Type Selector */}
                            <Grid item xs={12}>
                                <Typography variant="subtitle2" gutterBottom>Tipo de Descuento:</Typography>
                                <RadioGroup
                                    row
                                    value={formData.discount_type}
                                    onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
                                >
                                    <FormControlLabel value="percentage" control={<Radio />} label="Porcentaje (%)" />
                                    <FormControlLabel value="fixed" control={<Radio />} label="Monto Fijo (S/)" />
                                </RadioGroup>
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    type="number"
                                    label={formData.discount_type === 'percentage' ? "Porcentaje de Descuento" : "Monto a Descontar"}
                                    value={formData.discount_value}
                                    onChange={(e) => {
                                        let val = parseFloat(e.target.value);
                                        if (isNaN(val)) val = '';

                                        // Validation Logic
                                        if (val !== '') {
                                            if (val < 0) val = 0;

                                            if (formData.discount_type === 'percentage') {
                                                if (val > 90) val = 90;
                                            } else if (formData.discount_type === 'fixed' && formData.target_type === 'product' && formData.target_id) {
                                                const product = products.find(p => p.id === formData.target_id);
                                                if (product && val > product.price * 0.9) {
                                                    val = parseFloat((product.price * 0.9).toFixed(2));
                                                }
                                            }
                                        }

                                        setFormData({ ...formData, discount_value: val });
                                    }}
                                    InputProps={{
                                        endAdornment: <InputAdornment position="end">{formData.discount_type === 'percentage' ? '%' : 'S/'}</InputAdornment>,
                                    }}
                                    helperText={
                                        formData.discount_type === 'fixed' && formData.target_type === 'product' && formData.target_id
                                            ? `Máximo (90%): S/ ${(products.find(p => p.id === formData.target_id)?.price * 0.9).toFixed(2) || 0}`
                                            : (formData.discount_type === 'percentage' ? "Máximo 90%" : "")
                                    }
                                />
                            </Grid>

                            {/* Dates */}
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    type="datetime-local"
                                    label="Inicio"
                                    InputLabelProps={{ shrink: true }}
                                    value={formData.start_date}
                                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    type="datetime-local"
                                    label="Vencimiento"
                                    InputLabelProps={{ shrink: true }}
                                    value={formData.expiration_date}
                                    onChange={(e) => setFormData({ ...formData, expiration_date: e.target.value })}
                                />
                            </Grid>

                            {/* Limits */}
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    type="number"
                                    label="Límite Total de Usos"
                                    placeholder="0 = Ilimitado"
                                    value={formData.usage_limit}
                                    onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })}
                                    helperText="Dejar vacío o 0 para ilimitado"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    type="number"
                                    label="Límite Por Usuario"
                                    value={formData.usage_limit_per_user}
                                    onChange={(e) => setFormData({ ...formData, usage_limit_per_user: e.target.value })}
                                />
                            </Grid>
                        </Grid>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={handleClose}>Cancelar</Button>
                    <Button onClick={handleSave} variant="contained" sx={{ px: 4 }}>
                        {editingId ? 'Actualizar Cupón' : 'Crear Cupón'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={successDialogOpen} onClose={handleSuccessClose} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold', color: 'green' }}>
                    ¡Cupón Creado Exitosamente!
                </DialogTitle>
                <DialogContent sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body1" gutterBottom>
                        El cupón <strong>{createdCoupon?.name}</strong> se ha generado correctamente.
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                        Comparte este código con tus clientes:
                    </Typography>
                    <Box sx={{ mt: 2, p: 3, bgcolor: '#f0f4c3', borderRadius: 2, display: 'inline-block' }}>
                        <Typography variant="h4" sx={{ letterSpacing: 2, fontWeight: 'bold', color: '#33691e' }}>
                            {createdCoupon?.code}
                        </Typography>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
                    <Button variant="contained" onClick={handleSuccessClose}>Entendido</Button>
                </DialogActions>
            </Dialog>

            {/* Detail View Dialog */}
            <Dialog open={!!viewCoupon} onClose={() => setViewCoupon(null)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 'bold' }}>Detalle del Cupón</DialogTitle>
                <DialogContent dividers>
                    {viewCoupon && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 2, textAlign: 'center' }}>
                                <Typography variant="overline" color="textSecondary">CÓDIGO</Typography>
                                <Typography variant="h4" fontWeight="bold" sx={{ fontFamily: 'monospace', color: 'primary.main' }}>
                                    {viewCoupon.code}
                                </Typography>
                            </Box>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <Typography variant="caption" color="textSecondary">Nombre</Typography>
                                    <Typography variant="body1" fontWeight="medium">{viewCoupon.name}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="caption" color="textSecondary">Descuento</Typography>
                                    <Typography variant="body1" fontWeight="medium">
                                        {viewCoupon.discount_type === 'percentage'
                                            ? `${viewCoupon.discount_value}%`
                                            : `S/ ${viewCoupon.discount_value}`}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="caption" color="textSecondary">Uso Actual</Typography>
                                    <Typography variant="body1" fontWeight="medium">{viewCoupon.usage_count} usos</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="caption" color="textSecondary">Aplica a</Typography>
                                    <Typography variant="body1" fontWeight="medium">
                                        {viewCoupon.target_type === 'category' ? 'Categoría' : 'Producto'}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="caption" color="textSecondary">ID Referencia</Typography>
                                    <Typography variant="body1" fontWeight="medium">{viewCoupon.target_id}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="caption" color="textSecondary">Inicio</Typography>
                                    <Typography variant="body1" fontWeight="medium">
                                        {new Date(viewCoupon.start_date).toLocaleDateString()}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="caption" color="textSecondary">Vence</Typography>
                                    <Typography variant="body1" fontWeight="medium">
                                        {new Date(viewCoupon.expiration_date).toLocaleDateString()}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setViewCoupon(null)}>Cerrar</Button>
                </DialogActions>
            </Dialog>

        </Box>
    );
};

export default CouponsManager;
