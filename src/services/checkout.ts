import { api } from './api';
import { cartService } from './cart';
import { hypayService } from './hypay';

export interface DeliveryAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  instructions?: string;
}

export interface PaymentMethod {
  type: 'card' | 'cash';
  cardDetails?: {
    number: string;
    expiryDate: string;
    cvv: string;
    name: string;
  };
}

export type DeliveryType = 'take_away' | 'delivery';

export interface OrderSummary {
  subtotal: number;
  deliveryFee: number;
  tax: number;
  total: number;
}

class CheckoutService {
  private static instance: CheckoutService;
  private readonly DELIVERY_FEE = 5.99;
  private readonly TAX_RATE = 0.08; // 8% tax rate

  private constructor() {}

  static getInstance(): CheckoutService {
    if (!CheckoutService.instance) {
      CheckoutService.instance = new CheckoutService();
    }
    return CheckoutService.instance;
  }

  calculateOrderSummary(deliveryType: DeliveryType): OrderSummary {
    const subtotal = cartService.getTotal();
    const tax = subtotal * this.TAX_RATE;
    const deliveryFee = deliveryType === 'delivery' ? this.DELIVERY_FEE : 0;
    const total = subtotal + deliveryFee + tax;

    return {
      subtotal,
      deliveryFee,
      tax,
      total,
    };
  }

  async createOrder(
    address: DeliveryAddress,
    paymentMethod: PaymentMethod,
    deliveryType: DeliveryType
  ): Promise<string> {
    try {
      const cart = cartService.getCart();
      const orderSummary = this.calculateOrderSummary(deliveryType);

      const orderData = {
        restaurantId: cart.restaurantId,
        items: cart.items.map(item => ({
          menuItemId: item.id,
          quantity: item.quantity,
          price: item.price,
        })),
        deliveryAddress: deliveryType === 'delivery' ? address : null,
        deliveryType,
        paymentMethod,
        summary: orderSummary,
      };

      const response = await api.post('/orders', orderData);
      return response.data.orderId;
    } catch (error) {
      console.error('Error creating order:', error);
      throw new Error('Failed to create order. Please try again.');
    }
  }

  async processPayment(paymentMethod: PaymentMethod, amount: number, orderId: string, customerInfo: { name: string; email: string; phone: string; }): Promise<boolean> {
    try {
      if (paymentMethod.type === 'card') {
        // Initiate Hypay payment
        const paymentUrl = await hypayService.initiatePayment({
          amount,
          currency: 'ILS',
          orderId,
          customerName: customerInfo.name,
          customerEmail: customerInfo.email,
          customerPhone: customerInfo.phone,
          description: `Order #${orderId}`,
          successUrl: window.location.origin + '/order-success.html',
          failureUrl: window.location.origin + '/order-failure.html',
          cancelUrl: window.location.origin + '/checkout.html',
        });
        // Redirect to Hypay payment page
        window.location.href = paymentUrl;
        return true;
      } else {
        // For cash payments, just return true
        return true;
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      throw new Error('Payment failed. Please try again.');
    }
  }
}

export const checkoutService = CheckoutService.getInstance(); 