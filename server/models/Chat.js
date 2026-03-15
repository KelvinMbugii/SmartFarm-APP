const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    }],
    chatType: {
        type: String,
        enum: ['private', 'group'],
        default: 'private'
    },
    groupName: {
        type: String,
        trim: true
    },
    lastMessage: {
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
            required: true
        },
        type : {
            type: String,
            required: true
        },
        createdAt: Date,
        
    },
    
});

module.exports = mongoose.model('Chat', chatSchema);