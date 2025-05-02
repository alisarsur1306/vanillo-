import { api } from './api';
import { notificationService } from './notification';

export interface ChatMessage {
  id: string;
  orderId: string;
  senderId: string;
  senderType: 'user' | 'delivery' | 'system';
  content: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
}

export interface ChatSession {
  orderId: string;
  deliveryPersonId: string;
  deliveryPersonName: string;
  lastMessage?: ChatMessage;
  unreadCount: number;
}

class ChatService {
  private static instance: ChatService;
  private messageListeners: Map<string, (message: ChatMessage) => void> = new Map();
  private sessionListeners: Map<string, (session: ChatSession) => void> = new Map();
  private pollingIntervals: Map<string, NodeJS.Timeout> = new Map();

  private constructor() {}

  static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService();
    }
    return ChatService.instance;
  }

  async getChatSessions(): Promise<ChatSession[]> {
    try {
      const response = await api.get('/chat/sessions');
      return response.data;
    } catch (error) {
      console.error('Error fetching chat sessions:', error);
      throw new Error('Failed to fetch chat sessions');
    }
  }

  async getChatMessages(orderId: string): Promise<ChatMessage[]> {
    try {
      const response = await api.get(`/chat/messages/${orderId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching chat messages:', error);
      throw new Error('Failed to fetch chat messages');
    }
  }

  async sendMessage(orderId: string, content: string): Promise<ChatMessage> {
    try {
      const response = await api.post(`/chat/messages/${orderId}`, { content });
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw new Error('Failed to send message');
    }
  }

  subscribeToMessages(orderId: string, callback: (message: ChatMessage) => void): () => void {
    // Store the callback
    this.messageListeners.set(orderId, callback);

    // Start polling if not already started
    if (!this.pollingIntervals.has(orderId)) {
      const interval = setInterval(async () => {
        try {
          const messages = await this.getChatMessages(orderId);
          const latestMessage = messages[messages.length - 1];
          if (latestMessage) {
            callback(latestMessage);
          }
        } catch (error) {
          console.error('Error polling messages:', error);
        }
      }, 5000); // Poll every 5 seconds

      this.pollingIntervals.set(orderId, interval);
    }

    // Return unsubscribe function
    return () => this.unsubscribeFromMessages(orderId);
  }

  unsubscribeFromMessages(orderId: string): void {
    // Remove the callback
    this.messageListeners.delete(orderId);

    // Clear the polling interval
    const interval = this.pollingIntervals.get(orderId);
    if (interval) {
      clearInterval(interval);
      this.pollingIntervals.delete(orderId);
    }
  }

  subscribeToSessions(callback: (session: ChatSession) => void): () => void {
    // Store the callback
    const listenerId = Date.now().toString();
    this.sessionListeners.set(listenerId, callback);

    // Start polling for session updates
    const interval = setInterval(async () => {
      try {
        const sessions = await this.getChatSessions();
        sessions.forEach(session => callback(session));
      } catch (error) {
        console.error('Error polling sessions:', error);
      }
    }, 10000); // Poll every 10 seconds

    this.pollingIntervals.set(listenerId, interval);

    // Return unsubscribe function
    return () => {
      this.sessionListeners.delete(listenerId);
      clearInterval(interval);
      this.pollingIntervals.delete(listenerId);
    };
  }

  async markMessagesAsRead(orderId: string): Promise<void> {
    try {
      await api.post(`/chat/messages/${orderId}/read`);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }

  async startChatSession(orderId: string): Promise<ChatSession> {
    try {
      const response = await api.post(`/chat/sessions/${orderId}`);
      // Subscribe to notifications for this chat
      await notificationService.subscribeToOrderUpdates(orderId);
      return response.data;
    } catch (error) {
      console.error('Error starting chat session:', error);
      throw new Error('Failed to start chat session');
    }
  }

  async endChatSession(orderId: string): Promise<void> {
    try {
      await api.delete(`/chat/sessions/${orderId}`);
      // Unsubscribe from notifications
      await notificationService.unsubscribeFromOrderUpdates(orderId);
      // Clean up listeners
      this.unsubscribeFromMessages(orderId);
    } catch (error) {
      console.error('Error ending chat session:', error);
    }
  }
}

export const chatService = ChatService.getInstance(); 