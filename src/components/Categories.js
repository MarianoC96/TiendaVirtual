import React, { useState, useEffect } from "react";
import { Box, Container, Typography, Grid, Paper } from "@mui/material";
import axios from "axios";

const Categories = () => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await axios.get("http://localhost:3001/api/categories");
        setCategories(data);
      } catch (error) {
        console.error(error);
      }
    }
    fetchCategories();
  }, []);

  return (
    <Box sx={{ py: 8 }}>
      <Container maxWidth="lg">
        <Typography variant="h3" textAlign="center" sx={{ mb: 4 }}>
          Categorías
        </Typography>
        <Grid container spacing={3}>
          {categories.map(cat => (
            <Grid item xs={6} sm={4} md={2} key={cat.id}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  textAlign: 'center',
                  cursor: 'pointer',
                  bgcolor: '#f5f5f5',
                  '&:hover': { bgcolor: '#e0e0e0' }
                }}
              >
                <Typography variant="h4" sx={{ mb: 1 }}>{cat.icon}</Typography>
                <Typography variant="subtitle2" component="div">
                  {cat.name}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default Categories;
