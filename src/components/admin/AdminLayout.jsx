import React, { useState } from 'react';
import { styled, useTheme, ThemeProvider, createTheme } from '@mui/material/styles';
import {
    Box, Drawer as MuiDrawer, List, ListItem, ListItemIcon, ListItemText,
    Toolbar, AppBar as MuiAppBar, Typography, Container, Avatar,
    IconButton, Menu, MenuItem, Divider, Tooltip, CssBaseline
} from '@mui/material';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import InventoryIcon from '@mui/icons-material/Inventory';
import CategoryIcon from '@mui/icons-material/Category';
import PeopleIcon from '@mui/icons-material/People';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import PersonIcon from '@mui/icons-material/Person';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import StoreIcon from '@mui/icons-material/Store';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';

const drawerWidth = 260;

// Custom Theme for Admin Panel to isolate styles
const adminTheme = createTheme({
    palette: {
        primary: {
            main: '#2e3b55', // Deep Blue-Grey
        },
        secondary: {
            main: '#ff6f00', // Amber/Orange accent
        },
        background: {
            default: '#f4f6f8', // Very light grey for main content
            paper: '#ffffff',
        },
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h6: {
            fontWeight: 600,
        },
    },
});

const openedMixin = (theme) => ({
    width: drawerWidth,
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: 'hidden',
    backgroundColor: '#1e1e2d', // DARK SIDEBAR BG
    color: '#ffffff', // WHITE TEXT
    borderRight: 'none',
});

const closedMixin = (theme) => ({
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: 'hidden',
    width: `calc(${theme.spacing(7)} + 1px)`,
    [theme.breakpoints.up('sm')]: {
        width: `calc(${theme.spacing(9)} + 1px)`,
    },
    backgroundColor: '#1e1e2d', // DARK SIDEBAR BG
    color: '#ffffff', // WHITE TEXT
    borderRight: 'none',
});

const DrawerHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing(0, 2),
    height: 64, // Fixed height to match AppBar
    backgroundColor: '#1a1a27', // Slightly darker brand header
    color: 'white',
}));

const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
    zIndex: theme.zIndex.drawer + 1,
    backgroundColor: '#ffffff', // WHITE HEADER
    color: '#333333', // DARK TEXT
    boxShadow: '0px 1px 4px rgba(0,0,0,0.05)', // Subtle shadow
    transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    }),
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
    ({ theme, open }) => ({
        width: drawerWidth,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',
        ...(open && {
            ...openedMixin(theme),
            '& .MuiDrawer-paper': openedMixin(theme),
        }),
        ...(!open && {
            ...closedMixin(theme),
            '& .MuiDrawer-paper': closedMixin(theme),
        }),
    }),
);

const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin/dashboard' },
    { text: 'Historial Pedidos', icon: <ShoppingBagIcon />, path: '/admin/pedidos' },
    { text: 'Categorías', icon: <CategoryIcon />, path: '/admin/categorias' },
    { text: 'Productos', icon: <InventoryIcon />, path: '/admin/productos' },
    { text: 'Descuentos', icon: <LocalOfferIcon />, path: '/admin/descuentos' },
    { text: 'Cupones', icon: <LocalOfferIcon />, path: '/admin/cupones' },
    { text: 'Usuarios', icon: <PeopleIcon />, path: '/admin/usuarios' },
];

const AdminLayout = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const { logout, user } = useAuth();

    // States
    const [open, setOpen] = useState(true);
    const [anchorEl, setAnchorEl] = useState(null);

    const toggleDrawer = () => {
        setOpen(!open);
    };

    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        handleClose();
        logout();
        navigate('/login');
    };

    return (
        <ThemeProvider theme={adminTheme}>
            <Box sx={{ display: 'flex', backgroundColor: '#f4f6f8', minHeight: '100vh' }}>
                <CssBaseline />
                <AppBar position="fixed" open={open} elevation={0}>
                    <Toolbar sx={{ height: 64 }}>
                        <IconButton
                            color="inherit"
                            aria-label="open drawer"
                            onClick={toggleDrawer}
                            edge="start"
                            sx={{
                                marginRight: 5,
                                ...(open && { display: 'none' }),
                            }}
                        >
                            <MenuIcon />
                        </IconButton>

                        {/* Title only visible when drawer is closed or on mobile, otherwise it's in drawer */}
                        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, color: '#2c3e50' }}>
                            {!open ? 'Panel de Control' : ''}
                        </Typography>

                        {user && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box sx={{ textAlign: 'right', mr: 1, display: { xs: 'none', sm: 'block' } }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#333' }}>
                                        {user.name}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: '#666' }}>
                                        {user.role === 'admin' ? 'Administrador' : 'Usuario'}
                                    </Typography>
                                </Box>
                                <Tooltip title="Opciones de cuenta">
                                    <IconButton
                                        onClick={handleMenu}
                                        size="small"
                                        aria-controls={Boolean(anchorEl) ? 'account-menu' : undefined}
                                        aria-haspopup="true"
                                        aria-expanded={Boolean(anchorEl) ? 'true' : undefined}
                                    >
                                        <Avatar
                                            sx={{
                                                width: 40,
                                                height: 40,
                                                bgcolor: 'transparent',
                                                border: '2px solid #e0e0e0',
                                                color: '#555'
                                            }}
                                        >
                                            {user.name?.charAt(0).toUpperCase()}
                                        </Avatar>
                                    </IconButton>
                                </Tooltip>
                                <Menu
                                    anchorEl={anchorEl}
                                    id="account-menu"
                                    open={Boolean(anchorEl)}
                                    onClose={handleClose}
                                    onClick={handleClose}
                                    PaperProps={{
                                        elevation: 0,
                                        sx: {
                                            overflow: 'visible',
                                            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.1))',
                                            mt: 1.5,
                                            border: '1px solid #eee',
                                            '&:before': {
                                                content: '""',
                                                display: 'block',
                                                position: 'absolute',
                                                top: 0,
                                                right: 14,
                                                width: 10,
                                                height: 10,
                                                bgcolor: 'background.paper',
                                                transform: 'translateY(-50%) rotate(45deg)',
                                                zIndex: 0,
                                            },
                                        },
                                    }}
                                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                                >
                                    <MenuItem onClick={() => navigate('/perfil')}>
                                        <ListItemIcon> <PersonIcon fontSize="small" sx={{ color: '#2e3b55' }} /> </ListItemIcon>
                                        Mi Perfil
                                    </MenuItem>
                                    <MenuItem onClick={() => navigate('/pedidos')}>
                                        <ListItemIcon> <ShoppingBagIcon fontSize="small" sx={{ color: '#2e3b55' }} /> </ListItemIcon>
                                        Mis Pedidos
                                    </MenuItem>
                                    <Divider />
                                    <MenuItem onClick={() => navigate('/')}>
                                        <ListItemIcon> <StoreIcon fontSize="small" sx={{ color: '#2e3b55' }} /> </ListItemIcon>
                                        Ir a la Tienda
                                    </MenuItem>
                                    <MenuItem onClick={handleLogout} sx={{ color: '#d32f2f' }}>
                                        <ListItemIcon> <ExitToAppIcon fontSize="small" sx={{ color: '#d32f2f' }} /> </ListItemIcon>
                                        Cerrar Sesión
                                    </MenuItem>
                                </Menu>
                            </Box>
                        )}
                    </Toolbar>
                </AppBar>

                <Drawer variant="permanent" open={open}>
                    <DrawerHeader>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box
                                component="div"
                                sx={{
                                    width: 32,
                                    height: 32,
                                    bgcolor: '#4caf50',
                                    borderRadius: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 'bold'
                                }}
                            >
                                T
                            </Box>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', letterSpacing: 0.5 }}>
                                TiendaPanel
                            </Typography>
                        </Box>
                        <IconButton onClick={toggleDrawer} sx={{ color: '#9ca3af' }}>
                            {theme.direction === 'rtl' ? <MenuIcon /> : <MenuOpenIcon />}
                        </IconButton>
                    </DrawerHeader>
                    <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)' }} />
                    <List sx={{ pt: 2 }}>
                        {menuItems.map((item) => (
                            <ListItem
                                button
                                key={item.text}
                                onClick={() => navigate(item.path)}
                                selected={location.pathname === item.path}
                                sx={{
                                    minHeight: 48,
                                    justifyContent: open ? 'initial' : 'center',
                                    px: 2.5,
                                    my: 0.5,
                                    mx: 1,
                                    borderRadius: 2,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    color: location.pathname === item.path ? '#ffffff' : '#9ca3af',
                                    backgroundColor: location.pathname === item.path ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                                    '&:hover': {
                                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                        color: '#ffffff',
                                    },
                                    '&.Mui-selected': {
                                        backgroundColor: '#4caf50', // Accent color for selected
                                        color: '#ffffff',
                                        '&:hover': {
                                            backgroundColor: '#43a047',
                                        }
                                    }
                                }}
                            >
                                <ListItemIcon
                                    sx={{
                                        minWidth: 0,
                                        mr: open ? 2 : 'auto',
                                        justifyContent: 'center',
                                        color: 'inherit' // Inherit from parent
                                    }}
                                >
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText
                                    primary={item.text}
                                    sx={{ opacity: open ? 1 : 0 }}
                                    primaryTypographyProps={{
                                        fontWeight: location.pathname === item.path ? 600 : 400,
                                        fontSize: '0.95rem'
                                    }}
                                />
                            </ListItem>
                        ))}
                    </List>
                </Drawer>

                <Box component="main" sx={{ flexGrow: 1, p: 4, mt: 8, transition: 'all 0.3s' }}>
                    {/* Content area */}
                    <Container maxWidth="xl">
                        <Outlet />
                    </Container>
                </Box>
            </Box>
        </ThemeProvider>
    );
};

export default AdminLayout;
