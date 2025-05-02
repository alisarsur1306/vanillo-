import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RestaurantStackParamList } from '../navigation/types';
import { restaurantService } from '../services/restaurant';
import { cartService } from '../services/cart';
import { COLORS, FONTS, SIZES, SPACING } from '../constants/theme';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Button from '../components/Button';

type MenuItemDetailsRouteProp = RouteProp<RestaurantStackParamList, 'MenuItemDetails'>;
type MenuItemDetailsNavigationProp = NativeStackNavigationProp<RestaurantStackParamList, 'MenuItemDetails'>;

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  restaurantId: string;
}

interface Restaurant {
  id: string;
  name: string;
}

const MenuItemDetailsScreen = () => {
  const route = useRoute<MenuItemDetailsRouteProp>();
  const navigation = useNavigation<MenuItemDetailsNavigationProp>();
  const { restaurantId, menuItemId } = route.params;

  const [menuItem, setMenuItem] = useState<MenuItem | null>(null);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const fetchMenuItemDetails = async () => {
    try {
      setLoading(true);
      const [menuItemData, restaurantData] = await Promise.all([
        restaurantService.getMenuItem(restaurantId, menuItemId),
        restaurantService.getRestaurantById(restaurantId),
      ]);
      setMenuItem(menuItemData);
      setRestaurant(restaurantData);
    } catch (error) {
      console.error('Error fetching menu item details:', error);
      Alert.alert(
        'Error',
        'Failed to load menu item details. Please try again.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuItemDetails();
  }, [restaurantId, menuItemId]);

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = async () => {
    if (!menuItem) return;
    
    try {
      setAddingToCart(true);
      await cartService.addItem(menuItemId, restaurantId, quantity);
      
      Alert.alert(
        'Added to Cart',
        `${quantity} ${quantity === 1 ? 'item' : 'items'} added to cart`,
        [
          {
            text: 'Continue Shopping',
            style: 'cancel',
          },
          {
            text: 'View Cart',
            onPress: () => navigation.navigate('Cart'),
          },
        ]
      );
    } catch (error) {
      console.error('Error adding item to cart:', error);
      Alert.alert('Error', 'Failed to add item to cart. Please try again.');
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!menuItem || !restaurant) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="alert-circle" size={48} color={COLORS.error} />
        <Text style={styles.errorText}>Menu item not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Menu Item Header */}
        <View style={styles.header}>
          <Image
            source={{ uri: menuItem.image }}
            style={styles.headerImage}
            defaultSource={require('../assets/placeholder.png')}
          />
          <View style={styles.headerOverlay}>
            <Text style={styles.restaurantName}>{restaurant.name}</Text>
            <Text style={styles.category}>{menuItem.category}</Text>
          </View>
        </View>

        {/* Menu Item Info */}
        <View style={styles.infoSection}>
          <Text style={styles.itemName}>{menuItem.name}</Text>
          <Text style={styles.price}>${menuItem.price.toFixed(2)}</Text>
          
          <Text style={styles.description}>{menuItem.description}</Text>
        </View>

        {/* Quantity Selector */}
        <View style={styles.quantitySection}>
          <Text style={styles.quantityLabel}>Quantity</Text>
          <View style={styles.quantityControls}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => handleQuantityChange(-1)}
              disabled={quantity <= 1}
            >
              <Icon
                name="minus"
                size={24}
                color={quantity <= 1 ? COLORS.grey : COLORS.primary}
              />
            </TouchableOpacity>
            <Text style={styles.quantity}>{quantity}</Text>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => handleQuantityChange(1)}
              disabled={quantity >= 10}
            >
              <Icon
                name="plus"
                size={24}
                color={quantity >= 10 ? COLORS.grey : COLORS.primary}
              />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Add to Cart Button */}
      <View style={styles.footer}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalPrice}>
            ${(menuItem.price * quantity).toFixed(2)}
          </Text>
        </View>
        <Button
          title="Add to Cart"
          icon="cart-plus"
          onPress={handleAddToCart}
          style={styles.addToCartButton}
          loading={addingToCart}
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
    height: 300,
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  headerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.m,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  restaurantName: {
    fontSize: SIZES.large,
    fontFamily: FONTS.bold,
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  category: {
    fontSize: SIZES.font,
    fontFamily: FONTS.medium,
    color: COLORS.white,
  },
  infoSection: {
    padding: SPACING.m,
    backgroundColor: COLORS.white,
  },
  itemName: {
    fontSize: SIZES.extraLarge,
    fontFamily: FONTS.bold,
    color: COLORS.black,
    marginBottom: SPACING.xs,
  },
  price: {
    fontSize: SIZES.large,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
    marginBottom: SPACING.m,
  },
  description: {
    fontSize: SIZES.medium,
    fontFamily: FONTS.regular,
    color: COLORS.black,
    lineHeight: 24,
  },
  quantitySection: {
    padding: SPACING.m,
    backgroundColor: COLORS.white,
    marginTop: SPACING.s,
  },
  quantityLabel: {
    fontSize: SIZES.medium,
    fontFamily: FONTS.medium,
    color: COLORS.black,
    marginBottom: SPACING.m,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.lightGrey,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantity: {
    fontSize: SIZES.large,
    fontFamily: FONTS.bold,
    color: COLORS.black,
    marginHorizontal: SPACING.m,
    minWidth: 40,
    textAlign: 'center',
  },
  footer: {
    padding: SPACING.m,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGrey,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.m,
  },
  totalLabel: {
    fontSize: SIZES.medium,
    fontFamily: FONTS.medium,
    color: COLORS.black,
  },
  totalPrice: {
    fontSize: SIZES.large,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
  },
  addToCartButton: {
    marginBottom: SPACING.m,
  },
});

export default MenuItemDetailsScreen; 