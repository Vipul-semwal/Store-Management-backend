const mongoose = require('mongoose');


const BillSchema = new mongoose.Schema({
    UserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    PartyData: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Partie',
    },
    partyName: {
        type: String,
        required: [true, "party Name Can't be empty"]
    }
    ,
    billNumber: { type: String, required: [true, "Bill number Already Registerd!"], },
    totalAmount: { type: Number, required: true },
    paidAmount: { type: Number, default: 0 },
    pendingAmount: { type: Number, required: true }

}, { timestamps: true })

BillSchema.index({ UserId: 1, billNumber: 1 }, { unique: true });

const BillModel = mongoose.model('Bill', BillSchema)

module.exports = BillModel