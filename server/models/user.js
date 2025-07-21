const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    role: {
        type: String,
        enum: ['farmer', 'officer', 'admin'],
        default: 'farmer',
        required: true
    },
    location: {
        type: String,
        required: true
    },
    avatar: {
        type: String,
        default: ''
    },
    isOnline: {
        type: Boolean,
        default: false
    },
    LastSeen: {
        type: Date,
        default: Date.now
    },
    farmDetails: {
        farmSize: String,
        crops: [String],
        equipment: [String]
    }
} ,{
    timestamps: true
});
       
// Hash the password
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();

    try{
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error){
        next(error);
    }
    
});

// Compare the passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('user', userSchema);