export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Orders: undefined;
  Profile: undefined;
};

export type RestaurantStackParamList = {
  RestaurantList: undefined;
  RestaurantDetails: { restaurantId: string };
  MenuItemDetails: { menuItemId: string };
  Cart: undefined;
  Checkout: undefined;
};

export type OrdersStackParamList = {
  OrdersList: undefined;
  OrderDetails: { orderId: string };
  OrderTracking: { orderId: string };
  Chat: { orderId: string };
}; 