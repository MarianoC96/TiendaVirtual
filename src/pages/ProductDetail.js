import React from "react";
import { Box, Container, Typography } from "@mui/material";

const ProductDetail = () => {
  return (
    <Box sx={{ py: 8 }}>
      <Container maxWidth="lg">
        <Typography variant="h2" textAlign="center" sx={{ mb: 4 }}>
          Detalle del Producto
        </Typography>
        <Typography variant="body1" textAlign="center" color="text.secondary">
          Esta página estará disponible próximamente.
        </Typography>
      </Container>
    </Box>
  );
};

export default ProductDetail;
