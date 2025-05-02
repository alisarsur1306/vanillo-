import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RestaurantStackParamList } from '../navigation/types';
import { api } from '../services/api';
import { COLORS, FONTS, SIZES, SPACING } from '../constants/theme';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Button from '../components/Button';

type OrderConfirmationRouteProp = RouteProp<RestaurantStackParamList, 'OrderConfirmation'>;
type OrderConfirmationNavigationProp = NativeStackNavigationProp<RestaurantStackParamList, 'OrderConfirmation'>;

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered';
  items: OrderItem[];
  total: number;
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    instructions?: string;
  };
  estimatedDeliveryTime: string;
  createdAt: string;
}

const OrderConfirmationScreen = () => {
  const route = useRoute<OrderConfirmationRouteProp>();
  const navigation = useNavigation<OrderConfirmationNavigationProp>();
  const { orderId } = route.params;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/orders/${orderId}`);
      setOrder(response.data);
    } catch (error) {
      console.error('Error fetching order details:', error);
      Alert.alert(
        'Error',
        'Failed to load order details. Please try again.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'clock-outline';
      case 'confirmed':
        return 'check-circle-outline';
      case 'preparing':
        return 'food';
      case 'out_for_delivery':
        return 'bike-fast';
      case 'delivered':
        return 'check-circle';
      default:
        return 'help-circle';
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return COLORS.warning;
      case 'confirmed':
        return COLORS.info;
      case 'preparing':
        return COLORS.primary;
      case 'out_for_delivery':
        return COLORS.success;
      case 'delivered':
        return COLORS.success;
      default:
        return COLORS.grey;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="alert-circle" size={48} color={COLORS.error} />
        <Text style={styles.errorText}>Order not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        {/* Order Status */}
        <View style={styles.statusSection}>
          <Icon
            name={getStatusIcon(order.status)}
            size={48}
            color={getStatusColor(order.status)}
          />
          <Text style={styles.statusText}>
            {order.status.split('_').map(word => 
              word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ')}
          </Text>
          <Text style={styles.estimatedTime}>
            Estimated delivery: {order.estimatedDeliveryTime}
          </Text>
        </View>

        {/* Order Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Items</Text>
          {order.items.map((item) => (
            <View key={item.id} style={styles.orderItem}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemQuantity}>x{item.quantity}</Text>
              </View>
              <Text style={styles.itemPrice}>
                ${(item.price * item.quantity).toFixed(2)}
              </Text>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>${order.total.toFixed(2)}</Text>
          </View>
        </View>

        {/* Delivery Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>
          <Text style={styles.addressText}>{order.deliveryAddress.street}</Text>
          <Text style={styles.addressText}>
            {order.deliveryAddress.city}, {order.deliveryAddress.state} {order.deliveryAddress.zipCode}
          </Text>
          {order.deliveryAddress.instructions && (
            <Text style={styles.instructions}>
              Instructions: {order.deliveryAddress.instructions}
            </Text>
          )}
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.footer}>
        <Button
          title="Track Order"
          icon="map-marker"
          onPress={() => navigation.navigate('OrderTracking', { orderId })}
          style={styles.trackButton}
        />
        <Button
          title="Back to Home"
          icon="home"
          onPress={() => navigation.navigate('Home')}
          style={styles.homeButton}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: SIZES.medium,
    fontFamily: FONTS.medium,
    color: COLORS.error,
    marginTop: SPACING.m,
  },
  content: {
    flex: 1,
  },
  statusSection: {
    padding: SPACING.xl,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    marginBottom: SPACING.s,
  },
  statusText: {
    fontSize: SIZES.large,
    fontFamily: FONTS.bold,
    color: COLORS.black,
    marginTop: SPACING.m,
    marginBottom: SPACING.xs,
  },
  estimatedTime: {
    fontSize: SIZES.medium,
    fontFamily: FONTS.medium,
    color: COLORS.grey,
  },
  section: {
    padding: SPACING.m,
    backgroundColor: COLORS.white,
    marginBottom: SPACING.s,
  },
  sectionTitle: {
    fontSize: SIZES.large,
    fontFamily: FONTS.bold,
    color: COLORS.black,
    marginBottom: SPACING.m,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.m,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: SIZES.medium,
    fontFamily: FONTS.medium,
    color: COLORS.black,
  },
  itemQuantity: {
    fontSize: SIZES.font,
    fontFamily: FONTS.regular,
    color: COLORS.grey,
  },
  itemPrice: {
    fontSize: SIZES.medium,
    fontFamily: FONTS.bold,
    color: COLORS.black,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  addressText: {
    fontSize: SIZES.medium,
    fontFamily: FONTS.regular,
    color: COLORS.black,
    marginBottom: SPACING.xs,
  },
  instructions: {
    fontSize: SIZES.medium,
    fontFamily: FONTS.regular,
    color: COLORS.grey,
    marginTop: SPACING.s,
  },
  footer: {
    padding: SPACING.m,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGrey,
  },
  trackButton: {
    marginBottom: SPACING.s,
  },
  homeButton: {
    marginBottom: SPACING.m,
  },
});

export default OrderConfirmationScreen; 