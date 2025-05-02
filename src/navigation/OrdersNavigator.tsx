import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import OrdersListScreen from '../screens/orders/OrdersListScreen';
import OrderDetailsScreen from '../screens/orders/OrderDetailsScreen';
import OrderTrackingScreen from '../screens/orders/OrderTrackingScreen';
import ChatScreen from '../screens/orders/ChatScreen';
import { OrdersStackParamList } from './types';

const Stack = createStackNavigator<OrdersStackParamList>();

const OrdersNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#fff',
        },
        headerTintColor: '#000',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="OrdersList"
        component={OrdersListScreen}
        options={{ title: 'My Orders' }}
      />
      <Stack.Screen
        name="OrderDetails"
        component={OrderDetailsScreen}
        options={{ title: 'Order Details' }}
      />
      <Stack.Screen
        name="OrderTracking"
        component={OrderTrackingScreen}
        options={{ title: 'Track Order' }}
      />
      <Stack.Screen
        name="Chat"
        component={ChatScreen}
        options={{ title: 'Chat with Delivery' }}
      />
    </Stack.Navigator>
  );
};

export default OrdersNavigator; 