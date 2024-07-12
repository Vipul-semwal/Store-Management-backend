const mongoose = require('mongoose');


const SaleSchema = new mongoose.Schema({
    UserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',

    },
    saleNo: {
        type: String,
        required: [true, 'Sale number is required'],
    },
    partyName: {
        type: String,
        required: [true, 'Party name is required']
    },
    saleType: {
        type: String,
        enum: ['Cash', 'Credit'],
        required: [true, 'Sale type is required']
    },
    itemName: {
        type: String,
        required: [true, 'Item name is required']
    },
    currentStock: {
        type: Number,
        required: [true, 'Current stock is required'],
        default: 0
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
    total: {
        type: Number,
        required: [true, 'Total is required']
    },
    discount: {
        type: Number,
        default: 0
    },
    netPayable: {
        type: Number,
        required: [true, 'Net payable is required']
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

// SaleSchema.index({ UserId: 1, BillNum: 1 }, { unique: true })
SaleSchema.index({ UserId: 1, saleNo: 1 }, { unique: true })
const Sale = mongoose.model('Sale', SaleSchema);

module.exports = Sale;
