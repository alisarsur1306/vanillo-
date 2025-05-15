// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'order_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

OrderItem _$OrderItemFromJson(Map<String, dynamic> json) => OrderItem(
      id: json['id'] as String,
      menuItemId: json['menuItemId'] as String,
      quantity: (json['quantity'] as num).toInt(),
      unitPrice: (json['unitPrice'] as num).toDouble(),
      totalPrice: (json['totalPrice'] as num).toDouble(),
      specialInstructions: json['specialInstructions'] as String?,
      customizations: json['customizations'] as Map<String, dynamic>?,
      menuItem: json['menuItem'] == null
          ? null
          : MenuItem.fromJson(json['menuItem'] as Map<String, dynamic>),
    );

Map<String, dynamic> _$OrderItemToJson(OrderItem instance) => <String, dynamic>{
      'id': instance.id,
      'menuItemId': instance.menuItemId,
      'quantity': instance.quantity,
      'unitPrice': instance.unitPrice,
      'totalPrice': instance.totalPrice,
      'specialInstructions': instance.specialInstructions,
      'customizations': instance.customizations,
      'menuItem': instance.menuItem,
    };

Order _$OrderFromJson(Map<String, dynamic> json) => Order(
      id: json['id'] as String,
      customerId: json['customerId'] as String,
      restaurantId: json['restaurantId'] as String,
      driverId: json['driverId'] as String?,
      status: $enumDecode(_$OrderStatusEnumMap, json['status']),
      paymentStatus: $enumDecode(_$PaymentStatusEnumMap, json['paymentStatus']),
      totalAmount: (json['totalAmount'] as num).toDouble(),
      deliveryFee: (json['deliveryFee'] as num).toDouble(),
      tax: (json['tax'] as num).toDouble(),
      deliveryAddress: json['deliveryAddress'] as String,
      specialInstructions: json['specialInstructions'] as String?,
      estimatedDeliveryTime: json['estimatedDeliveryTime'] == null
          ? null
          : DateTime.parse(json['estimatedDeliveryTime'] as String),
      actualDeliveryTime: json['actualDeliveryTime'] == null
          ? null
          : DateTime.parse(json['actualDeliveryTime'] as String),
      paymentMethod: $enumDecode(_$PaymentMethodEnumMap, json['paymentMethod']),
      paymentIntentId: json['paymentIntentId'] as String?,
      refundId: json['refundId'] as String?,
      items: (json['items'] as List<dynamic>)
          .map((e) => OrderItem.fromJson(e as Map<String, dynamic>))
          .toList(),
      customer: json['customer'] == null
          ? null
          : User.fromJson(json['customer'] as Map<String, dynamic>),
      restaurant: json['restaurant'] == null
          ? null
          : Restaurant.fromJson(json['restaurant'] as Map<String, dynamic>),
      driver: json['driver'] == null
          ? null
          : User.fromJson(json['driver'] as Map<String, dynamic>),
    );

Map<String, dynamic> _$OrderToJson(Order instance) => <String, dynamic>{
      'id': instance.id,
      'customerId': instance.customerId,
      'restaurantId': instance.restaurantId,
      'driverId': instance.driverId,
      'status': _$OrderStatusEnumMap[instance.status]!,
      'paymentStatus': _$PaymentStatusEnumMap[instance.paymentStatus]!,
      'totalAmount': instance.totalAmount,
      'deliveryFee': instance.deliveryFee,
      'tax': instance.tax,
      'deliveryAddress': instance.deliveryAddress,
      'specialInstructions': instance.specialInstructions,
      'estimatedDeliveryTime':
          instance.estimatedDeliveryTime?.toIso8601String(),
      'actualDeliveryTime': instance.actualDeliveryTime?.toIso8601String(),
      'paymentMethod': _$PaymentMethodEnumMap[instance.paymentMethod]!,
      'paymentIntentId': instance.paymentIntentId,
      'refundId': instance.refundId,
      'items': instance.items,
      'customer': instance.customer,
      'restaurant': instance.restaurant,
      'driver': instance.driver,
    };

const _$OrderStatusEnumMap = {
  OrderStatus.pending: 'pending',
  OrderStatus.confirmed: 'confirmed',
  OrderStatus.preparing: 'preparing',
  OrderStatus.readyForPickup: 'ready_for_pickup',
  OrderStatus.outForDelivery: 'out_for_delivery',
  OrderStatus.delivered: 'delivered',
  OrderStatus.cancelled: 'cancelled',
};

const _$PaymentStatusEnumMap = {
  PaymentStatus.pending: 'pending',
  PaymentStatus.paid: 'paid',
  PaymentStatus.failed: 'failed',
  PaymentStatus.refunded: 'refunded',
};

const _$PaymentMethodEnumMap = {
  PaymentMethod.creditCard: 'credit_card',
  PaymentMethod.debitCard: 'debit_card',
  PaymentMethod.cash: 'cash',
};
