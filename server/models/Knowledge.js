const mongoose = require('mongoose');

const knowledgeSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    content: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: ['crops', 'livestock', 'pest-control', 'irrigation', 'soil-management', 'organic-farming', 'technology', 'market-tips', 'general'],
        default: 'general'
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    tags: [{
        type: String,
        trim: true
    }],
    views: {
        type: Number,
        default: 0
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    }],
    featured: {
        type: Boolean,
        default: false
    },
    image: {
        type: String,
        default: ''
    },
    attachments: [{
        name: String,
        url: String,
        type: String
    }]
}, {
    timestamps: true
});

// Index for search
knowledgeSchema.index({ title: 'text', content: 'text', tags: 'text' });

module.exports = mongoose.model('Knowledge', knowledgeSchema);

