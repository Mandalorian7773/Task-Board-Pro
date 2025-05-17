const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['To Do', 'In Progress', 'Done'],
        default: 'To Do',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true,
        index: true
    },
    inviteCode: {
        type: String,
        required: true,
        unique: true
    },
    teamMembers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users'
        },
    ],
}, {
    timestamps: true
});

// Add index for better query performance
projectSchema.index({ admin: 1 });
projectSchema.index({ teamMembers: 1 });

// Add a pre-save hook to ensure admin is set
projectSchema.pre('save', function(next) {
    if (!this.admin) {
        next(new Error('Project must have an admin'));
    }
    next();
});

module.exports = mongoose.model('Project', projectSchema);
