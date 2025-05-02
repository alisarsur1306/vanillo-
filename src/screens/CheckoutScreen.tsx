import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RestaurantStackParamList } from '../navigation/types';
import { checkoutService, DeliveryAddress, PaymentMethod } from '../services/checkout';
import { cartService } from '../services/cart';
import { COLORS, FONTS, SIZES, SPACING } from '../constants/theme';
import Button from '../components/Button';

type CheckoutScreenNavigationProp = NativeStackNavigationProp<RestaurantStackParamList, 'Checkout'>;

type DeliveryType = 'take_away' | 'delivery';

const CheckoutScreen = () => {
  const navigation = useNavigation<CheckoutScreenNavigationProp>();
  const [loading, setLoading] = useState(false);
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('delivery');
  const [address, setAddress] = useState<DeliveryAddress>({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    instructions: '',
  });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>({
    type: 'card',
    cardDetails: {
      number: '',
      expiryDate: '',
      cvv: '',
      name: '',
    },
  });

  const orderSummary = checkoutService.calculateOrderSummary(deliveryType);

  const handleAddressChange = (field: keyof DeliveryAddress, value: string) => {
    setAddress(prev => ({ ...prev, [field]: value }));
  };

  const handlePaymentMethodChange = (field: string, value: string) => {
    if (paymentMethod.type === 'card' && paymentMethod.cardDetails) {
      setPaymentMethod(prev => ({
        ...prev,
        cardDetails: {
          ...prev.cardDetails!,
          [field]: value,
        },
      }));
    }
  };

  const validateForm = (): boolean => {
    if (deliveryType === 'delivery' && (!address.street || !address.city || !address.state || !address.zipCode)) {
      Alert.alert('Error', 'Please fill in all required address fields');
      return false;
    }

    if (paymentMethod.type === 'card') {
      const { number, expiryDate, cvv, name } = paymentMethod.cardDetails!;
      if (!number || !expiryDate || !cvv || !name) {
        Alert.alert('Error', 'Please fill in all card details');
        return false;
      }
    }

    return true;
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      
      // Process payment first
      const paymentSuccess = await checkoutService.processPayment(
        paymentMethod,
        orderSummary.total
      );

      if (!paymentSuccess) {
        throw new Error('Payment failed');
      }

      // Create the order
      const orderId = await checkoutService.createOrder(address, paymentMethod, deliveryType);

      // Clear the cart
      cartService.clearCart();

      // Navigate to order confirmation
      navigation.replace('OrderConfirmation', { orderId });
    } catch (error) {
      console.error('Error placing order:', error);
      Alert.alert('Error', 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        {/* Delivery Type Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Type</Text>
          <View style={styles.deliveryTypeSelector}>
            <Button
              title="Take Away"
              icon="shopping-bag"
              onPress={() => setDeliveryType('take_away')}
              style={[
                styles.deliveryTypeButton,
                deliveryType === 'take_away' && styles.selectedDeliveryType,
              ]}
              textStyle={deliveryType === 'take_away' ? styles.selectedDeliveryTypeText : undefined}
            />
            <Button
              title="Delivery"
              icon="bike-fast"
              onPress={() => setDeliveryType('delivery')}
              style={[
                styles.deliveryTypeButton,
                deliveryType === 'delivery' && styles.selectedDeliveryType,
              ]}
              textStyle={deliveryType === 'delivery' ? styles.selectedDeliveryTypeText : undefined}
            />
          </View>
        </View>

        {/* Delivery Address Section */}
        {deliveryType === 'delivery' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Delivery Address</Text>
            <TextInput
              style={styles.input}
              placeholder="Street Address"
              value={address.street}
              onChangeText={(value) => handleAddressChange('street', value)}
            />
            <TextInput
              style={styles.input}
              placeholder="City"
              value={address.city}
              onChangeText={(value) => handleAddressChange('city', value)}
            />
            <View style={styles.row}>
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="State"
                value={address.state}
                onChangeText={(value) => handleAddressChange('state', value)}
              />
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="ZIP Code"
                value={address.zipCode}
                onChangeText={(value) => handleAddressChange('zipCode', value)}
                keyboardType="numeric"
              />
            </View>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Delivery Instructions (Optional)"
              value={address.instructions}
              onChangeText={(value) => handleAddressChange('instructions', value)}
              multiline
              numberOfLines={3}
            />
          </View>
        )}

        {/* Payment Method Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <View style={styles.paymentTypeSelector}>
            <Button
              title="Credit Card"
              icon="credit-card"
              onPress={() => setPaymentMethod({ type: 'card' })}
              style={[
                styles.paymentTypeButton,
                paymentMethod.type === 'card' && styles.selectedPaymentType,
              ]}
              textStyle={paymentMethod.type === 'card' ? styles.selectedPaymentTypeText : undefined}
            />
            <Button
              title="Cash on Delivery"
              icon="cash"
              onPress={() => setPaymentMethod({ type: 'cash' })}
              style={[
                styles.paymentTypeButton,
                paymentMethod.type === 'cash' && styles.selectedPaymentType,
              ]}
              textStyle={paymentMethod.type === 'cash' ? styles.selectedPaymentTypeText : undefined}
            />
          </View>

          {paymentMethod.type === 'card' && (
            <>
              <TextInput
                style={styles.input}
                placeholder="Card Number"
                value={paymentMethod.cardDetails?.number}
                onChangeText={(value) => handlePaymentMethodChange('number', value)}
                keyboardType="numeric"
              />
              <View style={styles.row}>
                <TextInput
                  style={[styles.input, styles.halfInput]}
                  placeholder="MM/YY"
                  value={paymentMethod.cardDetails?.expiryDate}
                  onChangeText={(value) => handlePaymentMethodChange('expiryDate', value)}
                />
                <TextInput
                  style={[styles.input, styles.halfInput]}
                  placeholder="CVV"
                  value={paymentMethod.cardDetails?.cvv}
                  onChangeText={(value) => handlePaymentMethodChange('cvv', value)}
                  keyboardType="numeric"
                  secureTextEntry
                />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Name on Card"
                value={paymentMethod.cardDetails?.name}
                onChangeText={(value) => handlePaymentMethodChange('name', value)}
              />
            </>
          )}
        </View>

        {/* Order Summary Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>${orderSummary.subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery Fee</Text>
            <Text style={styles.summaryValue}>${orderSummary.deliveryFee.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tax</Text>
            <Text style={styles.summaryValue}>${orderSummary.tax.toFixed(2)}</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>${orderSummary.total.toFixed(2)}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Place Order Button */}
      <View style={styles.footer}>
        <Button
          title="Place Order"
          icon="check-circle"
          onPress={handlePlaceOrder}
          style={styles.placeOrderButton}
          loading={loading}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    padding: SPACING.medium,
  },
  section: {
    marginBottom: SPACING.large,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.base,
    padding: SPACING.medium,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    ...FONTS.h3,
    marginBottom: SPACING.small,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  deliveryTypeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.small,
    marginBottom: SPACING.small,
  },
  deliveryTypeButton: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.medium,
    borderRadius: SIZES.base,
  },
  selectedDeliveryType: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  selectedDeliveryTypeText: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.lightGrey,
    borderRadius: SIZES.base,
    padding: SPACING.m,
    marginBottom: SPACING.m,
    fontSize: SIZES.medium,
    fontFamily: FONTS.regular,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  paymentTypeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.m,
  },
  paymentTypeButton: {
    width: '48%',
    backgroundColor: COLORS.lightGrey,
  },
  selectedPaymentType: {
    backgroundColor: COLORS.primary,
  },
  selectedPaymentTypeText: {
    color: COLORS.white,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.s,
  },
  summaryLabel: {
    fontSize: SIZES.medium,
    fontFamily: FONTS.medium,
    color: COLORS.black,
  },
  summaryValue: {
    fontSize: SIZES.medium,
    fontFamily: FONTS.medium,
    color: COLORS.black,
  },
  totalRow: {
    marginTop: SPACING.m,
    paddingTop: SPACING.m,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGrey,
  },
  totalLabel: {
    fontSize: SIZES.large,
    fontFamily: FONTS.bold,
    color: COLORS.black,
  },
  totalValue: {
    fontSize: SIZES.large,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
  },
  footer: {
    padding: SPACING.m,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGrey,
  },
  placeOrderButton: {
    marginBottom: SPACING.m,
  },
});

export default CheckoutScreen; 