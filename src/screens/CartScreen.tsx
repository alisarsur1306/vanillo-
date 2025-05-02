import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RestaurantStackParamList } from '../navigation/types';
import { cartService, CartItem } from '../services/cart';
import { COLORS, FONTS, SIZES, SPACING } from '../constants/theme';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Button from '../components/Button';

type CartScreenNavigationProp = NativeStackNavigationProp<RestaurantStackParamList, 'Cart'>;

const CartScreen = () => {
  const navigation = useNavigation<CartScreenNavigationProp>();
  const [cart, setCart] = useState(cartService.getCart());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = cartService.subscribe(setCart);
    return () => unsubscribe();
  }, []);

  const handleQuantityChange = async (itemId: string, change: number) => {
    const item = cart.items.find(item => item.id === itemId);
    if (item) {
      const newQuantity = item.quantity + change;
      if (newQuantity >= 1 && newQuantity <= 10) {
        await cartService.updateItemQuantity(itemId, newQuantity);
      }
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    Alert.alert(
      'Remove Item',
      'Are you sure you want to remove this item from your cart?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            await cartService.removeItem(itemId);
          },
        },
      ]
    );
  };

  const handleCheckout = async () => {
    setLoading(true);
    try {
      // TODO: Implement checkout functionality
      Alert.alert(
        'Checkout',
        'Proceeding to checkout...',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Checkout'),
          },
        ]
      );
    } catch (error) {
      console.error('Error during checkout:', error);
      Alert.alert('Error', 'Failed to process checkout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderCartItem = ({ item }: { item: CartItem }) => (
    <View style={styles.cartItem}>
      <Image
        source={{ uri: item.image }}
        style={styles.itemImage}
        defaultSource={require('../assets/placeholder.png')}
      />
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.restaurantName}>{item.restaurantName}</Text>
        <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
      </View>
      <View style={styles.quantityControls}>
        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => handleQuantityChange(item.id, -1)}
          disabled={item.quantity <= 1}
        >
          <Icon
            name="minus"
            size={20}
            color={item.quantity <= 1 ? COLORS.grey : COLORS.primary}
          />
        </TouchableOpacity>
        <Text style={styles.quantity}>{item.quantity}</Text>
        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => handleQuantityChange(item.id, 1)}
          disabled={item.quantity >= 10}
        >
          <Icon
            name="plus"
            size={20}
            color={item.quantity >= 10 ? COLORS.grey : COLORS.primary}
          />
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleRemoveItem(item.id)}
      >
        <Icon name="delete" size={24} color={COLORS.error} />
      </TouchableOpacity>
    </View>
  );

  if (cart.items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Icon name="cart-off" size={64} color={COLORS.grey} />
        <Text style={styles.emptyText}>Your cart is empty</Text>
        <Button
          title="Browse Restaurants"
          icon="food"
          onPress={() => navigation.navigate('RestaurantList')}
          style={styles.browseButton}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={cart.items}
        renderItem={renderCartItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Your Cart</Text>
            <Text style={styles.itemCount}>
              {cartService.getItemCount()} {cartService.getItemCount() === 1 ? 'item' : 'items'}
            </Text>
          </View>
        }
      />
      <View style={styles.footer}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalPrice}>${cart.total.toFixed(2)}</Text>
        </View>
        <Button
          title="Proceed to Checkout"
          icon="credit-card"
          onPress={handleCheckout}
          style={styles.checkoutButton}
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
  listContent: {
    padding: SPACING.m,
  },
  header: {
    marginBottom: SPACING.m,
  },
  headerTitle: {
    fontSize: SIZES.extraLarge,
    fontFamily: FONTS.bold,
    color: COLORS.black,
    marginBottom: SPACING.xs,
  },
  itemCount: {
    fontSize: SIZES.medium,
    fontFamily: FONTS.medium,
    color: COLORS.grey,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.base * 2,
    marginBottom: SPACING.m,
    padding: SPACING.m,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: SIZES.base,
    marginRight: SPACING.m,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: SIZES.medium,
    fontFamily: FONTS.bold,
    color: COLORS.black,
    marginBottom: SPACING.xs,
  },
  restaurantName: {
    fontSize: SIZES.font,
    fontFamily: FONTS.medium,
    color: COLORS.grey,
    marginBottom: SPACING.xs,
  },
  itemPrice: {
    fontSize: SIZES.medium,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING.m,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.lightGrey,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantity: {
    fontSize: SIZES.medium,
    fontFamily: FONTS.bold,
    color: COLORS.black,
    marginHorizontal: SPACING.s,
    minWidth: 24,
    textAlign: 'center',
  },
  removeButton: {
    padding: SPACING.xs,
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
    fontSize: SIZES.large,
    fontFamily: FONTS.medium,
    color: COLORS.black,
  },
  totalPrice: {
    fontSize: SIZES.extraLarge,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
  },
  checkoutButton: {
    marginBottom: SPACING.m,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyText: {
    fontSize: SIZES.large,
    fontFamily: FONTS.medium,
    color: COLORS.grey,
    marginTop: SPACING.m,
    marginBottom: SPACING.xl,
  },
  browseButton: {
    width: '100%',
  },
});

export default CartScreen; 