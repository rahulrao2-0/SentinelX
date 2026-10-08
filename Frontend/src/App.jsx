import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import SearchLogs from './pages/SearchLogs';
import Alerts from './pages/Alerts';
import DebugRoom from './pages/DebugRoom';

// A highly polished, modern dark blue theme
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#3399FF', // Vibrant blue accent
      light: '#66B2FF',
      dark: '#0059B2',
    },
    background: {
      default: '#0A1929', // Deep navy background
      paper: '#001E3C',   // Slightly lighter navy for cards
    },
    divider: 'rgba(194, 224, 255, 0.08)',
    text: {
      primary: '#F3F6F9',
      secondary: '#B2BAC2',
    }
  },
  shape: {
    borderRadius: 12, // Modern rounded corners
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
      letterSpacing: '-0.5px',
    },
    h5: {
      fontWeight: 600,
    },
    button: {
      textTransform: 'none', // Modern, non-all-caps buttons
      fontWeight: 600,
    }
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
          border: '1px solid rgba(194, 224, 255, 0.08)',
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(51, 153, 255, 0.4)',
          }
        }
      }
    }
  }
});

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/*"
        element={
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/search" element={<SearchLogs />} />
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/rooms" element={<DebugRoom />} />
            </Routes>
          </Layout>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
