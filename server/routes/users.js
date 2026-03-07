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

        const users = await User.find(query)
          .select("name email role location Phone avatar isOnline LastSeen")
          .sort({ isOnline: -1, LastSeen: -1 });

        res.json(
          users.map((u) => {
            const obj = u.toObject();
            return {
              ...obj,
              phone: obj.phone || obj.Phone,
              lastSeen: obj.lastSeen || obj.LastSeen,
            };
          })
        );
    } catch (error){
        res.status(500).json({ error: error.message});
    }
});

// Get online users (presence)
router.get("/online", protect, async (req, res) => {
  try {
    const users = await User.find({ isOnline: true })
      .select("name email role location Phone avatar isOnline LastSeen")
      .sort({ LastSeen: -1 });

    res.json(
      users.map((u) => {
        const obj = u.toObject();
        return {
          ...obj,
          phone: obj.phone || obj.Phone,
          lastSeen: obj.lastSeen || obj.LastSeen,
        };
      })
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
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

// Update user profile (farmers, agripreneurs, officers, admin)
router.put('/profile', protect, authorizeRoles('farmer', 'agripreneur', 'officer', 'admin'), async (req, res) => {
    try {
        const updates = { ...req.body };
        delete updates.password;
        delete updates.email;
        if (updates.phone !== undefined) updates.Phone = updates.phone;
        delete updates.phone;
        if (Object.prototype.hasOwnProperty.call(updates, 'mpesaPhone')) {
            updates.mpesaPhone = updates.mpesaPhone ? String(updates.mpesaPhone).trim() : undefined;
        }

        const user = await User.findByIdAndUpdate(
            req.user._id,
            updates,
            { new: true }
        ).select('-password');

        res.json(user);
    } catch (error){
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;