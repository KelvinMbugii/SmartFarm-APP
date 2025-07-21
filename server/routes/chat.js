const express = require('express');
const Chat = require('../models/Chat');
const auth = require('../middlewares/auth');

const router = express.Router();

// Get All chats
router.get('/', auth.protect, async( req, res ) => {
    try{
        const chats = await Chat.find({
            participants: req.user.userId
        })
        .populate('participants', 'name email role avatar isOnline')
        .sort({ lastMessage: -1});

        res.json(chats);
    }catch (error){
        res.status(500).json({ error: error.message });
    }
});

// Get specific chats
router.get('/:chatId', auth.protect, async(req, res) => {
    try{
        const chat = await Chat.findOne({
            _id: req.params.chatId,
            participants: req.user.userId
        })
        .populate('participants', 'name email role avatar isOnline')
        .populate('messages.sender', 'name avatar');

        if (!chat){
            return res.status(404).json({ error: 'Chat not found'});
        }

        res.json(chat)
    }catch (error){
        res.status(500).json({ error: error.message });
    }
});

// Create new Chat
router.post('/', auth.protect, async (req, res) =>{
    try{
        const { participantId, message} = req.body;

        let chat = await Chat.findOne({
            participants: { $all: [req.user.userId, participantsId]},
            chatType: 'private'
        });

        if (!chat){
            chat = new Chat({
                participants: [ req.user.userId, participantsId],
                chatType: 'private'
            });
        }

        if (message){
            chat.messages.push({
                sender: req.user.userId,
                content: message,
                type: 'text'
            });
            chat.lastMessage = new Date();
        }

        await chat.save();
        await chat.populate('participants', 'name email role avatar isOnline');

        res.status(201).json(chat);
    }catch (error){
        res.status(500).json({ error: error.message });
    }
});

// sending messages
router.post('/:chatId/message', auth.protect, async (req, res) => {
    try {
        const { content, type = 'text' } = req.body;

        const chat = await Chat.findOne({
            _id: req.params.chatId,
            participants: req.user.userId
        });

        if (!chat) {
            return res.status(404).json({ error: 'Chat not found'});
        }

        const message = {
            sender: req.user.userId,
            content,
            type
        };

        chat.messages.push(message);
        chat.lastMessage = new Date();
        await chat.save();

        await chat.populate('messages.sender', 'name avatar');

        res.status(201).json(chat.messages[chat.messages.length -1]);
    } catch (error){
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;