import { createTheme } from '@mui/material/styles';

// Definir la paleta de colores atractiva para la tienda
const theme = createTheme({
  palette: {
    primary: {
      main: '#212121', // Dark Grey/Black for high contrast luxury look
      light: '#484848',
      dark: '#000000',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#D50000', // Vibrant Red for CTAs
      light: '#FF5131',
      dark: '#9B0000',
      contrastText: '#ffffff',
    },
    background: {
      default: '#F5F5F7', // Soft light gray
      paper: '#ffffff',
    },
    text: {
      primary: '#1d1d1f', // Almost black
      secondary: '#86868b', // Soft gray
    },
    success: { main: '#00C853' },
    warning: { main: '#FFD600' },
    error: { main: '#DD2C00' },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 800 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 700 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 50, // Pill shape buttons
          padding: '10px 24px',
          boxShadow: 'none',
        },
        containedPrimary: {
          '&:hover': {
            boxShadow: '0 4px 14px 0 rgba(0,0,0,0.39)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF', // White navbar
          color: '#1d1d1f', // Dark text
          boxShadow: '0 1px 0 rgba(0,0,0,0.1)', // Subtle border
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
          border: 'none',
        },
      },
    },
  },
});

export default theme;
