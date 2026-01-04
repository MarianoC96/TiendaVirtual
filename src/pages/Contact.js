import React, { useState } from "react";
import { Box, Container, Typography, Grid, TextField, Button, Paper, Alert } from "@mui/material";
import { Send, Email, Phone, LocationOn } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";

const Contact = () => {
  const theme = useTheme();
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    // Aquí iría la lógica de envío real
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <Box sx={{
      py: 10,
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center'
    }}>
      <Container maxWidth="lg">
        <Paper
          elevation={10}
          sx={{
            borderRadius: 4,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            minHeight: '600px'
          }}
        >
          {/* Panel de Información (Izquierda) */}
          <Box sx={{
            bgcolor: '#1a237e',
            width: { xs: '100%', md: '40%' },
            p: 6,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #0d47a1 0%, #1a237e 100%)',
            color: 'white',
            position: 'relative'
          }}>
            <Typography variant="h4" fontWeight="800" gutterBottom sx={{ mb: 1, textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
              Hablemos
            </Typography>
            <Typography variant="body1" sx={{ mb: 6, opacity: 0.9, lineHeight: 1.6 }}>
              Estamos listos para escucharte. Envíanos tus dudas o comentarios y te responderemos a la brevedad.
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 5 }}>
              <Email sx={{ mr: 2, mt: 0.5, color: '#4fc3f7' }} />
              <Box>
                <Typography variant="subtitle2" sx={{ opacity: 0.7 }}>Correo Electrónico</Typography>
                <Typography variant="body1" fontWeight="500">soporte@tiendaonline.com</Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 5 }}>
              <Phone sx={{ mr: 2, mt: 0.5, color: '#4fc3f7' }} />
              <Box>
                <Typography variant="subtitle2" sx={{ opacity: 0.7 }}>Teléfono</Typography>
                <Typography variant="body1" fontWeight="500">+52 55 1234 5678</Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
              <LocationOn sx={{ mr: 2, mt: 0.5, color: '#4fc3f7' }} />
              <Box>
                <Typography variant="subtitle2" sx={{ opacity: 0.7 }}>Oficina</Typography>
                <Typography variant="body1" fontWeight="500">Av. Reforma 222, CDMX</Typography>
              </Box>
            </Box>

            {/* Círculos decorativos */}
            <Box sx={{ position: 'absolute', top: -50, left: -50, width: 150, height: 150, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.05)' }} />
            <Box sx={{ position: 'absolute', bottom: -50, right: -50, width: 200, height: 200, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.05)' }} />
          </Box>

          {/* Formulario (Derecha) */}
          <Box sx={{
            width: { xs: '100%', md: '60%' },
            p: { xs: 4, md: 8 },
            bgcolor: 'white'
          }}>
            <Typography variant="h5" fontWeight="bold" sx={{ mb: 1, color: '#333' }}>
              Envíanos un mensaje
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
              Todos los campos marcados con * son obligatorios.
            </Typography>

            {submitted ? (
              <Alert severity="success" sx={{ mb: 3 }}>
                ¡Mensaje enviado con éxito!
              </Alert>
            ) : null}

            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Nombre Completo"
                    required
                    variant="outlined"
                    placeholder="Ej. Juan Pérez"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Correo Electrónico"
                    type="email"
                    required
                    variant="outlined"
                    placeholder="tu@email.com"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Asunto"
                    variant="outlined"
                    placeholder="¿En qué podemos ayudarte?"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Tu Mensaje"
                    required
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sx={{ mt: 2 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    endIcon={<Send />}
                    sx={{
                      py: 1.8,
                      px: 6,
                      borderRadius: 50,
                      fontWeight: 'bold',
                      textTransform: 'none',
                      fontSize: '1rem',
                      boxShadow: '0 8px 16px rgba(26, 35, 126, 0.2)',
                      background: 'linear-gradient(45deg, #1a237e 30%, #534bae 90%)'
                    }}
                  >
                    Enviar Mensaje
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Contact;
