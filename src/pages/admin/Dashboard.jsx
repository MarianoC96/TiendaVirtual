import React, { useState, useEffect } from 'react';
import {
    Grid, Paper, Typography, Box, Card, CardContent, Alert, AlertTitle,
    Button, CircularProgress, Dialog, DialogTitle, DialogContent,
    DialogActions, TextField, useTheme, Avatar, Divider, IconButton, Tooltip
} from '@mui/material';
import {
    AttachMoney as AttachMoneyIcon,
    ShoppingCart as ShoppingCartIcon,
    GroupAdd as GroupAddIcon,
    WarningAmber as WarningAmberIcon,
    AccountBalance as AccountBalanceIcon,
    Inventory as InventoryIcon,
    LocalOffer as LocalOfferIcon,
    ConfirmationNumber as CouponIcon,
    KeyboardArrowRight as ArrowRightIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ModernStatCard = ({ title, value, subtext, icon, color = 'primary' }) => (
    <Card sx={{
        height: '100%',
        borderRadius: 3,
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)', // Minimal shadow
        border: '1px solid #eaecf0',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        }
    }}>
        <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box>
                    <Typography variant="subtitle2" color="textSecondary" sx={{ fontWeight: 600, mb: 1 }}>
                        {title}
                    </Typography>
                    <Typography variant="h4" fontWeight="bold" sx={{ color: '#101828' }}>
                        {value}
                    </Typography>
                </Box>
                <Avatar sx={{
                    bgcolor: `${color}.50`,
                    backgroundColor: (theme) => theme.palette[color].light + '33',
                    color: `${color}.main`,
                    width: 48,
                    height: 48,
                    borderRadius: '12px'
                }}>
                    {icon}
                </Avatar>
            </Box>
            {subtext && (
                <Typography variant="body2" color="textSecondary">
                    {subtext}
                </Typography>
            )}
        </CardContent>
    </Card>
);

const Dashboard = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [inventoryAlerts, setInventoryAlerts] = useState([]);
    const [discounts, setDiscounts] = useState([]);
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Estado para el modal de reabastecimiento
    const [restockDialog, setRestockDialog] = useState({ open: false, productId: null, productName: '', currentStock: 0 });
    const [restockAmount, setRestockAmount] = useState('');

    const fetchDashboardData = async () => {
        try {
            const response = await axios.get('http://localhost:3001/api/dashboard');
            const data = response.data;

            setStats(data.stats);
            setInventoryAlerts(data.inventoryAlerts);
            setDiscounts(data.discounts);
            setCoupons(data.coupons);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            setError('No se pudo cargar la información del dashboard.');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const handleOpenRestock = (product) => {
        setRestockDialog({
            open: true,
            productId: product.id,
            productName: product.name,
            currentStock: product.currentStock
        });
        setRestockAmount('');
    };

    const handleCloseRestock = () => {
        setRestockDialog({ open: false, productId: null, productName: '', currentStock: 0 });
    };

    const handleRestockSubmit = async () => {
        const amount = Number(restockAmount);

        if (!restockAmount || isNaN(amount) || amount <= 0 || !Number.isInteger(amount)) {
            alert('Por favor ingrese una cantidad válida (solo números enteros positivos)');
            return;
        }

        try {
            const newStock = restockDialog.currentStock + amount;
            await axios.patch(`http://localhost:3001/api/products/${restockDialog.productId}/stock`, {
                stock: newStock
            });

            // Recargar datos y cerrar modal
            await fetchDashboardData();
            handleCloseRestock();
        } catch (err) {
            console.error('Error updating stock:', err);
            alert('Error al actualizar el stock');
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>
            </Box>
        );
    }

    return (
        <Box sx={{ fade: 'in' }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ color: '#101828' }}>
                    Panel de Control
                </Typography>
                <Typography variant="body1" color="textSecondary">
                    Bienvenido de nuevo. Aquí tienes un resumen de la actividad de tu tienda.
                </Typography>
            </Box>

            {/* Critical Alerts Section */}
            {(stats && (stats.lowStockProducts > 0 || stats.overduePendingOrders > 0)) && (
                <Grid container spacing={2} sx={{ mb: 4 }}>
                    {stats.lowStockProducts > 0 && (
                        <Grid item xs={12} md={stats.overduePendingOrders > 0 ? 6 : 12}>
                            <Alert severity="warning" variant="filled" icon={<WarningAmberIcon fontSize="inherit" />} sx={{ borderRadius: 2 }}>
                                <strong>Atención:</strong> {stats.lowStockProducts} productos tienen stock bajo (≤ 5 unidades).
                            </Alert>
                        </Grid>
                    )}
                    {stats.overduePendingOrders > 0 && (
                        <Grid item xs={12} md={stats.lowStockProducts > 0 ? 6 : 12}>
                            <Alert severity="error" variant="filled" sx={{ borderRadius: 2 }}>
                                <strong>Urgente:</strong> {stats.overduePendingOrders} pedidos pendientes tienen más de 24h de antigüedad.
                            </Alert>
                        </Grid>
                    )}
                </Grid>
            )}

            {/* Stats Grid */}
            {stats && (
                <Grid container spacing={3} sx={{ mb: 5 }}>
                    {/* NEW: Lifetime Revenue */}
                    <Grid item xs={12} sm={6} lg={3}>
                        <ModernStatCard
                            title="Ganancias Totales"
                            value={`S/ ${Number(stats.totalRevenue.lifetime).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`}
                            subtext="Ingresos históricos totales"
                            icon={<AccountBalanceIcon />}
                            color="primary"
                        />
                    </Grid>

                    {/* Monthly Revenue */}
                    <Grid item xs={12} sm={6} lg={3}>
                        <ModernStatCard
                            title="Ingresos (Mes)"
                            value={`S/ ${Number(stats.totalRevenue.month).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`}
                            subtext="Facturación mensual actual"
                            icon={<AttachMoneyIcon />}
                            color="success"
                        />
                    </Grid>

                    {/* Orders */}
                    <Grid item xs={12} sm={6} lg={3}>
                        <ModernStatCard
                            title="Pedidos (Mes)"
                            value={stats.totalOrders.month}
                            subtext="Pedidos procesados este mes"
                            icon={<ShoppingCartIcon />}
                            color="warning"
                        />
                    </Grid>

                    {/* Customers */}
                    <Grid item xs={12} sm={6} lg={3}>
                        <ModernStatCard
                            title="Nuevos Clientes"
                            value={stats.totalCustomers.new}
                            subtext={`Registrados este mes`}
                            icon={<GroupAddIcon />}
                            color="info"
                        />
                    </Grid>
                </Grid>
            )}

            <Grid container spacing={4}>
                {/* Inventory Management Section */}
                <Grid item xs={12} lg={4}>
                    <Paper elevation={0} sx={{
                        p: 0,
                        border: '1px solid #e0e0e0',
                        borderRadius: 4,
                        overflow: 'hidden',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        <Box sx={{ p: 2.5, borderBottom: '1px solid #f0f0f0', bgcolor: '#fafafa', display: 'flex', alignItems: 'center', gap: 1 }}>
                            <InventoryIcon color="warning" fontSize="small" />
                            <Typography variant="subtitle1" fontWeight="bold" color="textPrimary">
                                Stock Bajo
                            </Typography>
                        </Box>
                        <Box sx={{ p: 0, flexGrow: 1, maxHeight: 200, overflowY: 'auto' }}>
                            {inventoryAlerts.length === 0 ? (
                                <Box sx={{ p: 4, textAlign: 'center' }}>
                                    <Typography variant="body2" color="textSecondary">¡Todo en orden!</Typography>
                                </Box>
                            ) : (
                                inventoryAlerts.map((item, index) => (
                                    <Box key={item.id} sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        p: 2,
                                        borderBottom: index !== inventoryAlerts.length - 1 ? '1px solid #f0f0f0' : 'none',
                                    }}>
                                        <Box sx={{ minWidth: 0, mr: 1 }}>
                                            <Typography variant="body2" fontWeight="medium" noWrap title={item.name}>{item.name}</Typography>
                                            <Typography variant="caption" color="error.main" fontWeight="bold">
                                                Stock: {item.currentStock}
                                            </Typography>
                                        </Box>
                                        <Button
                                            size="small"
                                            variant="outlined"
                                            color="primary"
                                            onClick={() => handleOpenRestock(item)}
                                            sx={{ minWidth: 80, fontSize: '0.7rem' }}
                                        >
                                            Abastecer
                                        </Button>
                                    </Box>
                                ))
                            )}
                        </Box>
                    </Paper>
                </Grid>

                {/* Active Discounts Section */}
                <Grid item xs={12} lg={4}>
                    <Paper
                        elevation={0}
                        onClick={() => navigate('/admin/descuentos')}
                        sx={{
                            p: 0,
                            border: '1px solid #e0e0e0',
                            borderRadius: 4,
                            overflow: 'hidden',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            '&:hover': {
                                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                                borderColor: 'primary.main'
                            }
                        }}
                    >
                        <Box sx={{ p: 2.5, borderBottom: '1px solid #f0f0f0', bgcolor: '#fafafa', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <LocalOfferIcon color="info" fontSize="small" />
                                <Typography variant="subtitle1" fontWeight="bold" color="textPrimary">
                                    Descuentos
                                </Typography>
                            </Box>
                            <ArrowRightIcon color="action" />
                        </Box>
                        <Box sx={{ p: 0, flexGrow: 1, maxHeight: 200, overflowY: 'auto' }}>
                            {discounts.length === 0 ? (
                                <Box sx={{ p: 4, textAlign: 'center' }}>
                                    <Typography variant="body2" color="textSecondary">Sin descuentos activos.</Typography>
                                </Box>
                            ) : (
                                discounts.map((discount, index) => (
                                    <Box key={discount.id} sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        p: 2,
                                        borderBottom: index !== discounts.length - 1 ? '1px solid #f0f0f0' : 'none',
                                    }}>
                                        <Box sx={{ minWidth: 0, mr: 1 }}>
                                            <Typography variant="body2" fontWeight="medium" noWrap>{discount.productName || discount.name}</Typography>
                                            <Typography variant="caption" sx={{
                                                bgcolor: '#e3f2fd', color: '#1565c0', px: 0.8, py: 0.1, borderRadius: 1, fontWeight: 'bold'
                                            }}>
                                                {discount.discountPercentage}% OFF
                                            </Typography>
                                        </Box>
                                    </Box>
                                ))
                            )}
                        </Box>
                    </Paper>
                </Grid>

                {/* Active Coupons Section */}
                <Grid item xs={12} lg={4}>
                    <Paper
                        elevation={0}
                        onClick={() => navigate('/admin/cupones')}
                        sx={{
                            p: 0,
                            border: '1px solid #e0e0e0',
                            borderRadius: 4,
                            overflow: 'hidden',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            '&:hover': {
                                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                                borderColor: 'success.main'
                            }
                        }}
                    >
                        <Box sx={{ p: 2.5, borderBottom: '1px solid #f0f0f0', bgcolor: '#fafafa', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <CouponIcon color="success" fontSize="small" />
                                <Typography variant="subtitle1" fontWeight="bold" color="textPrimary">
                                    Cupones Activos
                                </Typography>
                            </Box>
                            <ArrowRightIcon color="action" />
                        </Box>
                        <Box sx={{ p: 0, flexGrow: 1, maxHeight: 200, overflowY: 'auto' }}>
                            {coupons.length === 0 ? (
                                <Box sx={{ p: 4, textAlign: 'center' }}>
                                    <Typography variant="body2" color="textSecondary">Sin cupones activos.</Typography>
                                </Box>
                            ) : (
                                coupons.map((coupon, index) => (
                                    <Box key={coupon.id} sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        p: 2,
                                        borderBottom: index !== coupons.length - 1 ? '1px solid #f0f0f0' : 'none',
                                    }}>
                                        <Box>
                                            <Typography variant="body2" fontWeight="bold" sx={{ fontFamily: 'monospace', letterSpacing: 1 }}>
                                                {coupon.code}
                                            </Typography>
                                            <Typography variant="caption" color="textSecondary">
                                                {coupon.discount_type === 'percentage' ? `${coupon.discount_value}% OFF` : `S/ ${coupon.discount_value}`}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            {/* Info Stats (Hidden on very small screens?) Keep it simple */}
                                            <Box sx={{ textAlign: 'right', mr: 1, display: { xs: 'none', sm: 'block' } }}>
                                                <Typography variant="caption" display="block" color="textSecondary">Usos</Typography>
                                                <Typography variant="body2" fontWeight="bold">{coupon.times_used}</Typography>
                                            </Box>
                                        </Box>
                                    </Box>
                                ))
                            )}
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            {/* Dialogo de Reabastecimiento */}
            <Dialog
                open={restockDialog.open}
                onClose={handleCloseRestock}
                PaperProps={{ sx: { borderRadius: 3, width: '100%', maxWidth: 400 } }}
            >
                <DialogTitle sx={{ pb: 1 }}>Reabastecer Producto</DialogTitle>
                <DialogContent>
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="textSecondary">Producto seleccionado:</Typography>
                        <Typography variant="subtitle1" fontWeight="bold">{restockDialog.productName}</Typography>
                    </Box>
                    <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 2, mb: 2, display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Stock Actual:</Typography>
                        <Typography variant="body2" fontWeight="bold">{restockDialog.currentStock} unidades</Typography>
                    </Box>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Cantidad a agregar"
                        type="number"
                        fullWidth
                        variant="outlined"
                        value={restockAmount}
                        onChange={(e) => setRestockAmount(e.target.value)}
                        placeholder="Ej. 10"
                        onKeyDown={(e) => {
                            if (['e', 'E', '+', '-', '.'].includes(e.key)) {
                                e.preventDefault();
                            }
                        }}
                        InputProps={{ inputProps: { min: 1, step: 1 } }}
                    />
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button onClick={handleCloseRestock} color="inherit">Cancelar</Button>
                    <Button
                        onClick={handleRestockSubmit}
                        variant="contained"
                        color="primary"
                        disableElevation
                        sx={{ borderRadius: 2 }}
                    >
                        Confirmar
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Dashboard;
