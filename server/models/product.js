const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: ['tractors', 'harvesters', 'irrigation', 'tools', 'seeds', 'fertilizers', 'pesticides']
    },
    price: {
        type: Number,
        required: true
    },
    condition: {
        type: String,
        enum: ['new', 'used', 'refurbished'],
        required: true
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    images: [{
        type: String
    }],
    specifications: {
        brand: String,
        model: String,
        year: Number,
        power: String,
        features: [String]
    },
    availability: {
        type: String,
        enum: ['available', 'sold', 'reserved'],
        default: 'available'
    },
    location: {
        type: String,
        required: true
    },
    views: {
        type: Number,
        default: 0
    },
    featured: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('product', productSchema);