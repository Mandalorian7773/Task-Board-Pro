const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firebaseUid: {
        type: String,
        required: [true, 'Firebase UID is required'],
        unique: true,
        index: true
    },
    name: {
        type: String,
        required: [true, 'Name is required']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        index: true
    },
    password: {
        type: String,
        required: [true, 'Password is required']
    },
    phone: {
        type: Number
    },
    type: {
        type: Number,
        default: 0,
        enum: [0, 1]
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Add indexes for better query performance
userSchema.index({ firebaseUid: 1 }, { unique: true });
userSchema.index({ email: 1 }, { unique: true });

// Add a pre-save hook to ensure firebaseUid is set
userSchema.pre('save', function(next) {
    if (!this.firebaseUid) {
        next(new Error('Firebase UID is required'));
    }
    next();
});

const User = mongoose.model('users', userSchema);

module.exports = User;