import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Linking,
} from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp, useNavigation } from '@react-navigation/native-stack';
import { RestaurantStackParamList } from '../navigation/types';
import { restaurantService } from '../services/restaurant';
import { COLORS, FONTS, SIZES, SPACING } from '../constants/theme';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Button from '../components/Button';

type RestaurantDetailsRouteProp = RouteProp<RestaurantStackParamList, 'RestaurantDetails'>;
type RestaurantDetailsNavigationProp = NativeStackNavigationProp<RestaurantStackParamList, 'RestaurantDetails'>;

interface Restaurant {
  id: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  cuisine: string;
  rating: number;
  priceRange: string;
  openingHours: {
    [key: string]: {
      open: string;
      close: string;
    };
  };
  images: string[];
  isOpen: boolean;
}

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  restaurantId: string;
}

const RestaurantDetailsScreen = () => {
  const route = useRoute<RestaurantDetailsRouteProp>();
  const navigation = useNavigation<RestaurantDetailsNavigationProp>();
  const { restaurantId } = route.params;

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const fetchRestaurantDetails = async () => {
    try {
      setLoading(true);
      const [restaurantData, menuData] = await Promise.all([
        restaurantService.getRestaurantById(restaurantId),
        restaurantService.getRestaurantMenu(restaurantId),
      ]);
      setRestaurant(restaurantData);
      setMenuItems(menuData);
      
      // Set the first category as selected if available
      if (menuData.length > 0) {
        const categories = [...new Set(menuData.map(item => item.category))];
        setSelectedCategory(categories[0]);
      }
    } catch (error) {
      console.error('Error fetching restaurant details:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurantDetails();
  }, [restaurantId]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchRestaurantDetails();
    setRefreshing(false);
  };

  const handleCall = () => {
    if (restaurant?.phone) {
      Linking.openURL(`tel:${restaurant.phone}`);
    }
  };

  const handleEmail = () => {
    if (restaurant?.email) {
      Linking.openURL(`mailto:${restaurant.email}`);
    }
  };

  const handleDirections = () => {
    if (restaurant?.address) {
      const encodedAddress = encodeURIComponent(restaurant.address);
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`);
    }
  };

  const getCategories = () => {
    const categories = [...new Set(menuItems.map(item => item.category))];
    return ['All', ...categories];
  };

  const filteredMenuItems = selectedCategory === 'All' 
    ? menuItems 
    : menuItems.filter(item => item.category === selectedCategory);

  const renderMenuItem = ({ item }: { item: MenuItem }) => (
    <TouchableOpacity 
      style={styles.menuItemCard}
      onPress={() => navigation.navigate('MenuItemDetails', { 
        restaurantId, 
        menuItemId: item.id 
      })}
    >
      <Image
        source={{ uri: item.image }}
        style={styles.menuItemImage}
        defaultSource={require('../assets/placeholder.png')}
      />
      <View style={styles.menuItemInfo}>
        <Text style={styles.menuItemName}>{item.name}</Text>
        <Text style={styles.menuItemDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <Text style={styles.menuItemPrice}>${item.price.toFixed(2)}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading && !restaurant) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!restaurant) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="alert-circle" size={48} color={COLORS.error} />
        <Text style={styles.errorText}>Restaurant not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Restaurant Header */}
        <View style={styles.header}>
          <Image
            source={{ uri: restaurant.images[0] }}
            style={styles.headerImage}
            defaultSource={require('../assets/placeholder.png')}
          />
          <View style={styles.headerOverlay}>
            <Text style={styles.restaurantName}>{restaurant.name}</Text>
            <View style={styles.restaurantMeta}>
              <View style={styles.ratingContainer}>
                <Icon name="star" size={16} color={COLORS.primary} />
                <Text style={styles.rating}>{restaurant.rating.toFixed(1)}</Text>
              </View>
              <Text style={styles.cuisine}>{restaurant.cuisine}</Text>
              <Text style={styles.priceRange}>{restaurant.priceRange}</Text>
            </View>
          </View>
        </View>

        {/* Restaurant Info */}
        <View style={styles.infoSection}>
          <Text style={styles.description}>{restaurant.description}</Text>
          
          <View style={styles.contactInfo}>
            <View style={styles.contactItem}>
              <Icon name="map-marker" size={20} color={COLORS.primary} />
              <Text style={styles.contactText}>{restaurant.address}</Text>
            </View>
            
            <View style={styles.contactItem}>
              <Icon name="phone" size={20} color={COLORS.primary} />
              <Text style={styles.contactText}>{restaurant.phone}</Text>
            </View>
            
            <View style={styles.contactItem}>
              <Icon name="email" size={20} color={COLORS.primary} />
              <Text style={styles.contactText}>{restaurant.email}</Text>
            </View>
          </View>

          <View style={styles.actionButtons}>
            <Button 
              title="Call" 
              icon="phone" 
              onPress={handleCall}
              style={styles.actionButton}
            />
            <Button 
              title="Email" 
              icon="email" 
              onPress={handleEmail}
              style={styles.actionButton}
            />
            <Button 
              title="Directions" 
              icon="directions" 
              onPress={handleDirections}
              style={styles.actionButton}
            />
          </View>

          <View style={styles.openingHours}>
            <Text style={styles.sectionTitle}>Opening Hours</Text>
            {Object.entries(restaurant.openingHours).map(([day, hours]) => (
              <View key={day} style={styles.hoursRow}>
                <Text style={styles.dayText}>{day}</Text>
                <Text style={styles.hoursText}>
                  {hours.open} - {hours.close}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Menu Section */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Menu</Text>
          
          <View style={styles.categoryFilter}>
            <FlatList
              data={getCategories()}
              horizontal
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.categoryChip,
                    selectedCategory === item && styles.selectedCategoryChip,
                  ]}
                  onPress={() => setSelectedCategory(item)}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      selectedCategory === item && styles.selectedCategoryChipText,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item}
            />
          </View>

          {loading ? (
            <ActivityIndicator size="large" color={COLORS.primary} />
          ) : (
            <FlatList
              data={filteredMenuItems}
              renderItem={renderMenuItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Icon name="food-off" size={48} color={COLORS.grey} />
                  <Text style={styles.emptyText}>No menu items found</Text>
                </View>
              }
            />
          )}
        </View>
      </ScrollView>
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
    height: 250,
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
    fontSize: SIZES.extraLarge,
    fontFamily: FONTS.bold,
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  restaurantMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.m,
  },
  rating: {
    fontSize: SIZES.font,
    fontFamily: FONTS.medium,
    color: COLORS.white,
    marginLeft: SPACING.xs,
  },
  cuisine: {
    fontSize: SIZES.font,
    fontFamily: FONTS.medium,
    color: COLORS.white,
    marginRight: SPACING.m,
  },
  priceRange: {
    fontSize: SIZES.font,
    fontFamily: FONTS.medium,
    color: COLORS.white,
  },
  infoSection: {
    padding: SPACING.m,
    backgroundColor: COLORS.white,
  },
  description: {
    fontSize: SIZES.medium,
    fontFamily: FONTS.regular,
    color: COLORS.black,
    marginBottom: SPACING.m,
    lineHeight: 24,
  },
  contactInfo: {
    marginBottom: SPACING.m,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.s,
  },
  contactText: {
    fontSize: SIZES.font,
    fontFamily: FONTS.medium,
    color: COLORS.black,
    marginLeft: SPACING.s,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.m,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: SPACING.xs,
  },
  openingHours: {
    marginBottom: SPACING.m,
  },
  sectionTitle: {
    fontSize: SIZES.large,
    fontFamily: FONTS.bold,
    color: COLORS.black,
    marginBottom: SPACING.m,
  },
  hoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  dayText: {
    fontSize: SIZES.font,
    fontFamily: FONTS.medium,
    color: COLORS.black,
  },
  hoursText: {
    fontSize: SIZES.font,
    fontFamily: FONTS.regular,
    color: COLORS.grey,
  },
  menuSection: {
    padding: SPACING.m,
    backgroundColor: COLORS.white,
  },
  categoryFilter: {
    marginBottom: SPACING.m,
  },
  categoryChip: {
    paddingHorizontal: SPACING.m,
    paddingVertical: SPACING.xs,
    borderRadius: SIZES.base * 4,
    backgroundColor: COLORS.lightGrey,
    marginHorizontal: SPACING.xs,
  },
  selectedCategoryChip: {
    backgroundColor: COLORS.primary,
  },
  categoryChipText: {
    fontSize: SIZES.font,
    fontFamily: FONTS.medium,
    color: COLORS.black,
  },
  selectedCategoryChipText: {
    color: COLORS.white,
  },
  menuItemCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.base * 2,
    marginBottom: SPACING.m,
    overflow: 'hidden',
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
  menuItemImage: {
    width: 100,
    height: 100,
    resizeMode: 'cover',
  },
  menuItemInfo: {
    flex: 1,
    padding: SPACING.m,
  },
  menuItemName: {
    fontSize: SIZES.medium,
    fontFamily: FONTS.bold,
    color: COLORS.black,
    marginBottom: SPACING.xs,
  },
  menuItemDescription: {
    fontSize: SIZES.font,
    fontFamily: FONTS.regular,
    color: COLORS.grey,
    marginBottom: SPACING.s,
  },
  menuItemPrice: {
    fontSize: SIZES.medium,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
  },
  emptyContainer: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: SIZES.medium,
    fontFamily: FONTS.medium,
    color: COLORS.grey,
    marginTop: SPACING.m,
  },
});

export default RestaurantDetailsScreen; 