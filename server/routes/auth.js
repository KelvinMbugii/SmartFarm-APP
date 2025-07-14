const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/user')
const auth = require('../middlewares/auth');

const router = express.Router();

// Register route
router.post('/register', async(req,res) => {
    try{
    const { name, email, password, role, location, phone, farmDetails} = req.body;

    // Check if the user exists
    const existingUser = await User.findOne({email});

    if(existingUser){
        return res.status(400).json({error: 'User already exists'});
    }

    // Creating new User
    const user = new User({
        name,
        email,
        password,
        role,
        location,
        phone,
        farmDetails: role === 'farmer' ? farmDetails : uderfined
    });

    await user.save();

    // Generate a token
    const token = jwt.sign(
        {userId: user._id, role: user.role},
        process.env.JWT_SECRET,
        { expiresIn: '7d'}
    );

    res.status(201).json({
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            location: user.location,
            phone: user.phone,
            farmDetails: user.farmDetails
        }
    });
} catch(error){
    res.status(500).json({ error: error.message});
}
});

// Login route
router.post('/login', async(req, res) => {
    try{
        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email });
        if(!user){
            return res.status(400).json({error: 'Invalid credentials'});
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if(!isMatch) {
            return res.status(400).json({error: 'Invalid credentials'});
        }

        // Updating online status
        user.isOnline = true;
        await user.save();

        // Generate token
        const token = jwt.sign(
            { userId: user._id, role: user.role},
            process.env.JWT_SECRET,
            {expiresIn: '7d'}
        );

        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                role: user.role,
                location: user.location,
                phone: user.phone,
                farmDetails: user.farmDetails,
                avatar: user.avatar
            }
        });
    } catch (error){
        res.status(500).json({ error: error.message });
    }
});

// Get current user
router.get('/me', auth, async(req,res) => {
    try{
        const user = await User.findById(req.user.userId).select('-password');
        res.json(user);
    } catch (error){
        res.status(500).json({ error: error.message });
    }
});

// Logout
router.post('/logout', auth, async (req, res) => {
    try{
        const user = await User.findById(req.user.userId);
        user.isOnline = false;
        user.LastSeen = new Date();
        await user.save();

        res.json({ message: 'Logged out successfully'})
    } catch (error){
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
