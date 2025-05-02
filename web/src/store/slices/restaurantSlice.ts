import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { RestaurantState, Restaurant } from '../../types';
import { restaurantAPI } from '../../services/api';

const initialState: RestaurantState = {
    restaurants: [],
    currentRestaurant: null,
    loading: false,
    error: null
};

// Async thunks
export const getAllRestaurants = createAsyncThunk(
    'restaurant/getAll',
    async (params: { cuisine?: string; city?: string; rating?: number } = {}, { rejectWithValue }) => {
        try {
            const response = await restaurantAPI.getAllRestaurants(params);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch restaurants');
        }
    }
);

export const getRestaurantById = createAsyncThunk(
    'restaurant/getById',
    async (id: string, { rejectWithValue }) => {
        try {
            const response = await restaurantAPI.getRestaurantById(id);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch restaurant');
        }
    }
);

export const createRestaurant = createAsyncThunk(
    'restaurant/create',
    async (restaurantData: Partial<Restaurant>, { rejectWithValue }) => {
        try {
            const response = await restaurantAPI.createRestaurant(restaurantData);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create restaurant');
        }
    }
);

export const updateRestaurant = createAsyncThunk(
    'restaurant/update',
    async ({ id, data }: { id: string; data: Partial<Restaurant> }, { rejectWithValue }) => {
        try {
            const response = await restaurantAPI.updateRestaurant(id, data);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update restaurant');
        }
    }
);

export const deleteRestaurant = createAsyncThunk(
    'restaurant/delete',
    async (id: string, { rejectWithValue }) => {
        try {
            await restaurantAPI.deleteRestaurant(id);
            return id;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete restaurant');
        }
    }
);

// Menu item thunks
export const addMenuItem = createAsyncThunk(
    'restaurant/addMenuItem',
    async ({ restaurantId, menuItemData }: { restaurantId: string; menuItemData: any }, { rejectWithValue }) => {
        try {
            const response = await restaurantAPI.addMenuItem(restaurantId, menuItemData);
            return { restaurantId, menuItem: response.data.menuItem };
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to add menu item');
        }
    }
);

export const updateMenuItem = createAsyncThunk(
    'restaurant/updateMenuItem',
    async (
        { restaurantId, menuItemId, menuItemData }: 
        { restaurantId: string; menuItemId: string; menuItemData: any },
        { rejectWithValue }
    ) => {
        try {
            const response = await restaurantAPI.updateMenuItem(restaurantId, menuItemId, menuItemData);
            return { restaurantId, menuItemId, menuItem: response.data.menuItem };
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update menu item');
        }
    }
);

export const deleteMenuItem = createAsyncThunk(
    'restaurant/deleteMenuItem',
    async ({ restaurantId, menuItemId }: { restaurantId: string; menuItemId: string }, { rejectWithValue }) => {
        try {
            await restaurantAPI.deleteMenuItem(restaurantId, menuItemId);
            return { restaurantId, menuItemId };
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete menu item');
        }
    }
);

// Slice
const restaurantSlice = createSlice({
    name: 'restaurant',
    initialState,
    reducers: {
        clearCurrentRestaurant: (state) => {
            state.currentRestaurant = null;
        },
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        // Get all restaurants
        builder.addCase(getAllRestaurants.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(getAllRestaurants.fulfilled, (state, action) => {
            state.loading = false;
            state.restaurants = action.payload.restaurants;
        });
        builder.addCase(getAllRestaurants.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // Get restaurant by ID
        builder.addCase(getRestaurantById.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(getRestaurantById.fulfilled, (state, action) => {
            state.loading = false;
            state.currentRestaurant = action.payload.restaurant;
        });
        builder.addCase(getRestaurantById.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // Create restaurant
        builder.addCase(createRestaurant.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(createRestaurant.fulfilled, (state, action) => {
            state.loading = false;
            state.restaurants.push(action.payload.restaurant);
            state.currentRestaurant = action.payload.restaurant;
        });
        builder.addCase(createRestaurant.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // Update restaurant
        builder.addCase(updateRestaurant.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(updateRestaurant.fulfilled, (state, action) => {
            state.loading = false;
            const index = state.restaurants.findIndex(r => r._id === action.payload.restaurant._id);
            if (index !== -1) {
                state.restaurants[index] = action.payload.restaurant;
            }
            state.currentRestaurant = action.payload.restaurant;
        });
        builder.addCase(updateRestaurant.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // Delete restaurant
        builder.addCase(deleteRestaurant.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(deleteRestaurant.fulfilled, (state, action) => {
            state.loading = false;
            state.restaurants = state.restaurants.filter(r => r._id !== action.payload);
            if (state.currentRestaurant?._id === action.payload) {
                state.currentRestaurant = null;
            }
        });
        builder.addCase(deleteRestaurant.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // Menu items
        builder.addCase(addMenuItem.fulfilled, (state, action) => {
            if (state.currentRestaurant?._id === action.payload.restaurantId) {
                state.currentRestaurant.menu.push(action.payload.menuItem);
            }
        });
        builder.addCase(updateMenuItem.fulfilled, (state, action) => {
            if (state.currentRestaurant?._id === action.payload.restaurantId) {
                const index = state.currentRestaurant.menu.findIndex(
                    item => item._id === action.payload.menuItemId
                );
                if (index !== -1) {
                    state.currentRestaurant.menu[index] = action.payload.menuItem;
                }
            }
        });
        builder.addCase(deleteMenuItem.fulfilled, (state, action) => {
            if (state.currentRestaurant?._id === action.payload.restaurantId) {
                state.currentRestaurant.menu = state.currentRestaurant.menu.filter(
                    item => item._id !== action.payload.menuItemId
                );
            }
        });
    }
});

export const { clearCurrentRestaurant, clearError } = restaurantSlice.actions;
export default restaurantSlice.reducer; 