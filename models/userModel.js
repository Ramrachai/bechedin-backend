const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        phone: {
            type: String,
            required: true,
            trim: true,
            unique: true,
        },
        email: {
            type: String,
            unique: true,
            lowercase: true,
        },
        password: {
            type: String,
            required: true,
            min: 4,
        },

        role: {
            type: String,
            enum: ['user', 'admin', 'moderator'],
            default: 'user',
        },

        isVerified: {
            type: Boolean,
            default: false,
        },
        status: {
            type: String,
            enum: ['pending', 'active', 'rejec', 'disabled'],
            default: 'active',
        },
        resetToken: {
            type: Number,
        },
        resetTokenExpiry: {
            type: Date,
        },
        avatar: {
            type: String,
            default:
                'https://res.cloudinary.com/ramrachai/image/upload/v1712248012/bikearot/user/Screenshot_2024-04-05_222441_uzs9hd.png',
        },
    },
    {
        timestamps: true,
    }
);

// === Important: currently disabled for development purpose.=== 
// ====Important:  Don't forget to enabled for production==== 

// userSchema.pre('save', async function (next) {
//   try {
//     if (!this.isModified('password')) {
//       return next();
//     }
//     const hashedPassword = await bcrypt.hash(this.password, 10);
//     this.password = hashedPassword;
//     return next();
//   } catch (error) {
//     return next(error);
//   }
// });

const User = mongoose.model('User', userSchema);

module.exports = User;
