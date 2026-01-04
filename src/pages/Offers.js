import React, { useState, useEffect } from "react";
import { Box, Container, Typography, Grid, CircularProgress } from "@mui/material";
import axios from "axios";
import ProductCard from "../components/ProductCard";
import { LocalOffer } from "@mui/icons-material";

const Offers = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOffers();
    }, []);

    const fetchOffers = async () => {
        try {
            const { data } = await axios.get("http://localhost:3001/api/products");
            // Filtrar solo productos con descuento activo y mapear
            const now = new Date();

            const offers = data
                .filter(p => p.discount_percentage > 0)
                .filter(p => {
                    // Check if discount is expired
                    if (!p.discount_end_date) return true;
                    return new Date(p.discount_end_date) > now;
                })
                .map(p => ({
                    id: p.id,
                    name: p.name,
                    category: p.category_name || "General",
                    shortDescription: p.description?.substring(0, 100) + (p.description?.length > 100 ? '...' : ''),
                    rating: 5.0,
                    reviewCount: 0,
                    price: (p.price * (1 - p.discount_percentage / 100)).toFixed(2),
                    originalPrice: p.price,
                    discount: p.discount_percentage,
                    inStock: p.stock > 0,
                    stock: p.stock,
                    discountEndTime: p.discount_end_date,
                    images: [p.image_url]
                }));
            setProducts(offers);
        } catch (error) {
            console.error("Error fetching offers:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ py: 4, minHeight: '80vh', backgroundColor: '#f4f6f8' }}>
            <Container maxWidth="lg">
                <Box sx={{ mb: 6, textAlign: 'center' }}>
                    <Box
                        sx={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 1,
                            mb: 2,
                            px: 3,
                            py: 1,
                            backgroundColor: "secondary.main",
                            borderRadius: "50px",
                            color: "white",
                        }}
                    >
                        <LocalOffer sx={{ fontSize: 20 }} />
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            Ofertas por Tiempo Limitado
                        </Typography>
                    </Box>

                    <Typography variant="h3" component="h1" fontWeight="bold" sx={{ mb: 2, color: '#1a237e' }}>
                        Mejores Descuentos
                    </Typography>
                    <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
                        Aprovecha nuestras ofertas exclusivas antes de que se agoten.
                    </Typography>
                </Box>

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                        <CircularProgress color="primary" />
                    </Box>
                ) : products.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                        <Typography variant="h5" color="text.secondary">
                            No hay ofertas disponibles en este momento.
                        </Typography>
                    </Box>
                ) : (
                    <Grid container spacing={3}>
                        {products.map((product) => (
                            <Grid item xs={12} sm={6} md={4} key={product.id}>
                                <ProductCard product={product} />
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Container>
        </Box>
    );
};

export default Offers;
