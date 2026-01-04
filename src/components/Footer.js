import React from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  IconButton,
  Divider,
  useTheme,
} from "@mui/material";
import {
  Facebook,
  Instagram,
  Twitter,
  LinkedIn,
  Email,
  Phone,
  LocationOn,
  ArrowUpward,
} from "@mui/icons-material";

const Footer = () => {
  const theme = useTheme();

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <Box
      component="footer"
      sx={{
        background: "linear-gradient(135deg, #212121 0%, #424242 100%)",
        color: "white",
        mt: "auto",
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Cpath d='m0 40l40-40h-40z'/%3E%3C/g%3E%3C/svg%3E")`,
        },
      }}
    >
      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
        <Box sx={{ py: 6 }}>
          <Grid container spacing={4}>
            {/* Información de la empresa */}
            <Grid item xs={12} md={4}>
              <Box sx={{ mb: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    mb: 2,
                  }}
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      background: "linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%)",
                      borderRadius: "12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mr: 2,
                      boxShadow: "0 4px 12px rgba(46, 125, 50, 0.3)",
                    }}
                  >
                    <Typography
                      sx={{
                        color: "white",
                        fontWeight: 900,
                        fontSize: "1.2rem",
                      }}
                    >
                      T
                    </Typography>
                  </Box>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                      background: "linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%)",
                      backgroundClip: "text",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    TiendaOnline
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  sx={{
                    opacity: 0.8,
                    lineHeight: 1.6,
                    mb: 3,
                  }}
                >
                  Tu tienda online de confianza. Ofrecemos productos de alta calidad
                  con la mejor atención al cliente y precios competitivos.
                </Typography>

                {/* Redes sociales */}
                <Box sx={{ display: "flex", gap: 1 }}>
                  <IconButton
                    sx={{
                      color: "white",
                      backgroundColor: "rgba(255,255,255,0.1)",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        backgroundColor: "#1877F2",
                        transform: "translateY(-2px)",
                      },
                    }}
                  >
                    <Facebook />
                  </IconButton>
                  <IconButton
                    sx={{
                      color: "white",
                      backgroundColor: "rgba(255,255,255,0.1)",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        backgroundColor: "#E4405F",
                        transform: "translateY(-2px)",
                      },
                    }}
                  >
                    <Instagram />
                  </IconButton>
                  <IconButton
                    sx={{
                      color: "white",
                      backgroundColor: "rgba(255,255,255,0.1)",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        backgroundColor: "#1DA1F2",
                        transform: "translateY(-2px)",
                      },
                    }}
                  >
                    <Twitter />
                  </IconButton>
                  <IconButton
                    sx={{
                      color: "white",
                      backgroundColor: "rgba(255,255,255,0.1)",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        backgroundColor: "#0077B5",
                        transform: "translateY(-2px)",
                      },
                    }}
                  >
                    <LinkedIn />
                  </IconButton>
                </Box>
              </Box>
            </Grid>

            {/* Enlaces rápidos */}
            <Grid item xs={12} sm={6} md={2}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  mb: 2,
                  color: theme.palette.secondary.main,
                }}
              >
                Enlaces Rápidos
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Link
                  component={RouterLink}
                  to="/"
                  sx={{ color: "white", textDecoration: "none", opacity: 0.8, "&:hover": { opacity: 1, color: theme.palette.secondary.main } }}
                >
                  Inicio
                </Link>
                <Link
                  component={RouterLink}
                  to="/productos"
                  sx={{ color: "white", textDecoration: "none", opacity: 0.8, "&:hover": { opacity: 1, color: theme.palette.secondary.main } }}
                >
                  Productos
                </Link>
                <Link
                  component={RouterLink}
                  to="/ofertas"
                  sx={{ color: "white", textDecoration: "none", opacity: 0.8, "&:hover": { opacity: 1, color: theme.palette.secondary.main } }}
                >
                  Ofertas
                </Link>
                <Link
                  component={RouterLink}
                  to="/contacto"
                  sx={{ color: "white", textDecoration: "none", opacity: 0.8, "&:hover": { opacity: 1, color: theme.palette.secondary.main } }}
                >
                  Contacto
                </Link>
                <Link
                  component={RouterLink}
                  to="/acerca"
                  sx={{ color: "white", textDecoration: "none", opacity: 0.8, "&:hover": { opacity: 1, color: theme.palette.secondary.main } }}
                >
                  Acerca de
                </Link>
              </Box>
            </Grid>

            {/* Atención al cliente */}
            <Grid item xs={12} sm={6} md={2}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  mb: 2,
                  color: theme.palette.secondary.main,
                }}
              >
                Cuenta
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Link
                  component={RouterLink}
                  to="/login"
                  sx={{ color: "white", textDecoration: "none", opacity: 0.8, "&:hover": { opacity: 1, color: theme.palette.secondary.main } }}
                >
                  Iniciar Sesión
                </Link>
                <Link
                  component={RouterLink}
                  to="/registro"
                  sx={{ color: "white", textDecoration: "none", opacity: 0.8, "&:hover": { opacity: 1, color: theme.palette.secondary.main } }}
                >
                  Registrarse
                </Link>
              </Box>
            </Grid>

            {/* Información de contacto */}
            <Grid item xs={12} md={4}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  mb: 2,
                  color: theme.palette.secondary.main,
                }}
              >
                Contacto
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <LocationOn sx={{ color: theme.palette.primary.main }} />
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    123 Calle Principal, Ciudad, País
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Phone sx={{ color: theme.palette.primary.main }} />
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    +1 (555) 123-4567
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Email sx={{ color: theme.palette.primary.main }} />
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    info@tiendaonline.com
                  </Typography>
                </Box>
              </Box>

              {/* Newsletter */}
              <Box sx={{ mt: 3 }}>
                <Typography
                  variant="body2"
                  sx={{
                    mb: 2,
                    opacity: 0.9,
                    fontWeight: 500,
                  }}
                >
                  Suscríbete a nuestro newsletter
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    gap: 1,
                    flexDirection: { xs: "column", sm: "row" },
                  }}
                >
                  <Box
                    component="input"
                    placeholder="Tu email"
                    sx={{
                      flex: 1,
                      p: 1.5,
                      borderRadius: "10px",
                      border: "1px solid rgba(255,255,255,0.3)",
                      backgroundColor: "rgba(255,255,255,0.1)",
                      color: "white",
                      "&::placeholder": {
                        color: "rgba(255,255,255,0.7)",
                      },
                      "&:focus": {
                        outline: "none",
                        borderColor: theme.palette.primary.main,
                      },
                    }}
                  />
                  <Box
                    component="button"
                    sx={{
                      px: 2,
                      py: 1.5,
                      backgroundColor: theme.palette.primary.main,
                      color: "white",
                      border: "none",
                      borderRadius: "10px",
                      cursor: "pointer",
                      fontWeight: 600,
                      transition: "all 0.3s ease",
                      "&:hover": {
                        backgroundColor: theme.palette.primary.dark,
                        transform: "translateY(-1px)",
                      },
                    }}
                  >
                    Suscribirse
                  </Box>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ borderColor: "rgba(255,255,255,0.1)" }} />

        {/* Copyright */}
        <Box
          sx={{
            py: 3,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexDirection: { xs: "column", md: "row" },
            gap: 2,
          }}
        >
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            © 2024 TiendaOnline. Todos los derechos reservados.
          </Typography>

          <IconButton
            onClick={scrollToTop}
            sx={{
              backgroundColor: theme.palette.primary.main,
              color: "white",
              transition: "all 0.3s ease",
              "&:hover": {
                backgroundColor: theme.palette.primary.dark,
                transform: "translateY(-2px)",
              },
            }}
          >
            <ArrowUpward />
          </IconButton>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
