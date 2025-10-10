const mongoose = require('mongoose');
const categoryShema = new mongoose.Schema({
    title: {
        type:String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    isDeleted: {
        type:Boolean,
        default: false
    }
}, {
    timestamps: true
});
module.exports = mongoose.model('Category', categoryShema);