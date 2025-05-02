import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RestaurantStackParamList } from '../navigation/types';
import { restaurantService } from '../services/restaurant';
import { COLORS, FONTS, SIZES, SPACING } from '../constants/theme';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Input from '../components/Input';

type HomeScreenNavigationProp = NativeStackNavigationProp<RestaurantStackParamList, 'RestaurantList'>;

interface Restaurant {
  id: string;
  name: string;
  description: string;
  cuisine: string;
  rating: number;
  priceRange: string;
  images: string[];
  isOpen: boolean;
}

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState<string | null>(null);

  const cuisines = [
    'All',
    'Italian',
    'Chinese',
    'Japanese',
    'Indian',
    'Mexican',
    'Thai',
    'American',
  ];

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const response = await restaurantService.getRestaurants({
        cuisine: selectedCuisine === 'All' ? undefined : selectedCuisine,
        search: searchQuery,
      });
      setRestaurants(response.restaurants);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, [selectedCuisine]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchRestaurants();
    setRefreshing(false);
  };

  const handleSearch = async () => {
    await fetchRestaurants();
  };

  const renderRestaurantItem = ({ item }: { item: Restaurant }) => (
    <TouchableOpacity
      style={styles.restaurantCard}
      onPress={() => navigation.navigate('RestaurantDetails', { restaurantId: item.id })}
    >
      <Image
        source={{ uri: item.images[0] }}
        style={styles.restaurantImage}
        defaultSource={require('../assets/placeholder.png')}
      />
      <View style={styles.restaurantInfo}>
        <Text style={styles.restaurantName}>{item.name}</Text>
        <Text style={styles.restaurantCuisine}>{item.cuisine}</Text>
        <View style={styles.restaurantDetails}>
          <View style={styles.ratingContainer}>
            <Icon name="star" size={16} color={COLORS.primary} />
            <Text style={styles.rating}>{item.rating.toFixed(1)}</Text>
          </View>
          <Text style={styles.priceRange}>{item.priceRange}</Text>
          <View style={styles.openStatus}>
            <Icon
              name={item.isOpen ? 'check-circle' : 'close-circle'}
              size={16}
              color={item.isOpen ? COLORS.success : COLORS.error}
            />
            <Text style={[styles.openStatusText, { color: item.isOpen ? COLORS.success : COLORS.error }]}>
              {item.isOpen ? 'Open' : 'Closed'}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Input
          placeholder="Search restaurants..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          leftIcon="magnify"
          rightIcon="close"
          onRightIconPress={() => setSearchQuery('')}
        />
      </View>

      <View style={styles.cuisineFilter}>
        <FlatList
          data={cuisines}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.cuisineChip,
                selectedCuisine === item && styles.selectedCuisineChip,
              ]}
              onPress={() => setSelectedCuisine(item)}
            >
              <Text
                style={[
                  styles.cuisineChipText,
                  selectedCuisine === item && styles.selectedCuisineChipText,
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
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={restaurants}
          renderItem={renderRestaurantItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.restaurantList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="food-off" size={48} color={COLORS.grey} />
              <Text style={styles.emptyText}>No restaurants found</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: SPACING.m,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGrey,
  },
  cuisineFilter: {
    paddingVertical: SPACING.s,
    backgroundColor: COLORS.white,
  },
  cuisineChip: {
    paddingHorizontal: SPACING.m,
    paddingVertical: SPACING.xs,
    borderRadius: SIZES.base * 4,
    backgroundColor: COLORS.lightGrey,
    marginHorizontal: SPACING.xs,
  },
  selectedCuisineChip: {
    backgroundColor: COLORS.primary,
  },
  cuisineChipText: {
    fontSize: SIZES.font,
    fontFamily: FONTS.medium,
    color: COLORS.black,
  },
  selectedCuisineChipText: {
    color: COLORS.white,
  },
  restaurantList: {
    padding: SPACING.m,
  },
  restaurantCard: {
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
  restaurantImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  restaurantInfo: {
    padding: SPACING.m,
  },
  restaurantName: {
    fontSize: SIZES.large,
    fontFamily: FONTS.bold,
    color: COLORS.black,
    marginBottom: SPACING.xs,
  },
  restaurantCuisine: {
    fontSize: SIZES.font,
    fontFamily: FONTS.medium,
    color: COLORS.grey,
    marginBottom: SPACING.s,
  },
  restaurantDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: SIZES.font,
    fontFamily: FONTS.medium,
    color: COLORS.black,
    marginLeft: SPACING.xs,
  },
  priceRange: {
    fontSize: SIZES.font,
    fontFamily: FONTS.medium,
    color: COLORS.black,
  },
  openStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  openStatusText: {
    fontSize: SIZES.font,
    fontFamily: FONTS.medium,
    marginLeft: SPACING.xs,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  emptyText: {
    fontSize: SIZES.medium,
    fontFamily: FONTS.medium,
    color: COLORS.grey,
    marginTop: SPACING.m,
  },
});

export default HomeScreen; 