const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    menuItem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant.menu',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    price: {
        type: Number,
        required: true
    },
    specialInstructions: String
});

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    restaurant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: true
    },
    driver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    items: [orderItemSchema],
    status: {
        type: String,
        enum: [
            'pending',
            'confirmed',
            'preparing',
            'ready_for_pickup',
            'picked_up',
            'on_delivery',
            'delivered',
            'cancelled'
        ],
        default: 'pending'
    },
    deliveryType: {
        type: String,
        enum: ['take_away', 'delivery'],
        required: true,
        default: 'delivery'
    },
    totalAmount: {
        type: Number,
        required: true
    },
    deliveryFee: {
        type: Number,
        required: true
    },
    tax: {
        type: Number,
        required: true
    },
    grandTotal: {
        type: Number,
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending'
    },
    paymentMethod: {
        type: String,
        enum: ['credit_card', 'debit_card', 'cash'],
        required: true
    },
    deliveryAddress: {
        street: {
            type: String,
            required: function() {
                return this.deliveryType === 'delivery';
            }
        },
        city: {
            type: String,
            required: function() {
                return this.deliveryType === 'delivery';
            }
        },
        state: {
            type: String,
            required: function() {
                return this.deliveryType === 'delivery';
            }
        },
        zipCode: {
            type: String,
            required: function() {
                return this.deliveryType === 'delivery';
            }
        },
        country: {
            type: String,
            required: function() {
                return this.deliveryType === 'delivery';
            }
        },
        coordinates: {
            type: {
                type: String,
                enum: ['Point'],
                default: 'Point'
            },
            coordinates: {
                type: [Number],
                required: true
            }
        }
    },
    estimatedDeliveryTime: Date,
    actualDeliveryTime: Date,
    specialInstructions: String,
    rating: {
        food: {
            type: Number,
            min: 1,
            max: 5
        },
        delivery: {
            type: Number,
            min: 1,
            max: 5
        },
        comment: String
    }
}, {
    timestamps: true
});

// Index for geospatial queries
orderSchema.index({ "deliveryAddress.coordinates": "2dsphere" });

// Calculate total amount before saving
orderSchema.pre('save', function(next) {
    if (this.isModified('items')) {
        this.totalAmount = this.items.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);
        
        this.grandTotal = this.totalAmount + this.deliveryFee + this.tax;
    }
    next();
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order; 