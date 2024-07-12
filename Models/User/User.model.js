const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Define the User Schema
const UserSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, "name cannot be empty"],
    },
    email: {
        type: String,
        required: [true, "email cannot be empty"],
        unique: true,
    },
    password: {
        type: String,
        required: [true, "Password cannot be empty"],
        minlength: [8, 'Password should be at least 8 characters long'],
    },
    profilePicture: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    provider: {
        type: String,
        required: true,
        enum: ['local', 'google', 'another_oauth_provider']
    },
    check: Boolean,
    refershToken: String,
    parties: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Partie' }],
    items: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ItemMaster' }],
    CashBook: {
        type: Boolean,
        default: false
    },
    AmmountInStore: {
        type: Number,
        default: 0
    },
    Category: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category"
    }],
    Unit: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Unit"
        }
    ],
    extraData: {
        LastSaleDate: {
            type: String,
        },
        LastPurchaseDate: {
            type: String
        },
        LastCashBookDate: {
            type: String
        }
    }
});

UserSchema.pre('save', async function (next) {
    const user = this;
    if (user.isModified('password') || user.isNew) {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        user.password = hashedPassword;
    }
    next();
});

const UserModel = mongoose.model('User', UserSchema);

module.exports = UserModel;
