import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';
import { api } from './api';

export interface NotificationPreferences {
  orderStatus: boolean;
  promotions: boolean;
  chatMessages: boolean;
}

class NotificationService {
  private static instance: NotificationService;
  private readonly NOTIFICATION_TOKEN_KEY = 'notification_token';
  private readonly NOTIFICATION_PREFERENCES_KEY = 'notification_preferences';

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async initialize(): Promise<void> {
    try {
      // Request permission
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        // Get FCM token
        const token = await messaging().getToken();
        await this.saveToken(token);

        // Listen for token refresh
        messaging().onTokenRefresh(async (newToken) => {
          await this.saveToken(newToken);
        });

        // Set up notification handlers
        this.setupNotificationHandlers();
      }
    } catch (error) {
      console.error('Error initializing notifications:', error);
    }
  }

  private async saveToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(this.NOTIFICATION_TOKEN_KEY, token);
      await this.registerTokenWithServer(token);
    } catch (error) {
      console.error('Error saving notification token:', error);
    }
  }

  private async registerTokenWithServer(token: string): Promise<void> {
    try {
      await api.post('/users/notification-token', { token });
    } catch (error) {
      console.error('Error registering token with server:', error);
    }
  }

  private setupNotificationHandlers(): void {
    // Handle notifications when app is in foreground
    messaging().onMessage(async (remoteMessage) => {
      // You can customize how foreground notifications are displayed
      console.log('Received foreground message:', remoteMessage);
    });

    // Handle notification open events
    messaging().onNotificationOpenedApp((remoteMessage) => {
      console.log('Notification opened app from background state:', remoteMessage);
      // Navigate to appropriate screen based on notification data
      this.handleNotificationOpen(remoteMessage);
    });

    // Check if app was opened from a notification
    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage) {
          console.log('App opened from quit state by notification:', remoteMessage);
          this.handleNotificationOpen(remoteMessage);
        }
      });
  }

  private handleNotificationOpen(remoteMessage: any): void {
    // Handle navigation based on notification type
    const { type, data } = remoteMessage.data || {};
    
    // This would be implemented in your navigation service
    // For example:
    // if (type === 'order_status') {
    //   navigation.navigate('OrderTracking', { orderId: data.orderId });
    // } else if (type === 'chat_message') {
    //   navigation.navigate('Chat', { orderId: data.orderId });
    // }
  }

  async getPreferences(): Promise<NotificationPreferences> {
    try {
      const preferencesJson = await AsyncStorage.getItem(this.NOTIFICATION_PREFERENCES_KEY);
      if (preferencesJson) {
        return JSON.parse(preferencesJson);
      }
      // Default preferences
      return {
        orderStatus: true,
        promotions: true,
        chatMessages: true,
      };
    } catch (error) {
      console.error('Error getting notification preferences:', error);
      return {
        orderStatus: true,
        promotions: true,
        chatMessages: true,
      };
    }
  }

  async updatePreferences(preferences: NotificationPreferences): Promise<void> {
    try {
      await AsyncStorage.setItem(
        this.NOTIFICATION_PREFERENCES_KEY,
        JSON.stringify(preferences)
      );
      await api.post('/users/notification-preferences', preferences);
    } catch (error) {
      console.error('Error updating notification preferences:', error);
    }
  }

  async subscribeToOrderUpdates(orderId: string): Promise<void> {
    try {
      await messaging().subscribeToTopic(`order_${orderId}`);
    } catch (error) {
      console.error('Error subscribing to order updates:', error);
    }
  }

  async unsubscribeFromOrderUpdates(orderId: string): Promise<void> {
    try {
      await messaging().unsubscribeFromTopic(`order_${orderId}`);
    } catch (error) {
      console.error('Error unsubscribing from order updates:', error);
    }
  }
}

export const notificationService = NotificationService.getInstance(); 