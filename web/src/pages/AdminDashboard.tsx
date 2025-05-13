import React, { useState, useEffect } from 'react';
import { Box, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from '../components/admin/Sidebar';
import TopBar from '../components/admin/TopBar';
import Login from '../components/admin/Login';
import MenuManagement from '../components/admin/MenuManagement';
import OrderManagement from '../components/admin/OrderManagement';
import Dashboard from '../components/admin/Dashboard';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import UserManagement from '../components/admin/UserManagement';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
});

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = useState(true);
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/admin/login" />;
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <TopBar open={open} setOpen={setOpen} />
      <Sidebar open={open} setOpen={setOpen} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - 240px)` },
          mt: 8,
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

const AdminDashboard = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <AdminLayout>
                  <Dashboard />
                </AdminLayout>
              }
            />
            <Route
              path="/menu"
              element={
                <AdminLayout>
                  <MenuManagement />
                </AdminLayout>
              }
            />
            <Route
              path="/orders"
              element={
                <AdminLayout>
                  <OrderManagement />
                </AdminLayout>
              }
            />
            <Route
              path="/users"
              element={
                <AdminLayout>
                  <UserManagement />
                </AdminLayout>
              }
            />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default AdminDashboard; 