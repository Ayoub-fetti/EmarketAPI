const mongoose = require('mongoose');

const connectDB = async  () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.log('Error with MongoDB connection');
    }
}
module.exports = connectDB;