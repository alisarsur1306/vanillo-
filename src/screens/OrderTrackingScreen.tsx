import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RestaurantStackParamList } from '../navigation/types';
import { trackingService, OrderStatus, DeliveryLocation } from '../services/tracking';
import { COLORS, FONTS, SIZES, SPACING } from '../constants/theme';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MapView, { Marker, Polyline } from 'react-native-maps';
import Button from '../components/Button';

type OrderTrackingRouteProp = RouteProp<RestaurantStackParamList, 'OrderTracking'>;
type OrderTrackingNavigationProp = NativeStackNavigationProp<RestaurantStackParamList, 'OrderTracking'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const OrderTrackingScreen = () => {
  const route = useRoute<OrderTrackingRouteProp>();
  const navigation = useNavigation<OrderTrackingNavigationProp>();
  const { orderId } = route.params;
  const mapRef = useRef<MapView>(null);

  const [orderStatus, setOrderStatus] = useState<OrderStatus | null>(null);
  const [deliveryRoute, setDeliveryRoute] = useState<DeliveryLocation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const initializeTracking = async () => {
      try {
        setLoading(true);
        const [status, route] = await Promise.all([
          trackingService.getOrderStatus(orderId),
          trackingService.getDeliveryRoute(orderId),
        ]);
        setOrderStatus(status);
        setDeliveryRoute(route);

        // Subscribe to status updates
        unsubscribe = trackingService.subscribeToOrderStatus(orderId, (newStatus) => {
          setOrderStatus(newStatus);
        });

        // Fit map to show the delivery route
        if (route.length > 0 && mapRef.current) {
          mapRef.current.fitToCoordinates(route.map(point => ({
            latitude: point.latitude,
            longitude: point.longitude,
          })), {
            edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
            animated: true,
          });
        }
      } catch (error) {
        console.error('Error initializing tracking:', error);
        Alert.alert(
          'Error',
          'Failed to load tracking information. Please try again.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } finally {
        setLoading(false);
      }
    };

    initializeTracking();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [orderId]);

  const getStatusIcon = (status: OrderStatus['status']) => {
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

  const getStatusColor = (status: OrderStatus['status']) => {
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

  if (!orderStatus) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="alert-circle" size={48} color={COLORS.error} />
        <Text style={styles.errorText}>Order not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Status Header */}
      <View style={styles.header}>
        <Icon
          name={getStatusIcon(orderStatus.status)}
          size={32}
          color={getStatusColor(orderStatus.status)}
        />
        <Text style={styles.statusText}>
          {orderStatus.status.split('_').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' ')}
        </Text>
        <Text style={styles.estimatedTime}>
          Estimated delivery: {orderStatus.estimatedDeliveryTime}
        </Text>
      </View>

      {/* Map View */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={{
            latitude: deliveryRoute[0]?.latitude || 0,
            longitude: deliveryRoute[0]?.longitude || 0,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
        >
          {/* Delivery Route */}
          {deliveryRoute.length > 0 && (
            <Polyline
              coordinates={deliveryRoute.map(point => ({
                latitude: point.latitude,
                longitude: point.longitude,
              }))}
              strokeColor={COLORS.primary}
              strokeWidth={3}
            />
          )}

          {/* Current Location Marker */}
          {orderStatus.location && (
            <Marker
              coordinate={{
                latitude: orderStatus.location.latitude,
                longitude: orderStatus.location.longitude,
              }}
            >
              <View style={styles.markerContainer}>
                <Icon
                  name="bike-fast"
                  size={24}
                  color={COLORS.white}
                  style={styles.markerIcon}
                />
              </View>
            </Marker>
          )}
        </MapView>
      </View>

      {/* Action Buttons */}
      <View style={styles.footer}>
        <Button
          title="Refresh"
          icon="refresh"
          onPress={() => {
            setLoading(true);
            trackingService.getOrderStatus(orderId)
              .then(setOrderStatus)
              .catch(error => {
                console.error('Error refreshing status:', error);
                Alert.alert('Error', 'Failed to refresh status');
              })
              .finally(() => setLoading(false));
          }}
          style={styles.refreshButton}
        />
        <Button
          title="Back to Order"
          icon="arrow-left"
          onPress={() => navigation.goBack()}
          style={styles.backButton}
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
  header: {
    padding: SPACING.m,
    backgroundColor: COLORS.white,
    alignItems: 'center',
  },
  statusText: {
    fontSize: SIZES.large,
    fontFamily: FONTS.bold,
    color: COLORS.black,
    marginTop: SPACING.s,
    marginBottom: SPACING.xs,
  },
  estimatedTime: {
    fontSize: SIZES.medium,
    fontFamily: FONTS.medium,
    color: COLORS.grey,
  },
  mapContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  map: {
    width: SCREEN_WIDTH,
    height: '100%',
  },
  markerContainer: {
    backgroundColor: COLORS.primary,
    padding: SPACING.s,
    borderRadius: SIZES.base * 2,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  markerIcon: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  footer: {
    padding: SPACING.m,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGrey,
  },
  refreshButton: {
    marginBottom: SPACING.s,
  },
  backButton: {
    marginBottom: SPACING.m,
  },
});

export default OrderTrackingScreen; 