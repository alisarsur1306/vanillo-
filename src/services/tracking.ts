import { api } from './api';

export interface DeliveryLocation {
  latitude: number;
  longitude: number;
  timestamp: string;
}

export interface OrderStatus {
  status: 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered';
  location?: DeliveryLocation;
  estimatedDeliveryTime: string;
  lastUpdated: string;
}

class TrackingService {
  private static instance: TrackingService;
  private statusListeners: Map<string, (status: OrderStatus) => void> = new Map();
  private pollingIntervals: Map<string, NodeJS.Timeout> = new Map();

  private constructor() {}

  static getInstance(): TrackingService {
    if (!TrackingService.instance) {
      TrackingService.instance = new TrackingService();
    }
    return TrackingService.instance;
  }

  async getOrderStatus(orderId: string): Promise<OrderStatus> {
    try {
      const response = await api.get(`/orders/${orderId}/status`);
      return response.data;
    } catch (error) {
      console.error('Error fetching order status:', error);
      throw new Error('Failed to fetch order status');
    }
  }

  subscribeToOrderStatus(orderId: string, callback: (status: OrderStatus) => void): () => void {
    // Store the callback
    this.statusListeners.set(orderId, callback);

    // Start polling if not already started
    if (!this.pollingIntervals.has(orderId)) {
      const interval = setInterval(async () => {
        try {
          const status = await this.getOrderStatus(orderId);
          callback(status);

          // Stop polling if order is delivered
          if (status.status === 'delivered') {
            this.unsubscribeFromOrderStatus(orderId);
          }
        } catch (error) {
          console.error('Error polling order status:', error);
        }
      }, 10000); // Poll every 10 seconds

      this.pollingIntervals.set(orderId, interval);
    }

    // Return unsubscribe function
    return () => this.unsubscribeFromOrderStatus(orderId);
  }

  unsubscribeFromOrderStatus(orderId: string): void {
    // Remove the callback
    this.statusListeners.delete(orderId);

    // Clear the polling interval
    const interval = this.pollingIntervals.get(orderId);
    if (interval) {
      clearInterval(interval);
      this.pollingIntervals.delete(orderId);
    }
  }

  async getDeliveryRoute(orderId: string): Promise<DeliveryLocation[]> {
    try {
      const response = await api.get(`/orders/${orderId}/route`);
      return response.data;
    } catch (error) {
      console.error('Error fetching delivery route:', error);
      throw new Error('Failed to fetch delivery route');
    }
  }
}

export const trackingService = TrackingService.getInstance(); 