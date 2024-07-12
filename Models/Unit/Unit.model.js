const mongoose = require('mongoose');

const UnitSchema = new mongoose.Schema({
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
UnitSchema.index({ UserId: 1, Name: 1 }, { unique: true });
const Unit = mongoose.model('Unit', UnitSchema);

module.exports = Unit;
