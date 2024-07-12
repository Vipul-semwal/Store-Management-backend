const mongoose = require('mongoose');

const PurchaseSchema = new mongoose.Schema({
    UserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',

    },
    type: {
        type: String,
        enum: ['Cash', 'Credit'],
        required: [true, 'Sale type is required']
    }
    ,
    purchaseNo: {
        type: String,
        required: [true, 'Purchase number is required'],

    },
    partyName: {
        type: String,
        required: [true, 'Party name is required']
    },
    itemName: {
        type: String,
        required: [true, 'Item name is required']
    },
    unit: {
        type: String,
        required: [true, 'Unit is required']
    },
    quantity: {
        type: Number,
        required: [true, 'Quantity is required']
    },
    rate: {
        type: Number,
        required: [true, 'Rate is required']
    },
    // mrp: {
    //     type: Number,
    //     required: [true, 'MRP is required']
    // },
    totalAmount: {
        type: Number,
        required: [true, 'Total amount is required']
    },
    Date: {
        type: String,
        required: ['Date is required', true]
    },
    BillNum: {
        type: String,
        required: [true, "Bill Num is required"]
    }
}, {
    timestamps: true
});

// PurchaseSchema.index({ UserId: 1, BillNum: 1 }, { unique: true })
PurchaseSchema.index({ UserId: 1, purchaseNo: 1 }, { unique: true })


const PurchaseModal = mongoose.model('Purchase', PurchaseSchema);


module.exports = PurchaseModal;
