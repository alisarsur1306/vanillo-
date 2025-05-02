import axios from 'axios';
import { User, Restaurant, Order } from '../types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add token to requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    register: (userData: Partial<User>) => 
        api.post<{ token: string; user: User }>('/auth/register', userData),
    
    login: (email: string, password: string) =>
        api.post<{ token: string; user: User }>('/auth/login', { email, password }),
    
    getCurrentUser: () =>
        api.get<{ user: User }>('/auth/me')
};

// Restaurant API
export const restaurantAPI = {
    getAllRestaurants: (params?: { cuisine?: string; city?: string; rating?: number }) =>
        api.get<{ restaurants: Restaurant[] }>('/restaurants', { params }),
    
    getRestaurantById: (id: string) =>
        api.get<{ restaurant: Restaurant }>(`/restaurants/${id}`),
    
    createRestaurant: (restaurantData: Partial<Restaurant>) =>
        api.post<{ restaurant: Restaurant }>('/restaurants', restaurantData),
    
    updateRestaurant: (id: string, restaurantData: Partial<Restaurant>) =>
        api.put<{ restaurant: Restaurant }>(`/restaurants/${id}`, restaurantData),
    
    deleteRestaurant: (id: string) =>
        api.delete(`/restaurants/${id}`),
    
    addMenuItem: (restaurantId: string, menuItemData: Partial<Restaurant>) =>
        api.post<{ menuItem: Restaurant }>(`/restaurants/${restaurantId}/menu`, menuItemData),
    
    updateMenuItem: (restaurantId: string, menuItemId: string, menuItemData: Partial<Restaurant>) =>
        api.put<{ menuItem: Restaurant }>(`/restaurants/${restaurantId}/menu/${menuItemId}`, menuItemData),
    
    deleteMenuItem: (restaurantId: string, menuItemId: string) =>
        api.delete(`/restaurants/${restaurantId}/menu/${menuItemId}`)
};

// Order API
export const orderAPI = {
    createOrder: (orderData: Partial<Order>) =>
        api.post<{ order: Order }>('/orders', orderData),
    
    getUserOrders: () =>
        api.get<{ orders: Order[] }>('/orders/my-orders'),
    
    getRestaurantOrders: (restaurantId: string) =>
        api.get<{ orders: Order[] }>(`/orders/restaurant/${restaurantId}`),
    
    getDriverOrders: () =>
        api.get<{ orders: Order[] }>('/orders/driver/orders'),
    
    updateOrderStatus: (orderId: string, status: Order['status']) =>
        api.put<{ order: Order }>(`/orders/${orderId}/status`, { status }),
    
    assignDriver: (orderId: string, driverId: string) =>
        api.put<{ order: Order }>(`/orders/${orderId}/assign-driver`, { driverId }),
    
    rateOrder: (orderId: string, rating: { food: number; delivery: number; comment?: string }) =>
        api.post<{ order: Order }>(`/orders/${orderId}/rate`, rating)
};

export default api; 