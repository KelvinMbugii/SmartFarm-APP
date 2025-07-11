const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    content: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['text', 'image', 'file'],
        default: 'text'
    },
    fileUrl: {
        type: String,
        default: ''
    },
    readBy: [{
        user: {
            type:mongoose.Schema.Types.ObjectId,
            ref: 'user'
        },
        readAt:{
            type: Date,
            default: Date.now
        }
    }]
},{
    timestamp: true
});

const chatSchema = new mongoose.Schema({
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    }],
    messages: [messageSchema],
    lastMessage: {
        type: Date,
        default: Date.now
    },
    chatType:{
        type: String,
        enum: ['private', 'group'],
        default: 'private'
    },
    groupName: {
        type: String,
        default: ''
    }
},{
    timestamp: true
});

module.exports = mongoose.model('Chat', chatSchema);