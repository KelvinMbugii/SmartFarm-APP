const mongoose = require('mongoose');

const consultationSchema = new mongoose.Schema({
    farmer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    officer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    subject: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'scheduled', 'in-progress', 'completed', 'cancelled'],
        default: 'pending'
    },
    scheduledDate: {
        type: Date
    },
    scheduledTime: {
        type: String
    },
    consultationType: {
        type: String,
        enum: ['in-person', 'video-call', 'phone-call', 'chat'],
        default: 'chat'
    },
    location: {
        type: String
    },
    notes: {
        type: String
    },
    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    feedback: {
        type: String
    },
    messages: [{
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
            required: true
        },
        content: {
            type: String,
            required: true
        },
        timestamp: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Consultation', consultationSchema);

