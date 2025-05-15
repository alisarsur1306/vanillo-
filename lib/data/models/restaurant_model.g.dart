// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'restaurant_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Restaurant _$RestaurantFromJson(Map<String, dynamic> json) => Restaurant(
      id: json['id'] as String,
      userId: json['userId'] as String,
      name: json['name'] as String,
      description: json['description'] as String,
      cuisine: json['cuisine'] as String,
      address: json['address'] as String,
      phone: json['phone'] as String,
      email: json['email'] as String,
      openingHours: json['openingHours'] as String,
      isVerified: json['isVerified'] as bool,
      isActive: json['isActive'] as bool,
      rating: (json['rating'] as num).toDouble(),
      imageUrl: json['imageUrl'] as String?,
      deliveryRadius: (json['deliveryRadius'] as num).toDouble(),
      minimumOrder: (json['minimumOrder'] as num).toDouble(),
      averageDeliveryTime: (json['averageDeliveryTime'] as num).toInt(),
      menu: (json['menu'] as List<dynamic>?)
          ?.map((e) => MenuItem.fromJson(e as Map<String, dynamic>))
          .toList(),
    );

Map<String, dynamic> _$RestaurantToJson(Restaurant instance) =>
    <String, dynamic>{
      'id': instance.id,
      'userId': instance.userId,
      'name': instance.name,
      'description': instance.description,
      'cuisine': instance.cuisine,
      'address': instance.address,
      'phone': instance.phone,
      'email': instance.email,
      'openingHours': instance.openingHours,
      'isVerified': instance.isVerified,
      'isActive': instance.isActive,
      'rating': instance.rating,
      'imageUrl': instance.imageUrl,
      'deliveryRadius': instance.deliveryRadius,
      'minimumOrder': instance.minimumOrder,
      'averageDeliveryTime': instance.averageDeliveryTime,
      'menu': instance.menu,
    };
