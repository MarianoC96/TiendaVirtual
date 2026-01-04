import React from "react";
import { ThemeProvider } from "@mui/material/styles";
import { CssBaseline, Box } from "@mui/material";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import theme from "./styles/theme";
import "./styles/GlobalStyles.css";

// Components
import PublicLayout from "./components/PublicLayout";


// Context
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";

// Pages
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Contact from "./pages/Contact";
import Offers from "./pages/Offers";
import About from "./pages/About";
import Login from "./pages/Login";
import Register from "./pages/Register";

// User
import Profile from "./pages/user/Profile";
import OrderHistory from "./pages/user/OrderHistory";

// Admin
import AdminLayout from "./components/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import ProductManager from "./pages/admin/ProductManager";
import CategoryManager from "./pages/admin/CategoryManager";
import DiscountManager from "./pages/admin/DiscountManager";
import CouponsManager from "./pages/admin/CouponsManager";
import UserManager from "./pages/admin/UserManager";
import AdminOrdersHistory from "./pages/admin/OrdersHistory";
import { AdminProvider } from "./context/AdminProvider";

import ProtectedRoute from "./components/ProtectedRoute";

import ScrollToTop from "./components/ScrollToTop";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <CartProvider>
          <AdminProvider>
            <Router>
              <ScrollToTop />
              <Routes>
                {/* Rutas Públicas */}
                <Route element={<PublicLayout />}>
                  <Route path="/" element={<Home />} />
                  <Route path="/productos" element={<Products />} />
                  <Route path="/ofertas" element={<Offers />} />
                  <Route path="/producto/:id" element={<ProductDetail />} />
                  <Route path="/carrito" element={<Cart />} />
                  <Route path="/contacto" element={<Contact />} />
                  <Route path="/acerca" element={<About />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/registro" element={<Register />} />

                  {/* Rutas de Usuario Protegidas (dentro del layout público) */}
                  <Route
                    path="/perfil"
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/pedidos"
                    element={
                      <ProtectedRoute>
                        <OrderHistory />
                      </ProtectedRoute>
                    }
                  />
                </Route>

                {/* Rutas de Admin Protegidas (Layout Independiente) */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute requireAdmin={true}>
                      <AdminLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Dashboard />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="pedidos" element={<AdminOrdersHistory />} />
                  <Route path="productos" element={<ProductManager />} />
                  <Route path="categorias" element={<CategoryManager />} />
                  <Route path="descuentos" element={<DiscountManager />} />
                  <Route path="cupones" element={<CouponsManager />} />
                  <Route path="usuarios" element={<UserManager />} />
                </Route>
              </Routes>
            </Router>
          </AdminProvider>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
