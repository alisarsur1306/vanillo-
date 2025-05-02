import { api } from './api';

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  specialInstructions?: string;
}

export interface Order {
  id: string;
  restaurantId: string;
  restaurantName: string;
  restaurantPhone: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivering' | 'delivered' | 'cancelled';
  totalAmount: number;
  items: OrderItem[];
  orderDate: string;
  deliveryAddress: string;
  deliveryPersonId?: string;
  deliveryPersonName?: string;
  deliveryPersonPhone?: string;
  estimatedDeliveryTime?: string;
}

export interface OrdersResponse {
  orders: Order[];
  total: number;
}

export interface OrderResponse {
  order: Order;
}

class OrderService {
  private static instance: OrderService;

  private constructor() {}

  static getInstance(): OrderService {
    if (!OrderService.instance) {
      OrderService.instance = new OrderService();
    }
    return OrderService.instance;
  }

  async getOrders(params?: { 
    status?: Order['status']; 
    limit?: number; 
    offset?: number;
  }): Promise<OrdersResponse> {
    try {
      const response = await api.get('/orders', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw new Error('Failed to fetch orders');
    }
  }

  async getOrderById(orderId: string): Promise<OrderResponse> {
    try {
      const response = await api.get(`/orders/${orderId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching order details:', error);
      throw new Error('Failed to fetch order details');
    }
  }

  async createOrder(orderData: {
    restaurantId: string;
    items: Array<{
      menuItemId: string;
      quantity: number;
      specialInstructions?: string;
    }>;
    deliveryAddress: string;
    paymentMethod: 'credit_card' | 'cash';
  }): Promise<OrderResponse> {
    try {
      const response = await api.post('/orders', orderData);
      return response.data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw new Error('Failed to create order');
    }
  }

  async cancelOrder(orderId: string, reason?: string): Promise<OrderResponse> {
    try {
      const response = await api.post(`/orders/${orderId}/cancel`, { reason });
      return response.data;
    } catch (error) {
      console.error('Error canceling order:', error);
      throw new Error('Failed to cancel order');
    }
  }

  async rateOrder(orderId: string, rating: {
    food: number;
    delivery: number;
    comment?: string;
  }): Promise<void> {
    try {
      await api.post(`/orders/${orderId}/rate`, rating);
    } catch (error) {
      console.error('Error rating order:', error);
      throw new Error('Failed to rate order');
    }
  }

  async trackOrder(orderId: string): Promise<{
    status: Order['status'];
    location?: {
      latitude: number;
      longitude: number;
      address: string;
    };
    estimatedArrival?: string;
  }> {
    try {
      const response = await api.get(`/orders/${orderId}/track`);
      return response.data;
    } catch (error) {
      console.error('Error tracking order:', error);
      throw new Error('Failed to track order');
    }
  }
}

export const orderService = OrderService.getInstance(); 