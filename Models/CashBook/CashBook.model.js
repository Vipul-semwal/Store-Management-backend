const mongoose = require('mongoose');


const CashBookSchmea = new mongoose.Schema({
    UserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',

    },
    Date: {
        type: String,
        required: [true, "entry date is required"]
    }
    ,
    code: {
        type: String,
        uniqueErrorMessage: 'item code should be unique',
        required: [true, 'Cashbook code is required']
    },
    ReceiptType: {
        type: String,
        enum: ['receive', 'paid'],
        required: [true, 'Sale type is required']
    },
    category: {
        type: String,
        enum: ["Sale", "Suplier", "Expense", "Salary", "Co-Owner", "Saving"],
        required: [true, 'Category is required']
    },
    RefBillNo: {
        type: String
    }
    ,
    Ammount: {
        type: Number,
        required: ['Ammout is required', true],
    },
    Discription: {
        type: String,
        required: ['write a short discription', true]
    },


}, { timestamps: true })

CashBookSchmea.index({ UserId: 1, code: 1 }, { unique: true });

const CashBookModel = mongoose.model('CashBook', CashBookSchmea)

module.exports = CashBookModel