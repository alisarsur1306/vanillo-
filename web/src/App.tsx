import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { Provider } from 'react-redux';
import store from './store';
import theme from './theme';
import { PrivateRoute } from './components/PrivateRoute';

// Layout components
import Layout from './components/layout/Layout';

// Auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// User pages
import Home from './pages/Home';
import RestaurantList from './pages/restaurants/RestaurantList';
import RestaurantDetails from './pages/restaurants/RestaurantDetails';
import Cart from './pages/Cart';
import OrderHistory from './pages/orders/OrderHistory';
import OrderDetails from './pages/orders/OrderDetails';
import Profile from './pages/Profile';

// Restaurant owner pages
import RestaurantDashboard from './pages/restaurant/Dashboard';
import MenuManagement from './pages/restaurant/MenuManagement';
import OrderManagement from './pages/restaurant/OrderManagement';

// Driver pages
import DriverDashboard from './pages/driver/Dashboard';
import DeliveryHistory from './pages/driver/DeliveryHistory';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import UserManagement from './pages/admin/UserManagement';
import RestaurantManagement from './pages/admin/RestaurantManagement';
import AdminPanel from './pages/AdminPanel';

const App: React.FC = () => {
    return (
        <Provider store={store}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <Router>
                    <Routes>
                        {/* Public routes */}
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />

                        {/* Protected routes */}
                        <Route element={<Layout />}>
                            {/* User routes */}
                            <Route path="/" element={<Home />} />
                            <Route path="/restaurants" element={<RestaurantList />} />
                            <Route path="/restaurants/:id" element={<RestaurantDetails />} />
                            <Route path="/cart" element={
                                <PrivateRoute roles={['user']}>
                                    <Cart />
                                </PrivateRoute>
                            } />
                            <Route path="/orders" element={
                                <PrivateRoute roles={['user']}>
                                    <OrderHistory />
                                </PrivateRoute>
                            } />
                            <Route path="/orders/:id" element={
                                <PrivateRoute roles={['user', 'restaurant_owner', 'driver']}>
                                    <OrderDetails />
                                </PrivateRoute>
                            } />
                            <Route path="/profile" element={
                                <PrivateRoute roles={['user', 'restaurant_owner', 'driver']}>
                                    <Profile />
                                </PrivateRoute>
                            } />

                            {/* Restaurant owner routes */}
                            <Route path="/restaurant/dashboard" element={
                                <PrivateRoute roles={['restaurant_owner']}>
                                    <RestaurantDashboard />
                                </PrivateRoute>
                            } />
                            <Route path="/restaurant/menu" element={
                                <PrivateRoute roles={['restaurant_owner']}>
                                    <MenuManagement />
                                </PrivateRoute>
                            } />
                            <Route path="/restaurant/orders" element={
                                <PrivateRoute roles={['restaurant_owner']}>
                                    <OrderManagement />
                                </PrivateRoute>
                            } />

                            {/* Driver routes */}
                            <Route path="/driver/dashboard" element={
                                <PrivateRoute roles={['driver']}>
                                    <DriverDashboard />
                                </PrivateRoute>
                            } />
                            <Route path="/driver/deliveries" element={
                                <PrivateRoute roles={['driver']}>
                                    <DeliveryHistory />
                                </PrivateRoute>
                            } />

                            {/* Admin routes */}
                            <Route path="/admin/dashboard" element={
                                <PrivateRoute roles={['admin']}>
                                    <AdminDashboard />
                                </PrivateRoute>
                            } />
                            <Route path="/admin/users" element={
                                <PrivateRoute roles={['admin']}>
                                    <UserManagement />
                                </PrivateRoute>
                            } />
                            <Route path="/admin/restaurants" element={
                                <PrivateRoute roles={['admin']}>
                                    <RestaurantManagement />
                                </PrivateRoute>
                            } />
                        </Route>

                        {/* Catch all route */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </Router>
            </ThemeProvider>
        </Provider>
    );
};

export default App; 