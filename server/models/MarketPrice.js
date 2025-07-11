const mongoose = require('mongoose');

const priceSchema = new mongoose.Schema({
    commodity: {
        type: String,
        required: true
    },
    variety: {
        type: String,
        required: true
    },
    market: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    unit: {
        type: String,
        required: true
    },
    date :{
        type: Date,
        default: Date.now
    },
},{
    timestamps: true
});

module.exports = mongoose.model('MarketPrice', priceSchema);