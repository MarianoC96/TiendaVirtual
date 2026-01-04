import React, { useState, useEffect } from "react";
import {
  Box, Container, Typography, Grid, Card, CardContent, CardMedia,
  Button, IconButton, Divider, Paper, RadioGroup, FormControlLabel, Radio, Alert,
  TextField, InputAdornment
} from "@mui/material";
import { Add, Remove, Delete, ArrowBack, LocalOffer } from "@mui/icons-material";
import axios from 'axios';
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";

const Cart = () => {
  const { cartItems, removeItem, updateQuantity, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const theme = useTheme();
  const navigate = useNavigate();

  const [paymentMethod, setPaymentMethod] = useState('Yape');

  // Coupon State
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  // Reset coupon when cart items change
  useEffect(() => {
    if (appliedCoupon) {
      setAppliedCoupon(null);
      // Optional: Notify user or just let it be silent as requested "have to enter again"
    }
  }, [cartItems]);

  if (cartItems.length === 0) {
    return (
      <Box sx={{ py: 8, minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <Typography variant="h4" color="text.secondary" gutterBottom>
            Tu carrito está vacío
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            ¡Parece que aún no has agregado productos!
          </Typography>
          <Button
            component={Link}
            to="/productos"
            variant="contained"
            color="primary"
            size="large"
            sx={{ mt: 2 }}
          >
            Explorar Productos
          </Button>
        </Container>
      </Box>
    );
  }

  const handleApplyCoupon = async () => {
    setCouponLoading(true);
    setCouponError('');
    setAppliedCoupon(null);

    try {
      const response = await axios.post('http://localhost:3001/api/coupons/verify', {
        code: couponCode,
        cartItems: cartItems,
        userId: user ? user.id : null
      });

      if (response.data.valid) {
        setAppliedCoupon(response.data);
      }
    } catch (error) {
      console.error(error);
      setCouponError(error.response?.data?.message || 'Error al validar cupón');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
  };

  const finalTotal = appliedCoupon ? cartTotal - appliedCoupon.discount_amount : cartTotal;

  const handleWhatsAppOrder = async () => {
    // 1. Save Order to Database
    try {
      await axios.post('http://localhost:3001/api/orders', {
        userId: user ? user.id : null,
        items: cartItems,
        total: finalTotal, // Use final total
        paymentMethod: paymentMethod,
        shippingAddress: "Coordinar por WhatsApp",
        couponCode: appliedCoupon ? appliedCoupon.code : null,
        couponDiscount: appliedCoupon ? appliedCoupon.discount_amount : 0
      });
    } catch (error) {
      console.error("Error creating order:", error);
      alert("Hubo un error al registrar el pedido en el sistema, pero continuaremos con la solicitud por WhatsApp.");
    }

    // 2. Redirect to WhatsApp
    const storePhoneNumber = "51982764140";
    let message = `Hola, quiero realizar un pedido:\n\n`;

    cartItems.forEach(item => {
      message += `- ${item.name} (x${item.quantity}) - S/. ${(item.price * item.quantity).toFixed(2)}\n`;
    });

    if (appliedCoupon) {
      message += `\n*Cupón aplicado:* ${appliedCoupon.code} (${appliedCoupon.name})`;
      if (appliedCoupon.affected_items && appliedCoupon.affected_items.length > 0) {
        message += `\n*Aplica a:* ${appliedCoupon.affected_items.join(', ')}`;
      }
      message += `\n*Descuento:* -S/. ${Number(appliedCoupon.discount_amount).toFixed(2)}`;
    }

    message += `\n\n*Total a Pagar: S/. ${finalTotal.toFixed(2)}*\n`;
    message += `*Método de Pago Seleccionado: ${paymentMethod}*\n`;
    if (user) {
      message += `*Cliente Usuario:* ${user.name}\n`;
    }

    const whatsappUrl = `https://wa.me/${storePhoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');

    // 3. Clear Cart
    clearCart();
  };

  return (
    <Box sx={{ py: 6, backgroundColor: theme.palette.background.default, minHeight: '80vh' }}>
      <Container maxWidth="lg">
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
          sx={{ mb: 3 }}
        >
          Seguir Comprando
        </Button>

        <Typography variant="h3" fontWeight="bold" sx={{ mb: 4, color: theme.palette.primary.main }}>
          Tu Carrito de Compras
        </Typography>

        <Grid container spacing={4}>
          {/* Left Side: Product List */}
          <Grid item xs={12} md={7}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {cartItems.map((item) => (
                <Card key={item.id} sx={{ display: 'flex', borderRadius: 2, overflow: 'hidden' }}>
                  <Box sx={{
                    width: 120,
                    height: 120,
                    minWidth: 120,
                    p: 1,
                    bgcolor: '#f9f9f9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <CardMedia
                      component="img"
                      sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        mixBlendMode: 'multiply'
                      }}
                      image={(item.images && item.images.length > 0) ? item.images[0] : "https://via.placeholder.com/150"}
                      alt={item.name}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                    <CardContent sx={{ flex: '1 0 auto', display: 'flex', justifyContent: 'space-between', pb: 0 }}>
                      <Box>
                        <Typography component="div" variant="h6" fontWeight="bold">
                          {item.name}
                        </Typography>
                        <Typography variant="subtitle2" color="text.secondary" component="div">
                          S/ {item.price}
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="h6" color="primary" fontWeight="bold">
                          S/ {(item.price * item.quantity).toFixed(2)}
                        </Typography>
                      </Box>
                    </CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', pl: 2, pb: 1, pr: 2, justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', border: '1px solid #e0e0e0', borderRadius: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <Remove fontSize="small" />
                        </IconButton>
                        <Typography sx={{ mx: 2, minWidth: 20, textAlign: 'center' }}>{item.quantity}</Typography>
                        <IconButton
                          size="small"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.stock <= item.quantity}
                        >
                          <Add fontSize="small" />
                        </IconButton>
                      </Box>
                      <IconButton
                        color="error"
                        onClick={() => removeItem(item.id)}
                        size="small"
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  </Box>
                </Card>
              ))}
            </Box>
          </Grid>

          {/* Right Side: Summary and Payment Methods */}
          <Grid item xs={12} md={5}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                Resumen del Pedido
              </Typography>
              <
                Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography color="text.secondary">Subtotal</Typography>
                <Typography variant="h6" fontWeight="bold">
                  S/ {cartTotal.toFixed(2)}
                </Typography>
              </Box>

              {/* Coupon Section */}
              <Box sx={{ my: 3 }}>
                {!appliedCoupon ? (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      size="small"
                      fullWidth
                      label="Código de cupón"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      InputProps={{
                        startAdornment: <InputAdornment position="start"><LocalOffer fontSize="small" /></InputAdornment>
                      }}
                    />
                    <Button
                      variant="outlined"
                      onClick={handleApplyCoupon}
                      disabled={!couponCode || couponLoading}
                    >
                      Aplicar
                    </Button>
                  </Box>
                ) : (
                  <Alert severity="success" onClose={handleRemoveCoupon}>
                    Cupón <strong>{appliedCoupon.code}</strong> aplicado: -S/ {Number(appliedCoupon.discount_amount).toFixed(2)}
                  </Alert>
                )}
                {couponError && <Typography color="error" variant="caption" sx={{ mt: 1, display: 'block' }}>{couponError}</Typography>}
              </Box>

              {appliedCoupon && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, color: 'success.main' }}>
                  <Typography>Descuento</Typography>
                  <Typography fontWeight="bold">-S/ {Number(appliedCoupon.discount_amount).toFixed(2)}</Typography>
                </Box>
              )}

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography color="text.secondary" variant="h6">Total a Pagar</Typography>
                <Typography variant="h4" fontWeight="bold" color="primary">
                  S/ {finalTotal.toFixed(2)}
                </Typography>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Método de Pago
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Selecciona tu forma de pago preferida:
              </Typography>

              <RadioGroup
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {['Yape', 'Plin', 'Transferencia Bancaria'].map((method) => (
                    <Paper
                      key={method}
                      variant="outlined"
                      sx={{
                        p: 1,
                        borderColor: paymentMethod === method ? theme.palette.primary.main : 'divider',
                        bgcolor: paymentMethod === method ? 'rgba(25, 118, 210, 0.04)' : 'transparent',
                        transition: 'all 0.2s',
                        borderRadius: 2
                      }}
                    >
                      <FormControlLabel
                        value={method}
                        control={<Radio />}
                        label={method}
                        sx={{ width: '100%', m: 0 }}
                      />
                    </Paper>
                  ))}
                </Box>
              </RadioGroup>

              <Alert severity="info" sx={{ mt: 3, mb: 3 }}>
                Serás redirigido a WhatsApp para completar tu pedido con un asesor.
              </Alert>

              <Button
                variant="contained"
                fullWidth
                size="large"
                sx={{ py: 2, fontSize: '1.2rem', fontWeight: 'bold' }}
                onClick={handleWhatsAppOrder}
              >
                Solicitar
              </Button>

              <Button
                variant="outlined"
                fullWidth
                size="small"
                sx={{ mt: 2 }}
                onClick={clearCart}
              >
                Vaciar Carrito
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Cart;
