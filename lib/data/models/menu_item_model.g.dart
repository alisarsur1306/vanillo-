// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'menu_item_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

MenuItem _$MenuItemFromJson(Map<String, dynamic> json) => MenuItem(
      id: json['id'] as String,
      restaurantId: json['restaurantId'] as String,
      name: json['name'] as String,
      description: json['description'] as String,
      price: (json['price'] as num).toDouble(),
      category: json['category'] as String,
      imageUrl: json['imageUrl'] as String?,
      isAvailable: json['isAvailable'] as bool,
      preparationTime: (json['preparationTime'] as num).toInt(),
      isVegetarian: json['isVegetarian'] as bool,
      isVegan: json['isVegan'] as bool,
      isGlutenFree: json['isGlutenFree'] as bool,
      spicyLevel: (json['spicyLevel'] as num).toInt(),
      calories: (json['calories'] as num?)?.toInt(),
      customizationOptions:
          json['customizationOptions'] as Map<String, dynamic>?,
    );

Map<String, dynamic> _$MenuItemToJson(MenuItem instance) => <String, dynamic>{
      'id': instance.id,
      'restaurantId': instance.restaurantId,
      'name': instance.name,
      'description': instance.description,
      'price': instance.price,
      'category': instance.category,
      'imageUrl': instance.imageUrl,
      'isAvailable': instance.isAvailable,
      'preparationTime': instance.preparationTime,
      'isVegetarian': instance.isVegetarian,
      'isVegan': instance.isVegan,
      'isGlutenFree': instance.isGlutenFree,
      'spicyLevel': instance.spicyLevel,
      'calories': instance.calories,
      'customizationOptions': instance.customizationOptions,
    };
