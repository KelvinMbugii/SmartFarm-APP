const express = require('express');
const User = require('../models/user');
const { protect, authorizeRoles } = require("../middlewares/auth");


const router = express.Router();

// Get all users
router.get('/', protect, async ( req, res) => {
    try {
        const { role, search } = req.query;

        const query = {_id: { $ne: req.user.userId }};
        if (role) query.role = role;
        if (search){
            query.$or = [
                { name: {$regex: search, $options: 'i'}},
                { email: {$regex: search, $options: 'i'}},
                { location: { $regex: search, $options: 'i'}}
            ];
        }

        const users = await User.find(query).select('name email role location phone avatar isOnline lastSeen')
        .sort({ isOnline: -1, lastSeen: -1});

        res.json(users);
    } catch (error){
        res.status(500).json({ error: error.message});
    }
});

// Get user Profile
router.get('/:id', protect, async (req, res) => {
    try{
        const user = await User.findById(req.params.id).select('-password');

        if(!user) {
            return res.status(404).json({ error: 'User not found'});
        }
         
        res.json(user);
    }catch (error){
        res.status(500).json({ error: error.message});
    }
});

// Update user profile
router.put('/profile', protect, authorizeRoles('farmer', 'officer'), async (req, res) => {
    try {
        const updates = req.body;
        delete updates.password;

        const user = await User.findByIdAndUpdate(
            req.user.userId,
            updates,
            { new: true }
        ).select('-password');

        res.json(user);
    } catch (error){
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;