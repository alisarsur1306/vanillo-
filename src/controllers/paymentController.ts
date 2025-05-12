import { Request, Response } from 'express';
import { paymentService } from '../services/payment';

export const paymentController = {
  async initiatePayment(req: Request, res: Response) {
    try {
      const {
        items,
        client_name,
        client_email,
        client_phone,
        client_tehudat,
        currency = 'ILS',
        lang = 'AUTO',
      } = req.body;

      // Generate a unique order ID
      const order_id = `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Format items to include VAT
      const formattedItems = items.map((item: any) => ({
        name: item.name,
        price: item.price,
        qty: item.quantity,
        vat: 1 // 18% VAT included
      }));

      const paymentData = {
        items: formattedItems,
        order_id,
        client_name,
        client_email,
        client_phone,
        client_tehudat: client_tehudat || '000000000', // Default for non-Israeli citizens
        currency,
        lang,
        notifications_url: `${process.env.API_BASE_URL}/api/payments/notify`,
        success_url: process.env.NODE_ENV === 'production' 
          ? `https://vanillo.onrender.com/payment/success.html?orderId=${order_id}`
          : `${process.env.FRONTEND_URL}/payment/success.html?orderId=${order_id}`,
        backlink_url: process.env.NODE_ENV === 'production'
          ? 'https://vanillo.onrender.com/payment/cancel.html'
          : `${process.env.FRONTEND_URL}/payment/cancel.html`,
        show_applepay: false,
        show_bit: false,
        expire: Math.floor(Date.now() / 1000) + 3600 // Link expires in 1 hour
      };

      const { payment_url } = await paymentService.createPayment(paymentData);
      res.json({ payment_url, order_id });
    } catch (error) {
      console.error('Payment initiation error:', error);
      res.status(500).json({ error: 'Failed to initiate payment' });
    }
  },

  async handlePaymentNotification(req: Request, res: Response) {
    try {
      const isValid = await paymentService.verifyPaymentNotification(req.body);
      
      if (!isValid) {
        return res.status(400).json({ error: 'Invalid payment notification' });
      }

      const { order_id, status, amount, currency, card_mask, card_brand, foreign_card, receipt } = req.body;
      
      if (status === 1) {
        // Payment successful - update order status in your database
        console.log(`Payment successful for order: ${order_id}`);
        console.log('Payment details:', {
          amount,
          currency,
          card_mask,
          card_brand,
          foreign_card,
          receipt
        });
        
        // TODO: Implement order status update logic
      }

      res.status(200).json({ received: true });
    } catch (error) {
      console.error('Payment notification error:', error);
      res.status(500).json({ error: 'Failed to process payment notification' });
    }
  },

  async checkPaymentStatus(req: Request, res: Response) {
    try {
      const { order_id } = req.params;
      
      if (!order_id) {
        return res.status(400).json({ error: 'Order ID is required' });
      }

      const status = await paymentService.checkPaymentStatus(order_id);
      res.json(status);
    } catch (error) {
      console.error('Payment status check error:', error);
      res.status(500).json({ error: 'Failed to check payment status' });
    }
  }
}; 