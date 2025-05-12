import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { COLORS, FONTS, SIZES, SPACING } from '../constants/theme';

interface PaymentFormProps {
  items: Array<{
    name: string;
    price: number;
    qty: number;
    vat: number;
  }>;
  totalAmount: number;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ items, totalAmount }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData(e.target as HTMLFormElement);
      const paymentData = {
        items,
        client_name: formData.get('name'),
        client_email: formData.get('email'),
        client_phone: formData.get('phone'),
        currency: 'ILS',
        lang: 'EN',
      };

      const response = await axios.post('/api/payments/initiate', paymentData);
      const { payment_url } = response.data;

      // Redirect to Allpay payment page
      window.location.href = payment_url;
    } catch (err) {
      setError('Failed to initiate payment. Please try again.');
      console.error('Payment error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Payment Details</h2>
      <div style={styles.summary}>
        <h3 style={styles.summaryTitle}>Order Summary</h3>
        {items.map((item, index) => (
          <div key={index} style={styles.summaryItem}>
            <span>{item.name} x {item.qty}</span>
            <span>₪{(item.price * item.qty).toFixed(2)}</span>
          </div>
        ))}
        <div style={styles.total}>
          <strong>Total:</strong>
          <strong>₪{totalAmount.toFixed(2)}</strong>
        </div>
      </div>

      <form onSubmit={handlePayment} style={styles.form}>
        {error && <div style={styles.error}>{error}</div>}
        
        <div style={styles.formGroup}>
          <label htmlFor="name" style={styles.label}>Full Name</label>
          <input
            type="text"
            id="name"
            name="name"
            required
            style={styles.input}
          />
        </div>

        <div style={styles.formGroup}>
          <label htmlFor="email" style={styles.label}>Email</label>
          <input
            type="email"
            id="email"
            name="email"
            required
            style={styles.input}
          />
        </div>

        <div style={styles.formGroup}>
          <label htmlFor="phone" style={styles.label}>Phone Number</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            required
            style={styles.input}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={styles.submitButton}
        >
          {loading ? 'Processing...' : 'Pay Now'}
        </button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '600px',
    margin: '0 auto',
    padding: SPACING.l,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.base * 2,
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  title: {
    fontSize: SIZES.large,
    fontFamily: FONTS.bold,
    color: COLORS.black,
    marginBottom: SPACING.m,
  },
  summary: {
    marginBottom: SPACING.l,
    padding: SPACING.m,
    backgroundColor: COLORS.lightGrey,
    borderRadius: SIZES.base,
  },
  summaryTitle: {
    fontSize: SIZES.medium,
    fontFamily: FONTS.medium,
    marginBottom: SPACING.s,
  },
  summaryItem: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  total: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: SPACING.m,
    paddingTop: SPACING.s,
    borderTop: `1px solid ${COLORS.grey}`,
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: SPACING.m,
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: SPACING.xs,
  },
  label: {
    fontSize: SIZES.font,
    fontFamily: FONTS.medium,
    color: COLORS.black,
  },
  input: {
    padding: SPACING.s,
    border: `1px solid ${COLORS.grey}`,
    borderRadius: SIZES.base,
    fontSize: SIZES.font,
    fontFamily: FONTS.regular,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    color: COLORS.white,
    padding: SPACING.m,
    border: 'none',
    borderRadius: SIZES.base,
    fontSize: SIZES.medium,
    fontFamily: FONTS.medium,
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    '&:hover': {
      backgroundColor: COLORS.primaryDark,
    },
    '&:disabled': {
      backgroundColor: COLORS.grey,
      cursor: 'not-allowed',
    },
  },
  error: {
    color: COLORS.error,
    backgroundColor: COLORS.errorLight,
    padding: SPACING.s,
    borderRadius: SIZES.base,
    marginBottom: SPACING.m,
  },
};

export default PaymentForm; 