import React from 'react';
import { Box, Typography, Button, Container, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Hero = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        bgcolor: '#f5f5f5',
        pt: 8,
        pb: 6,
        background: 'linear-gradient(45deg, #1a237e 30%, #283593 90%)',
        color: 'white',
        minHeight: '400px',
        display: 'flex',
        alignItems: 'center'
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography
              component="h1"
              variant="h2"
              align="left"
              color="inherit"
              gutterBottom
              sx={{ fontWeight: 'bold' }}
            >
              Lo mejor en tecnología
              <br />
              al mejor precio
            </Typography>
            <Typography variant="h5" align="left" color="inherit" paragraph sx={{ opacity: 0.9 }}>
              Encuentra las últimas novedades en smartphones, laptops y accesorios.
              Envíos a todo el país.
            </Typography>
            <Box sx={{ mt: 4 }}>
              <Button
                variant="contained"
                color="secondary"
                size="large"
                onClick={() => navigate('/productos')}
                sx={{
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  borderRadius: '50px',
                  fontWeight: 'bold',
                  boxShadow: '0 4px 14px 0 rgba(0,0,0,0.39)'
                }}
              >
                Ver Productos
              </Button>
            </Box>
          </Grid>
          <Grid item xs={12} md={6} sx={{ display: { xs: 'none', md: 'block' } }}>
            <Box
              component="img"
              src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80"
              alt="Technology Banner"
              sx={{
                width: '100%',
                maxWidth: '500px',
                borderRadius: '20px',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                transform: 'perspective(1000px) rotateY(-5deg)',
                transition: 'transform 0.3s ease-in-out',
                '&:hover': {
                  transform: 'perspective(1000px) rotateY(0deg) scale(1.02)'
                }
              }}
            />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Hero;
