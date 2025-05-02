export interface User {
    _id: string;
    name: string;
    email: string;
    phone: string;
    role: 'user' | 'restaurant_owner' | 'driver' | 'admin';
    address?: Address;
    profileImage?: string;
    isActive: boolean;
    lastLogin?: Date;
    createdAt: Date;
}

export interface Address {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    coordinates?: [number, number];
}

export interface MenuItem {
    _id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    image?: string;
    isAvailable: boolean;
    preparationTime: number;
}

export interface Restaurant {
    _id: string;
    name: string;
    owner: User;
    description: string;
    cuisine: string[];
    address: Address;
    contact: {
        phone: string;
        email: string;
    };
    images: string[];
    menu: MenuItem[];
    openingHours: {
        [key: string]: {
            open: string;
            close: string;
        };
    };
    rating: number;
    totalRatings: number;
    minimumOrder: number;
    deliveryFee: number;
    isActive: boolean;
    averagePreparationTime: number;
}

export interface OrderItem {
    menuItem: MenuItem;
    quantity: number;
    price: number;
    specialInstructions?: string;
}

export interface Order {
    _id: string;
    user: User;
    restaurant: Restaurant;
    driver?: User;
    items: OrderItem[];
    status: OrderStatus;
    totalAmount: number;
    deliveryFee: number;
    tax: number;
    grandTotal: number;
    paymentStatus: PaymentStatus;
    paymentMethod: PaymentMethod;
    deliveryAddress: Address;
    estimatedDeliveryTime?: Date;
    actualDeliveryTime?: Date;
    specialInstructions?: string;
    rating?: {
        food: number;
        delivery: number;
        comment?: string;
    };
    createdAt: Date;
    updatedAt: Date;
}

export type OrderStatus = 
    | 'pending'
    | 'confirmed'
    | 'preparing'
    | 'ready_for_pickup'
    | 'picked_up'
    | 'on_delivery'
    | 'delivered'
    | 'cancelled';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export type PaymentMethod = 'credit_card' | 'debit_card' | 'cash';

export interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
}

export interface RestaurantState {
    restaurants: Restaurant[];
    currentRestaurant: Restaurant | null;
    loading: boolean;
    error: string | null;
}

export interface OrderState {
    orders: Order[];
    currentOrder: Order | null;
    loading: boolean;
    error: string | null;
}

export interface RootState {
    auth: AuthState;
    restaurant: RestaurantState;
    order: OrderState;
} 