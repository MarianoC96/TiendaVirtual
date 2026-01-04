import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  useTheme,
  CircularProgress,
  IconButton,
  useMediaQuery,
  Fade
} from "@mui/material";
import { ArrowForward, LocalOffer, ArrowBack, ArrowForwardIos } from "@mui/icons-material";
import { Link } from "react-router-dom";
import ProductCard from "./ProductCard";
import axios from "axios";

const FeaturedProducts = () => {
  const theme = useTheme();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg'));

  const itemsPerPage = isMobile ? 1 : (isTablet ? 2 : 3);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await axios.get("http://localhost:3001/api/products/best-selling");

        const mappedProducts = data.map(p => ({
          id: p.id,
          category_id: p.category_id,
          name: p.name,
          category: p.category_name || "General",
          shortDescription: p.description?.substring(0, 100) + (p.description?.length > 100 ? '...' : ''),
          rating: 5.0,
          reviewCount: p.total_sold || 0, // Showing detailed sales count as review count for now or just hidden
          price: p.discount_percentage
            ? (p.price * (1 - p.discount_percentage / 100)).toFixed(2)
            : p.price,
          originalPrice: p.price,
          discount: p.discount_percentage || 0,
          inStock: true, // API guarantees stock > 0
          stock: p.stock,
          discountEndTime: p.discount_end_date,
          images: [p.image_url]
        }));
        setFeaturedProducts(mappedProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex + 1 >= featuredProducts.length ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex - 1 < 0 ? featuredProducts.length - 1 : prevIndex - 1
    );
  };

  // Auto-play carousel
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(interval);
  }, [featuredProducts.length]);

  if (loading) {
    return (
      <Box sx={{ py: 8, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Get visible products based on current index and circular logic
  const getVisibleProducts = () => {
    if (featuredProducts.length === 0) return [];
    const products = [];
    for (let i = 0; i < itemsPerPage; i++) {
      const index = (currentIndex + i) % featuredProducts.length;
      products.push(featuredProducts[index]);
    }
    return products;
  };

  return (
    <Box sx={{ py: 8, backgroundColor: "white", overflow: 'hidden' }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ textAlign: "center", mb: 6 }}>
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 1,
              mb: 2,
              px: 3,
              py: 1,
              backgroundColor: theme.palette.primary.main,
              borderRadius: "50px",
              color: "white",
            }}
          >
            <LocalOffer sx={{ fontSize: 20 }} />
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Top Ventas
            </Typography>
          </Box>

          <Typography
            variant="h3"
            component="h2"
            sx={{
              fontWeight: 700,
              mb: 2,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Los Más Vendidos
          </Typography>

          <Typography
            variant="h6"
            color="text.secondary"
            sx={{
              maxWidth: 600,
              mx: "auto",
              lineHeight: 1.6,
            }}
          >
            Nuestros productos favoritos por la comunidad
          </Typography>
        </Box>

        {/* Carousel Container */}
        <Box sx={{ position: 'relative', px: { xs: 0, md: 4 } }}>
          {/* Navigation Buttons */}
          <IconButton
            onClick={prevSlide}
            sx={{
              position: 'absolute',
              left: 0,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 2,
              bgcolor: 'background.paper',
              boxShadow: 3,
              display: { xs: 'none', md: 'flex' },
              '&:hover': { bgcolor: 'primary.light', color: 'white' }
            }}
          >
            <ArrowBack />
          </IconButton>

          <IconButton
            onClick={nextSlide}
            sx={{
              position: 'absolute',
              right: 0,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 2,
              bgcolor: 'background.paper',
              boxShadow: 3,
              display: { xs: 'none', md: 'flex' },
              '&:hover': { bgcolor: 'primary.light', color: 'white' }
            }}
          >
            <ArrowForwardIos sx={{ fontSize: 20 }} />
          </IconButton>

          {/* Products Row */}
          <Box
            sx={{
              display: 'flex',
              gap: 3,
              justifyContent: 'center',
              transition: 'all 0.5s ease-in-out'
            }}
          >
            {getVisibleProducts().map((product, index) => (
              <Box
                key={`${product.id}-${index}`}
                sx={{
                  flex: itemsPerPage === 1 ? '0 0 100%' : (itemsPerPage === 2 ? '0 0 45%' : '0 0 30%'),
                  maxWidth: itemsPerPage === 1 ? '350px' : 'none'
                }}
              >
                <ProductCard product={product} />
              </Box>
            ))}
          </Box>

          {/* Mobile Indicators */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, justifyContent: 'center', mt: 2, gap: 1 }}>
            {featuredProducts.map((_, idx) => (
              <Box
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  bgcolor: idx === currentIndex ? 'primary.main' : 'grey.300',
                  cursor: 'pointer'
                }}
              />
            ))}
          </Box>
        </Box>

        {/* Call to Action */}
        <Box sx={{ textAlign: "center", mt: 6 }}>
          <Button
            component={Link}
            to="/productos"
            variant="contained"
            size="large"
            endIcon={<ArrowForward />}
            sx={{
              px: 4,
              py: 1.5,
              fontSize: "1.1rem",
              fontWeight: 600,
              borderRadius: "50px",
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              boxShadow: "0 4px 12px rgba(2, 119, 189, 0.15)",
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: "0 8px 20px rgba(2, 119, 189, 0.25)",
                background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
              },
            }}
          >
            Ver Catálogo Completo
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default FeaturedProducts;
