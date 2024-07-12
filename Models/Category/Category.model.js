const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
    UserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',

    },
    Name: {
        type: String,
        required: ["Category Name is requried", true]

    }
}, {
    timestamps: true
});
CategorySchema.index({ UserId: 1, Name: 1 }, { unique: true });
const Category = mongoose.model('Category', CategorySchema);

module.exports = Category;
