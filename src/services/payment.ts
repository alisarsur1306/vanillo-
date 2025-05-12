import axios from 'axios';
import crypto from 'crypto';

interface PaymentItem {
  name: string;
  price: number;
  qty: number;
  vat: number;
}

interface PaymentRequest {
  items: PaymentItem[];
  order_id: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  notifications_url?: string;
  success_url?: string;
  backlink_url?: string;
  currency?: 'ILS' | 'USD' | 'EUR';
  lang?: 'AUTO' | 'AR' | 'EN' | 'HE' | 'RU';
  client_tehudat?: string;
  add_field_1?: string;
  add_field_2?: string;
  show_applepay?: boolean;
  show_bit?: boolean;
  expire?: number;
}

class PaymentService {
  private apiLogin: string;
  private apiKey: string;
  private apiUrl: string;

  constructor() {
    this.apiLogin = process.env.ALLPAY_LOGIN || 'pp1009681';
    this.apiKey = process.env.ALLPAY_KEY || 'B139E36C2D7BC6D0AE615360588D929A';
    this.apiUrl = 'https://allpay.to/app/?show=getpayment&mode=api8';
  }

  private generateSignature(request: any): string {
    // Sort parameters alphabetically
    const sortedParams = Object.keys(request)
      .sort()
      .reduce((acc: any, key) => {
        if (request[key] !== '' && key !== 'sign') {
          if (Array.isArray(request[key])) {
            // Handle items array
            request[key].forEach((item: any) => {
              Object.keys(item)
                .sort()
                .forEach((itemKey) => {
                  if (item[itemKey] !== '') {
                    acc.push(item[itemKey]);
                  }
                });
            });
          } else {
            acc.push(request[key]);
          }
        }
        return acc;
      }, []);

    // Join values with colons and add API key
    const signatureString = sortedParams.join(':') + ':' + this.apiKey;
    return crypto.createHash('sha256').update(signatureString).digest('hex');
  }

  async createPayment(paymentData: PaymentRequest): Promise<{ payment_url: string }> {
    try {
      const request = {
        ...paymentData,
        login: this.apiLogin,
        currency: paymentData.currency || 'ILS',
        lang: paymentData.lang || 'AUTO',
        show_applepay: false, // Disable Apple Pay by default
        show_bit: false, // Disable Bit by default
      };

      const sign = this.generateSignature(request);
      const requestWithSign = { ...request, sign };

      const response = await axios.post(this.apiUrl, requestWithSign, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.data || !response.data.payment_url) {
        throw new Error('Invalid response from Allpay');
      }

      return response.data;
    } catch (error) {
      console.error('Payment creation error:', error);
      throw new Error('Failed to create payment');
    }
  }

  async verifyPaymentNotification(notification: any): Promise<boolean> {
    try {
      const { sign, ...notificationData } = notification;
      const calculatedSign = this.generateSignature(notificationData);
      return calculatedSign === sign;
    } catch (error) {
      console.error('Payment verification error:', error);
      return false;
    }
  }

  async checkPaymentStatus(orderId: string): Promise<any> {
    try {
      const request = {
        login: this.apiLogin,
        order_id: orderId,
      };

      const sign = this.generateSignature(request);
      const requestWithSign = { ...request, sign };

      const response = await axios.post(
        'https://allpay.to/app/?show=paymentstatus&mode=api8',
        requestWithSign,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Payment status check error:', error);
      throw new Error('Failed to check payment status');
    }
  }
}

export const paymentService = new PaymentService(); 