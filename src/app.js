const express = require('express');
const UserRoutes = require('./routes/userRoutes');
const ProductRoutes = require('./routes/productRoutes');
const CategoryRoutes = require('./routes/categoryRoutes')
const logger = require('./middlewares/logger');
const errorHandler = require('./middlewares/errorHandler');
const notFound = require('./middlewares/notFound');


const app = express();
app.use(logger);
app.use(express.json());
app.use('/api/users', UserRoutes);
app.use('/api/products', ProductRoutes);
app.use('/api/categories', CategoryRoutes);
app.use(notFound);
app.use(errorHandler);
module.exports = app;