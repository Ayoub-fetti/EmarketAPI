require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 3000;

connectDB();

app.get('/', (req, res) => {
    res.json({message: 'EmarketAPI - Server started successfully'});
});

app.listen(PORT, () => {
    console.log(`SERVER START IN THE PORT ${PORT}`);
});
