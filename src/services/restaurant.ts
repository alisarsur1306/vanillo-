import { api } from './api';

interface Restaurant {
  id: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  cuisine: string;
  rating: number;
  priceRange: string;
  openingHours: {
    [key: string]: {
      open: string;
      close: string;
    };
  };
  images: string[];
  isOpen: boolean;
}

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  restaurantId: string;
}

class RestaurantService {
  private static instance: RestaurantService;

  private constructor() {}

  static getInstance(): RestaurantService {
    if (!RestaurantService.instance) {
      RestaurantService.instance = new RestaurantService();
    }
    return RestaurantService.instance;
  }

  async getRestaurants(params?: {
    cuisine?: string;
    search?: string;
    sortBy?: string;
    page?: number;
    limit?: number;
  }): Promise<{ restaurants: Restaurant[]; total: number }> {
    return api.get('/restaurants', { params });
  }

  async getRestaurantById(id: string): Promise<Restaurant> {
    return api.get(`/restaurants/${id}`);
  }

  async getRestaurantMenu(restaurantId: string): Promise<MenuItem[]> {
    return api.get(`/restaurants/${restaurantId}/menu`);
  }

  async getMenuItem(restaurantId: string, menuItemId: string): Promise<MenuItem> {
    return api.get(`/restaurants/${restaurantId}/menu/${menuItemId}`);
  }

  async searchRestaurants(query: string): Promise<Restaurant[]> {
    return api.get('/restaurants/search', { params: { q: query } });
  }

  async getRestaurantsByCuisine(cuisine: string): Promise<Restaurant[]> {
    return api.get('/restaurants', { params: { cuisine } });
  }
}

export const restaurantService = RestaurantService.getInstance(); 