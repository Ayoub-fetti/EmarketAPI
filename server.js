require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');


const app = express();
const PORT = process.env.PORT || 3000;

connectDB();

app.use(express.json());
app.get('/', (req, res) => {
    res.json({message: 'EmarketAPI - Server started successfully'});
});
app.listen(PORT, ()=> {
    console.log(`SERVER START IN THE PORT ${PORT}`);
});