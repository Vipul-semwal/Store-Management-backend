const mongoose = require('mongoose');

const PartiesSchema = new mongoose.Schema({
    UserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',

    },
    PartieCode: {
        type: String,
        unique: true,
        required: [true, 'Party code is missing, please fill that']
    },
    Name: {
        type: String,
        required: [true, 'Party name is required'],
        unique: [true, 'Partie with this name already exist']
    },
    type: {
        type: String,
        required: [true, 'Party type is required'],
        enum: ['Buyer', 'Supplier']
    },
    contactNo: {
        type: Number,
        required: [true, 'Contact number is required']
    },
    Address: {
        type: String
    }
}, {
    timestamps: true
});

PartiesSchema.index({ UserId: 1, Name: 1 }, { unique: true });
PartiesSchema.index({ UserId: 1, PartieCode: 1 }, { unique: true });
const PartieModal = mongoose.model('Partie', PartiesSchema);

module.exports = PartieModal;
