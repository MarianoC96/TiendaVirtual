import React, { useState, useEffect } from "react";
import { Box, Container, Typography, Grid, CircularProgress, TextField, InputAdornment, Chip } from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import axios from "axios";
import ProductCard from "../components/ProductCard";
import { useLocation } from "react-router-dom";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const categorySlug = queryParams.get("categoria");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        axios.get("http://localhost:3001/api/products"),
        axios.get("http://localhost:3001/api/categories")
      ]);

      setCategories(categoriesRes.data);

      const mappedProducts = productsRes.data.map(p => ({
        id: p.id,
        category_id: p.category_id,
        name: p.name,
        category: p.category_name || "General",
        category_slug: p.category_slug,
        shortDescription: p.description?.substring(0, 100) + (p.description?.length > 100 ? '...' : ''),
        rating: 5.0,
        reviewCount: 0,
        price: p.discount_percentage
          ? (p.price * (1 - p.discount_percentage / 100)).toFixed(2)
          : p.price,
        originalPrice: p.price,
        discount: p.discount_percentage || 0,
        inStock: p.stock > 0,
        stock: p.stock,
        discountEndTime: p.discount_end_date,
        images: [p.image_url]
      }));
      setProducts(mappedProducts);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categorySlug ? product.category_slug === categorySlug : true;
    return matchesSearch && matchesCategory;
  });

  const currentCategoryName = categorySlug
    ? products.find(p => p.category_slug === categorySlug)?.category
    : null;

  // View: Category Carousel Showcase (Default when no filter)
  const renderCategoryShowcase = () => (
    <Box sx={{ pb: 8 }}>
      {categories.map((cat, index) => {
        // Filter products for this specific category showcase
        const catProducts = products.filter(p => p.category_id === cat.id);
        if (catProducts.length === 0) return null;

        // We show all, but the container scrolls
        const displayProducts = catProducts.slice(0, 8);

        const isAlternate = index % 2 !== 0;

        return (
          <Box
            key={cat.id}
            sx={{
              py: 8,
              backgroundColor: isAlternate ? '#ffffff' : 'transparent',
              borderTop: '1px solid',
              borderBottom: '1px solid',
              borderColor: 'divider',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Background Decoration */}
            <Box sx={{
              position: 'absolute',
              top: 0, right: 0, width: '300px', height: '100%',
              background: isAlternate
                ? 'radial-gradient(circle at center, rgba(213,0,0,0.03) 0%, rgba(255,255,255,0) 70%)'
                : 'radial-gradient(circle at center, rgba(33,33,33,0.03) 0%, rgba(244,246,248,0) 70%)',
              zIndex: 0
            }} />

            <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', mb: 4, px: 2 }}>
                <Box>
                  <Typography variant="overline" color="secondary" fontWeight="bold" letterSpacing={2}>
                    {isAlternate ? 'DESTACADOS' : 'COLECCIÓN'}
                  </Typography>
                  <Typography variant="h3" fontWeight="800" sx={{ color: 'text.primary', textTransform: 'uppercase' }}>
                    {cat.name}
                  </Typography>
                </Box>
                <Chip
                  label="Ver Todo"
                  component="a"
                  href={`/productos?categoria=${cat.slug}`}
                  clickable
                  sx={{ fontWeight: 'bold' }}
                />
              </Box>

              {/* Horizontal Scroll Snap Container */}
              <Box sx={{
                display: 'flex',
                gap: 3,
                overflowX: 'auto',
                pb: 4, // Space for shadow
                pt: 1, // Space for shadow
                px: 2,
                scrollSnapType: 'x mandatory',
                '&::-webkit-scrollbar': { height: 8 },
                '&::-webkit-scrollbar-thumb': { backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: 4 },
                '&::-webkit-scrollbar-track': { backgroundColor: 'transparent' }
              }}>
                {displayProducts.map((product) => (
                  <Box
                    key={product.id}
                    sx={{
                      minWidth: { xs: '280px', md: '320px' },
                      maxWidth: { xs: '280px', md: '320px' },
                      scrollSnapAlign: 'start'
                    }}
                  >
                    <ProductCard product={product} />
                  </Box>
                ))}
              </Box>
            </Container>
          </Box>
        );
      })}
    </Box>
  );

  return (
    <Box sx={{ minHeight: '80vh', backgroundColor: '#f4f6f8' }}>
      {/* Header Section */}
      <Box sx={{
        py: 8,
        textAlign: 'center',
        background: 'linear-gradient(180deg, #ffffff 0%, #f4f6f8 100%)',
        borderBottom: '1px solid rgba(0,0,0,0.05)'
      }}>
        <Container maxWidth="lg">
          <Typography variant="h2" component="h1" fontWeight="900" sx={{ mb: 2, color: 'primary.main', letterSpacing: '-1px' }}>
            {categorySlug ? `Categoría: ${currentCategoryName}` : 'NUESTRO CATÁLOGO'}
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto', mb: 4, fontWeight: 'normal' }}>
            {categorySlug
              ? `Explorando la colección de ${currentCategoryName}`
              : 'Descubre nuestra selección exclusiva de productos premium.'}
          </Typography>

          {categorySlug && (
            <Chip
              label="← Ver todas las categorías"
              onClick={() => window.location.href = "/productos"}
              sx={{ mb: 3, cursor: 'pointer', fontWeight: 'bold' }}
            />
          )}

          <TextField
            fullWidth
            variant="outlined"
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{
              maxWidth: 600,
              bgcolor: 'white',
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
              '& fieldset': { border: 'none' }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
        </Container>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress color="primary" />
        </Box>
      ) : (
        <>
          {/* Show Grid if Searching OR Filtering by Category */}
          {(categorySlug || searchTerm) ? (
            <Container maxWidth="xl" sx={{ py: 6 }}>
              <Grid container spacing={3}>
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                      <ProductCard product={product} />
                    </Grid>
                  ))
                ) : (
                  <Box sx={{ width: '100%', textAlign: 'center', py: 8 }}>
                    <Typography variant="h6" color="text.secondary">
                      No se encontraron productos.
                    </Typography>
                  </Box>
                )}
              </Grid>
            </Container>
          ) : (
            /* Default Showcase View */
            renderCategoryShowcase()
          )}
        </>
      )}
    </Box>
  );
};

export default Products;
