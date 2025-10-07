const mongoose = require('mongoose');
const productShema = new mongoose.Schema({
    title: {
        type:String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    stock: {
        type: Number,
        required: true,
        min: 0,
    },
    category: {
        type: String,
        required: true,
    },
    imageUrl: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});
module.exports = mongoose.model('Product', productShema);
