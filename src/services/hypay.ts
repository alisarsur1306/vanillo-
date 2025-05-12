import axios from 'axios';

export interface HypayPaymentRequest {
  amount: number;
  currency: string;
  orderId: string;
  customerName: string;
  customerEmail?: string;
  customerPhone: string;
  description: string;
  successUrl: string;
  failureUrl: string;
  cancelUrl: string;
}

export class HypayService {
  private readonly merchantId = 'YOUR_MERCHANT_ID'; // Replace with your actual merchant ID
  private readonly apiKey = 'YOUR_API_KEY'; // Replace with your actual API key
  private readonly apiUrl = 'https://secure.hypay.co.il/API/v2/payment';

  async initiatePayment(request: HypayPaymentRequest): Promise<string> {
    // Prepare parameters
    const params: Record<string, string> = {
      merchant: this.merchantId,
      orderId: request.orderId,
      amount: request.amount.toFixed(2),
      currency: request.currency,
      customerName: request.customerName,
      customerPhone: request.customerPhone,
      description: request.description,
      successUrl: request.successUrl,
      failureUrl: request.failureUrl,
      cancelUrl: request.cancelUrl,
    };
    if (request.customerEmail) {
      params.customerEmail = request.customerEmail;
    }

    // Generate signature (this should be done securely on the backend in production)
    params.sign = this.generateSignature(params);

    // Build payment URL
    const paymentUrl = `${this.apiUrl}?${new URLSearchParams(params).toString()}`;
    return paymentUrl;
  }

  // Dummy signature generator for demo (replace with secure backend logic)
  private generateSignature(params: Record<string, string>): string {
    // In production, use HMAC SHA256 with your API key and sorted params
    // This is a placeholder for demonstration only
    return 'dummy-signature';
  }
}

export const hypayService = new HypayService(); 