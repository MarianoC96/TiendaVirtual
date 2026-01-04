import React, { useState } from "react";
import { Box, Container, Typography, TextField, Button, InputAdornment } from "@mui/material";
import { MailOutline } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";

const Newsletter = () => {
  const theme = useTheme();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <Box sx={{ py: 8, backgroundColor: theme.palette.tertiary ? theme.palette.tertiary.main : '#1a237e', color: 'white' }}>
      <Container maxWidth="md" sx={{ textAlign: "center" }}>
        <MailOutline sx={{ fontSize: 60, mb: 2, opacity: 0.8 }} />
        <Typography variant="h4" fontWeight="bold" sx={{ mb: 2 }}>
          ¡Suscríbete a nuestro Newsletter!
        </Typography>
        <Typography variant="h6" sx={{ mb: 4, opacity: 0.9, fontWeight: 300 }}>
          Recibe las mejores ofertas y novedades directamente en tu correo.
        </Typography>

        {subscribed ? (
          <Box sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
            <Typography variant="h6">¡Gracias por suscribirte!</Typography>
            <Typography variant="body2">Pronto recibirás noticias nuestras.</Typography>
          </Box>
        ) : (
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, justifyContent: 'center' }}>
            <TextField
              variant="outlined"
              placeholder="Tu correo electrónico"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{
                bgcolor: 'white',
                borderRadius: 1,
                width: { xs: '100%', sm: '400px' }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <MailOutline color="action" />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              type="submit"
              variant="contained"
              color="secondary"
              size="large"
              sx={{ px: 4, py: 1.5, fontSize: '1rem', fontWeight: 'bold' }}
            >
              Suscribirse
            </Button>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default Newsletter;
