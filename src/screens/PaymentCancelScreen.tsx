import React from 'react';
import { useNavigate } from 'react-router-dom';
import { COLORS, FONTS, SIZES, SPACING } from '../constants/theme';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const PaymentCancelScreen: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <Icon name="close-circle" size={64} color={COLORS.error} />
        <h1 style={styles.title}>Payment Cancelled</h1>
        <p style={styles.message}>
          Your payment was cancelled. No charges were made to your account.
        </p>
        <div style={styles.buttonGroup}>
          <button
            onClick={() => navigate(-1)}
            style={styles.button}
          >
            Try Again
          </button>
          <button
            onClick={() => navigate('/')}
            style={[styles.button, styles.secondaryButton]}
          >
            Return to Home
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
    padding: SPACING.l,
  },
  content: {
    textAlign: 'center' as const,
    maxWidth: '500px',
    padding: SPACING.xl,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.base * 2,
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  title: {
    fontSize: SIZES.extraLarge,
    fontFamily: FONTS.bold,
    color: COLORS.black,
    marginTop: SPACING.m,
    marginBottom: SPACING.s,
  },
  message: {
    fontSize: SIZES.medium,
    fontFamily: FONTS.regular,
    color: COLORS.grey,
    marginBottom: SPACING.l,
  },
  buttonGroup: {
    display: 'flex',
    gap: SPACING.m,
    justifyContent: 'center',
  },
  button: {
    backgroundColor: COLORS.primary,
    color: COLORS.white,
    padding: `${SPACING.m} ${SPACING.l}`,
    border: 'none',
    borderRadius: SIZES.base,
    fontSize: SIZES.medium,
    fontFamily: FONTS.medium,
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    '&:hover': {
      backgroundColor: COLORS.primaryDark,
    },
  },
  secondaryButton: {
    backgroundColor: COLORS.grey,
    '&:hover': {
      backgroundColor: COLORS.darkGrey,
    },
  },
};

export default PaymentCancelScreen; 