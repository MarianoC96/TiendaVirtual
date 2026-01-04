import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Chip, FormControl, InputLabel, Select, MenuItem,
    Button, CircularProgress, Alert, Dialog, DialogTitle, DialogContent,
    DialogActions, IconButton, Grid
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const AdminOrdersHistory = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filter states - Default to current month/year
    const currentDate = new Date();
    const [month, setMonth] = useState(currentDate.getMonth() + 1);
    const [year, setYear] = useState(currentDate.getFullYear());
    const [filterStatus, setFilterStatus] = useState('all');

    const months = [
        { value: 1, label: 'Enero' }, { value: 2, label: 'Febrero' }, { value: 3, label: 'Marzo' },
        { value: 4, label: 'Abril' }, { value: 5, label: 'Mayo' }, { value: 6, label: 'Junio' },
        { value: 7, label: 'Julio' }, { value: 8, label: 'Agosto' }, { value: 9, label: 'Septiembre' },
        { value: 10, label: 'Octubre' }, { value: 11, label: 'Noviembre' }, { value: 12, label: 'Diciembre' }
    ];

    // Years for dropdown
    const years = [2026, 2027, 2028, 2029, 2030];

    useEffect(() => {
        fetchOrders();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [month, year]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`http://localhost:3001/api/orders?month=${month}&year=${year}`);
            setOrders(response.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching orders:', err);
            setError('No se pudo cargar el historial de pedidos.');
            setLoading(false);
        }
    };

    const filteredOrders = orders.filter(order => {
        if (filterStatus === 'all') return true;
        return order.status === filterStatus;
    });

    const getStatusSx = (status) => {
        switch (status) {
            case 'cancelled':
                return { bgcolor: '#ffebee', color: '#d32f2f', fontWeight: 'bold' }; // Rojo
            case 'delivered':
                return { bgcolor: '#e8f5e9', color: '#2e7d32', fontWeight: 'bold' }; // Verde
            case 'processing':
                return { bgcolor: '#fffde7', color: '#fbc02d', fontWeight: 'bold' }; // Amarillo (text darker for contrast)
            case 'pending':
                return { bgcolor: '#eeeeee', color: '#616161', fontWeight: 'bold' }; // Dark Grey
            case 'shipped':
                return { bgcolor: '#1ab2ff', color: '#ffffff', fontWeight: 'bold' }; // #1ab2ff (Enviando)
            default:
                return {};
        }
    };

    const handleExportExcel = () => {
        if (orders.length === 0) return;

        // Prepare data for Excel
        const dataToExport = orders.map(order => ({
            'ID Pedido': order.id,
            'Cliente': order.user_name || 'Invitado',
            'Email': order.user_email || '-',
            'Fecha': new Date(order.created_at).toLocaleDateString(),
            'Total (S/)': Number(order.total).toFixed(2),
            'Estado': order.status,
            'Método Pago': order.payment_method,
            'Items': order.items.map(i => `${i.productName} (x${i.quantity})`).join(', ')
        }));

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Pedidos");

        // Generate buffer
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });

        saveAs(data, `Historial_Pedidos_${months.find(m => m.value === month).label}_${year}.xlsx`);
    };

    const [editStatusDialog, setEditStatusDialog] = useState({ open: false, orderId: null, currentStatus: '' });
    const [viewOrderDialog, setViewOrderDialog] = useState({ open: false, order: null });

    const handleOpenEditStatus = (order) => {
        setEditStatusDialog({ open: true, orderId: order.id, currentStatus: order.status });
    };

    const handleCloseEditStatus = () => {
        setEditStatusDialog({ open: false, orderId: null, currentStatus: '' });
    };

    const handleUpdateStatus = async () => {
        try {
            await axios.patch(`http://localhost:3001/api/orders/${editStatusDialog.orderId}/status`, {
                status: editStatusDialog.currentStatus
            });
            fetchOrders();
            handleCloseEditStatus();
        } catch (err) {
            console.error('Error updating status:', err);
            alert('Error al actualizar el estado');
        }
    };

    const handleOpenViewOrder = (order) => {
        setViewOrderDialog({ open: true, order: order });
    };

    const handleCloseViewOrder = () => {
        setViewOrderDialog({ open: false, order: null });
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'pending': return 'Pendiente';
            case 'processing': return 'En Proceso';
            case 'delivered': return 'Entregado';
            case 'shipped': return 'Enviando';
            case 'cancelled': return 'Cancelado';
            default: return status;
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    Historial de Pedidos
                </Typography>

                <Box sx={{ display: 'flex', gap: 2 }}>
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                        <InputLabel>Estado</InputLabel>
                        <Select value={filterStatus} label="Estado" onChange={(e) => setFilterStatus(e.target.value)}>
                            <MenuItem value="all">Todos</MenuItem>
                            <MenuItem value="pending">Pendiente</MenuItem>
                            <MenuItem value="processing">En Proceso</MenuItem>
                            <MenuItem value="shipped">Enviando</MenuItem>
                            <MenuItem value="delivered">Entregado</MenuItem>
                            <MenuItem value="cancelled">Cancelado</MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl size="small" sx={{ minWidth: 120 }}>
                        <InputLabel>Mes</InputLabel>
                        <Select value={month} label="Mes" onChange={(e) => setMonth(e.target.value)}>
                            {months.map(m => (
                                <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl size="small" sx={{ minWidth: 100 }}>
                        <InputLabel>Año</InputLabel>
                        <Select value={year} label="Año" onChange={(e) => setYear(e.target.value)}>
                            {years.map(y => (
                                <MenuItem key={y} value={y}>{y}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <Button
                        variant="contained"
                        color="success"
                        startIcon={<DownloadIcon />}
                        onClick={handleExportExcel}
                        disabled={orders.length === 0}
                    >
                        Exportar Excel
                    </Button>
                </Box>
            </Box>

            {/* Alert for Overdue Pending Orders (> 24 hours) */}
            {filteredOrders.some(o => (o.status === 'pending' || o.status === 'processing') && new Date(o.created_at) < new Date(Date.now() - 24 * 60 * 60 * 1000)) && (
                <Alert severity="warning" sx={{ mb: 3 }}>
                    Atención: Hay pedidos pendientes o en proceso con más de 24 horas de antigüedad. ¡Revísalos!
                </Alert>
            )}

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
                    <CircularProgress />
                </Box>
            ) : error ? (
                <Alert severity="error">{error}</Alert>
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                            <TableRow>
                                <TableCell>ID</TableCell>
                                <TableCell>Cliente</TableCell>
                                <TableCell>Fecha</TableCell>
                                <TableCell>Total</TableCell>
                                <TableCell>Estado</TableCell>
                                <TableCell align="center">Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredOrders.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center">No hay pedidos en este periodo.</TableCell>
                                </TableRow>
                            ) : (
                                filteredOrders.map((order) => {
                                    // Overdue if older than 24 hours
                                    const isOverdue = (order.status === 'pending' || order.status === 'processing') &&
                                        new Date(order.created_at) < new Date(Date.now() - 24 * 60 * 60 * 1000);

                                    return (
                                        <TableRow
                                            key={order.id}
                                            hover
                                            sx={isOverdue ? { backgroundColor: '#ffebee' } : {}}
                                        >
                                            <TableCell>#{order.id}</TableCell>
                                            <TableCell>
                                                <Typography variant="body2" fontWeight="bold">{order.user_name || 'Invitado'}</Typography>
                                                <Typography variant="caption" color="textSecondary">{order.user_email}</Typography>
                                            </TableCell>
                                            <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                                            <TableCell>S/ {Number(order.total).toFixed(2)}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={getStatusLabel(order.status)}
                                                    sx={getStatusSx(order.status)}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell align="center">
                                                <IconButton color="info" onClick={() => handleOpenViewOrder(order)} title="Ver Detalles">
                                                    <VisibilityIcon />
                                                </IconButton>
                                                <IconButton color="primary" onClick={() => handleOpenEditStatus(order)} title="Editar Estado">
                                                    <EditIcon />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    );
                                }))
                            }
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Edit Status Dialog */}
            <Dialog open={editStatusDialog.open} onClose={handleCloseEditStatus}>
                <DialogTitle>Actualizar Estado del Pedido #{editStatusDialog.orderId}</DialogTitle>
                <DialogContent sx={{ minWidth: 300, pt: 2 }}>
                    <FormControl fullWidth margin="dense">
                        <InputLabel>Estado</InputLabel>
                        <Select
                            value={editStatusDialog.currentStatus}
                            label="Estado"
                            onChange={(e) => setEditStatusDialog({ ...editStatusDialog, currentStatus: e.target.value })}
                        >
                            <MenuItem value="pending">Pendiente</MenuItem>
                            <MenuItem value="processing">En Proceso</MenuItem>
                            <MenuItem value="shipped">Enviando</MenuItem>
                            <MenuItem value="delivered">Entregado</MenuItem>
                            <MenuItem value="cancelled">Cancelado</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseEditStatus}>Cancelar</Button>
                    <Button onClick={handleUpdateStatus} variant="contained" color="primary">Guardar</Button>
                </DialogActions>
            </Dialog>

            {/* View Order Dialog */}
            <Dialog open={viewOrderDialog.open} onClose={handleCloseViewOrder} maxWidth="md" fullWidth>
                <DialogTitle>Detalle del Pedido #{viewOrderDialog.order?.id}</DialogTitle>
                <DialogContent dividers>
                    {viewOrderDialog.order && (
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" color="textSecondary">Información del Cliente</Typography>
                                <Typography variant="body1"><strong>Nombre:</strong> {viewOrderDialog.order.user_name || 'Invitado'}</Typography>
                                <Typography variant="body1"><strong>Email:</strong> {viewOrderDialog.order.user_email || '-'}</Typography>
                                <Typography variant="body1"><strong>Dirección:</strong> {viewOrderDialog.order.shipping_address || '-'}</Typography>
                                <Typography variant="body1"><strong>Método de Pago:</strong> {viewOrderDialog.order.payment_method}</Typography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" color="textSecondary">Resumen</Typography>
                                <Typography variant="body1"><strong>Fecha:</strong> {new Date(viewOrderDialog.order.created_at).toLocaleString()}</Typography>
                                <Typography variant="body1"><strong>Estado:</strong> {getStatusLabel(viewOrderDialog.order.status)}</Typography>
                                <Typography variant="h6" color="primary" sx={{ mt: 1 }}>Total: S/ {Number(viewOrderDialog.order.total).toFixed(2)}</Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Productos</Typography>
                                <TableContainer component={Paper} variant="outlined">
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Producto</TableCell>
                                                <TableCell align="right">Cantidad</TableCell>
                                                <TableCell align="right">Precio Unit.</TableCell>
                                                <TableCell align="right">Subtotal</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {viewOrderDialog.order.items.map((item, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>{item.productName}</TableCell>
                                                    <TableCell align="right">{item.quantity}</TableCell>
                                                    <TableCell align="right">S/ {item.price_at_purchase}</TableCell>
                                                    <TableCell align="right">S/ {(item.quantity * item.price_at_purchase).toFixed(2)}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Grid>
                        </Grid>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseViewOrder} variant="contained">Cerrar</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default AdminOrdersHistory;
