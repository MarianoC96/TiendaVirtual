import React from "react";
import { Box } from "@mui/material";
import Hero from "../components/Hero";
import FeaturedProducts from "../components/FeaturedProducts";
import Categories from "../components/Categories";
import Newsletter from "../components/Newsletter";

const Home = () => {
  return (
    <Box>
      <Hero />
      <FeaturedProducts />
      <Categories />
      <Newsletter />
    </Box>
  );
};

export default Home;
