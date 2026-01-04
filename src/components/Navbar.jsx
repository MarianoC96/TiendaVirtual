import React, { useState, useEffect } from 'react';
import {
    AppBar, Toolbar, Typography, Button, IconButton, Badge,
    Box, InputBase, Menu, MenuItem, Container
} from '@mui/material';
import {
    Search as SearchIcon,
    ShoppingCart as ShoppingCartIcon,
    AccountCircle,
    Menu as MenuIcon,
    KeyboardArrowDown
} from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import axios from 'axios';

const Search = styled('div')(({ theme }) => ({
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.grey[200], 0.5), // Subtle gray
    '&:hover': {
        backgroundColor: alpha(theme.palette.grey[200], 0.8),
    },
    marginRight: theme.spacing(2),
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
        marginLeft: theme.spacing(3),
        width: 'auto',
    },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: theme.palette.text.secondary,
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
    color: 'inherit',
    '& .MuiInputBase-input': {
        padding: theme.spacing(1, 1, 1, 0),
        paddingLeft: `calc(1em + ${theme.spacing(4)})`,
        transition: theme.transitions.create('width'),
        width: '100%',
        [theme.breakpoints.up('md')]: {
            width: '20ch',
        },
    },
}));

const Navbar = () => {
    const { user, logout, isAuthenticated } = useAuth();
    const { itemCount } = useCart();
    const navigate = useNavigate();

    // UI State
    const [anchorEl, setAnchorEl] = useState(null);
    const [productsAnchorEl, setProductsAnchorEl] = useState(null);
    const [categories, setCategories] = useState([]);

    // Fetch categories on mount
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await axios.get('http://localhost:3001/api/categories');
                setCategories(res.data);
            } catch (error) {
                console.error("Error fetching categories for navbar:", error);
            }
        };
        fetchCategories();
    }, []);

    const handleProfileMenuOpen = (event) => setAnchorEl(event.currentTarget);
    const handleMenuClose = () => setAnchorEl(null);
    const handleLogout = () => {
        logout();
        handleMenuClose();
        navigate('/login');
    };

    // Products Menu Handlers
    const handleProductsMenuOpen = (event) => setProductsAnchorEl(event.currentTarget);
    const handleProductsMenuClose = () => setProductsAnchorEl(null);
    const handleCategoryClick = (categorySlug) => {
        handleProductsMenuClose();
        navigate(`/productos?categoria=${categorySlug}`);
        // Note: Products page needs to handle this query param to filter
    };

    const isMenuOpen = Boolean(anchorEl);
    const isProductsMenuOpen = Boolean(productsAnchorEl);
    const menuId = 'primary-search-account-menu';

    const renderMenu = (
        <Menu
            anchorEl={anchorEl}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            keepMounted
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            open={isMenuOpen}
            onClose={handleMenuClose}
            PaperProps={{
                elevation: 0,
                sx: {
                    overflow: 'visible',
                    filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.1))',
                    mt: 1.5,
                    borderRadius: 3,
                    '& .MuiAvatar-root': { width: 32, height: 32, ml: -0.5, mr: 1, },
                },
            }}
        >
            {isAuthenticated ? (
                <div>
                    {user?.role === 'admin' && (
                        <MenuItem onClick={() => { handleMenuClose(); navigate('/admin/dashboard'); }}>
                            Panel de Administración
                        </MenuItem>
                    )}
                    <MenuItem onClick={() => { handleMenuClose(); navigate('/perfil'); }}>Mi Perfil</MenuItem>
                    <MenuItem onClick={() => { handleMenuClose(); navigate('/pedidos'); }}>Mis Pedidos</MenuItem>
                    <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>Cerrar Sesión</MenuItem>
                </div>
            ) : (
                <div>
                    <MenuItem onClick={() => { handleMenuClose(); navigate('/login'); }}>Iniciar Sesión</MenuItem>
                    <MenuItem onClick={() => { handleMenuClose(); navigate('/registro'); }}>Registrarse</MenuItem>
                </div>
            )}
        </Menu>
    );

    const renderProductsMenu = (
        <Menu
            anchorEl={productsAnchorEl}
            open={isProductsMenuOpen}
            onClose={handleProductsMenuClose}
            MenuListProps={{ 'aria-labelledby': 'products-button' }}
            PaperProps={{
                elevation: 0,
                sx: {
                    mt: 1.5,
                    borderRadius: 3,
                    boxShadow: '0px 10px 30px rgba(0,0,0,0.1)',
                    minWidth: 180
                }
            }}
        >
            <MenuItem onClick={() => { handleProductsMenuClose(); navigate('/productos'); }} sx={{ fontWeight: 'bold' }}>
                Ver Todo
            </MenuItem>
            {categories.map((category) => (
                <MenuItem key={category.id} onClick={() => handleCategoryClick(category.slug)}>
                    {category.name}
                </MenuItem>
            ))}
        </Menu>
    );

    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="sticky" sx={{ backgroundColor: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(20px)' }}>
                <Container maxWidth="xl">
                    <Toolbar disableGutters sx={{ minHeight: '70px' }}>
                        <Typography
                            variant="h5"
                            noWrap
                            component={Link}
                            to="/"
                            sx={{
                                mr: 4,
                                display: { xs: 'none', md: 'flex' },
                                fontWeight: 800,
                                letterSpacing: '-0.5px',
                                color: 'primary.main',
                                textDecoration: 'none',
                            }}
                        >
                            TIENDA.
                        </Typography>

                        {/* Mobile Logo */}
                        <Typography
                            variant="h5"
                            noWrap
                            component={Link}
                            to="/"
                            sx={{
                                mr: 2,
                                display: { xs: 'flex', md: 'none' },
                                flexGrow: 1,
                                fontWeight: 800,
                                letterSpacing: '-0.5px',
                                color: 'primary.main',
                                textDecoration: 'none',
                            }}
                        >
                            TIENDA.
                        </Typography>

                        {/* Desktop Navigation */}
                        <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, gap: 1 }}>
                            <Button
                                component={Link}
                                to="/"
                                sx={{ color: 'text.primary', fontWeight: 600, fontSize: '0.95rem' }}
                            >
                                Inicio
                            </Button>

                            <Button
                                id="products-button"
                                aria-controls={isProductsMenuOpen ? 'products-menu' : undefined}
                                aria-haspopup="true"
                                aria-expanded={isProductsMenuOpen ? 'true' : undefined}
                                onClick={handleProductsMenuOpen}
                                endIcon={<KeyboardArrowDown />}
                                sx={{ color: 'text.primary', fontWeight: 600, fontSize: '0.95rem' }}
                            >
                                Productos
                            </Button>

                            <Button
                                component={Link}
                                to="/ofertas"
                                sx={{ color: 'text.primary', fontWeight: 600, fontSize: '0.95rem' }}
                            >
                                Ofertas
                            </Button>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Search sx={{ display: { xs: 'none', md: 'block' } }}>
                                <SearchIconWrapper>
                                    <SearchIcon />
                                </SearchIconWrapper>
                                <StyledInputBase
                                    placeholder="Buscar..."
                                    inputProps={{ 'aria-label': 'buscar' }}
                                />
                            </Search>

                            <IconButton
                                size="large"
                                aria-label="ver carrito"
                                color="inherit"
                                component={Link}
                                to="/carrito"
                                sx={{ color: 'text.primary' }}
                            >
                                <Badge badgeContent={itemCount} color="secondary">
                                    <ShoppingCartIcon />
                                </Badge>
                            </IconButton>

                            <IconButton
                                size="large"
                                edge="end"
                                aria-label="cuenta de usuario"
                                aria-controls={menuId}
                                aria-haspopup="true"
                                onClick={handleProfileMenuOpen}
                                sx={{ color: 'text.primary' }}
                            >
                                <AccountCircle />
                            </IconButton>
                        </Box>
                    </Toolbar>
                </Container>
            </AppBar>
            {renderMenu}
            {renderProductsMenu}
        </Box>
    );
};

export default Navbar;
