import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { OrderState, Order } from '../../types';
import { orderAPI } from '../../services/api';

const initialState: OrderState = {
    orders: [],
    currentOrder: null,
    loading: false,
    error: null
};

// Async thunks
export const createOrder = createAsyncThunk(
    'order/create',
    async (orderData: Partial<Order>, { rejectWithValue }) => {
        try {
            const response = await orderAPI.createOrder(orderData);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create order');
        }
    }
);

export const getUserOrders = createAsyncThunk(
    'order/getUserOrders',
    async (_, { rejectWithValue }) => {
        try {
            const response = await orderAPI.getUserOrders();
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch user orders');
        }
    }
);

export const getRestaurantOrders = createAsyncThunk(
    'order/getRestaurantOrders',
    async (restaurantId: string, { rejectWithValue }) => {
        try {
            const response = await orderAPI.getRestaurantOrders(restaurantId);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch restaurant orders');
        }
    }
);

export const getDriverOrders = createAsyncThunk(
    'order/getDriverOrders',
    async (_, { rejectWithValue }) => {
        try {
            const response = await orderAPI.getDriverOrders();
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch driver orders');
        }
    }
);

export const updateOrderStatus = createAsyncThunk(
    'order/updateStatus',
    async ({ orderId, status }: { orderId: string; status: Order['status'] }, { rejectWithValue }) => {
        try {
            const response = await orderAPI.updateOrderStatus(orderId, status);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update order status');
        }
    }
);

export const assignDriver = createAsyncThunk(
    'order/assignDriver',
    async ({ orderId, driverId }: { orderId: string; driverId: string }, { rejectWithValue }) => {
        try {
            const response = await orderAPI.assignDriver(orderId, driverId);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to assign driver');
        }
    }
);

export const rateOrder = createAsyncThunk(
    'order/rate',
    async (
        { orderId, rating }: 
        { orderId: string; rating: { food: number; delivery: number; comment?: string } },
        { rejectWithValue }
    ) => {
        try {
            const response = await orderAPI.rateOrder(orderId, rating);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to rate order');
        }
    }
);

// Slice
const orderSlice = createSlice({
    name: 'order',
    initialState,
    reducers: {
        clearCurrentOrder: (state) => {
            state.currentOrder = null;
        },
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        // Create order
        builder.addCase(createOrder.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(createOrder.fulfilled, (state, action) => {
            state.loading = false;
            state.orders.unshift(action.payload.order);
            state.currentOrder = action.payload.order;
        });
        builder.addCase(createOrder.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // Get user orders
        builder.addCase(getUserOrders.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(getUserOrders.fulfilled, (state, action) => {
            state.loading = false;
            state.orders = action.payload.orders;
        });
        builder.addCase(getUserOrders.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // Get restaurant orders
        builder.addCase(getRestaurantOrders.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(getRestaurantOrders.fulfilled, (state, action) => {
            state.loading = false;
            state.orders = action.payload.orders;
        });
        builder.addCase(getRestaurantOrders.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // Get driver orders
        builder.addCase(getDriverOrders.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(getDriverOrders.fulfilled, (state, action) => {
            state.loading = false;
            state.orders = action.payload.orders;
        });
        builder.addCase(getDriverOrders.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // Update order status
        builder.addCase(updateOrderStatus.fulfilled, (state, action) => {
            const index = state.orders.findIndex(o => o._id === action.payload.order._id);
            if (index !== -1) {
                state.orders[index] = action.payload.order;
            }
            if (state.currentOrder?._id === action.payload.order._id) {
                state.currentOrder = action.payload.order;
            }
        });

        // Assign driver
        builder.addCase(assignDriver.fulfilled, (state, action) => {
            const index = state.orders.findIndex(o => o._id === action.payload.order._id);
            if (index !== -1) {
                state.orders[index] = action.payload.order;
            }
            if (state.currentOrder?._id === action.payload.order._id) {
                state.currentOrder = action.payload.order;
            }
        });

        // Rate order
        builder.addCase(rateOrder.fulfilled, (state, action) => {
            const index = state.orders.findIndex(o => o._id === action.payload.order._id);
            if (index !== -1) {
                state.orders[index] = action.payload.order;
            }
            if (state.currentOrder?._id === action.payload.order._id) {
                state.currentOrder = action.payload.order;
            }
        });
    }
});

export const { clearCurrentOrder, clearError } = orderSlice.actions;
export default orderSlice.reducer; 