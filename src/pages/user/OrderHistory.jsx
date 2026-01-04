import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Button, Container, Grid } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
// import { ordersData } from '../../data/adminMockData';
import { useAuth } from '../../context/AuthContext';


const OrderHistory = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        if (user) {
            fetchOrders();
        }
    }, [user]);

    const fetchOrders = async () => {
        try {
            const res = await axios.get(`http://localhost:3001/api/orders/user/${user.id}`);
            setOrders(res.data);
        } catch (error) {
            console.error('Error fetching orders:', error);
        }
    };

    const myOrders = orders;

    const getStatusColor = (status) => {
        switch (status) {
            case 'delivered': return 'success';
            case 'shipped': return 'info';
            case 'processing': return 'warning';
            case 'cancelled': return 'error';
            default: return 'default';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'delivered': return 'Entregado';
            case 'shipped': return 'Enviado';
            case 'processing': return 'Procesando';
            case 'cancelled': return 'Cancelado';
            default: return status;
        }
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ mb: 4 }}>Historial de Pedidos</Typography>

            {myOrders.length === 0 ? (
                <Paper sx={{ p: 5, textAlign: 'center' }}>
                    <Typography variant="h6" color="textSecondary">No has realizado ningún pedido aún.</Typography>
                    <Button variant="contained" color="primary" sx={{ mt: 2 }} href="/productos">Ir a comprar</Button>
                </Paper>
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                                <TableCell>ID Pedido</TableCell>
                                <TableCell>Fecha</TableCell>
                                <TableCell>Artículos</TableCell>
                                <TableCell>Total</TableCell>
                                <TableCell>Estado</TableCell>
                                <TableCell align="right">Detalles</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {myOrders.map((order) => (
                                <TableRow key={order.id} hover>
                                    <TableCell sx={{ fontWeight: 'bold' }}>#{order.id}</TableCell>
                                    <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        {order.items.length} producto(s)
                                        <Typography variant="caption" display="block" color="textSecondary">
                                            {order.items[0].productName} {order.items.length > 1 && `+ ${order.items.length - 1} más`}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>S/ {order.total}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={getStatusLabel(order.status)}
                                            color={getStatusColor(order.status)}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        <Button
                                            startIcon={<VisibilityIcon />}
                                            size="small"
                                            variant="outlined"
                                        >
                                            Ver
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Container>
    );
};

export default OrderHistory;
