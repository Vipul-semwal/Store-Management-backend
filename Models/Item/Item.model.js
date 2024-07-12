const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
    UserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',

    },
    code: {
        type: String,
        uniqueErrorMessage: 'item code should be unique',
        required: [true, 'Item code is required']
    }
    ,
    itemName: {
        type: String,
        uniqueErrorMessage: 'item with this name already exist',
        required: [true, 'Item name is required']
    },
    unit: {
        type: String,
        required: [true, 'Unit is required']
    },
    category: {
        type: String,
        required: [true, 'Category is required']
    },
    quantity: {
        type: Number,
        default: 0
    },
    Mrp: {
        type: Number,
        required: ["Mrp is requried", true]
    }
    // costPrice: {
    //     type: Number,
    //     // required: [true, 'Cost price is required']
    // },
    // sellingPrice: {
    //     type: Number,
    //     // required: [true, 'Selling price is required']
    // }

}, {
    timestamps: true
});
ItemSchema.index({ UserId: 1, itemName: 1 }, { unique: true });
ItemSchema.index({ UserId: 1, code: 1 }, { unique: true });
const ItemMaster = mongoose.model('ItemMaster', ItemSchema);

module.exports = ItemMaster;
