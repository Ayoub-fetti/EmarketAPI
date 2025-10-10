const express = require('express');
const UserRoutes = require('./routes/userRoutes');
const ProductRoutes = require('./routes/productRoutes');
const CategoryRoutes = require('./routes/categoryRoutes')
const logger = require('./middlewares/logger');
const errorHandler = require('./middlewares/errorHandler');
const notFound = require('./middlewares/notFound');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');


const app = express();
// swagger config
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Emarket API',
            version: '1.0.0',
            description: 'API documentation for Emarket project',
        },
        servers: [
            {
                url: 'http://localhost:3000',
            },
        ],
    },

    apis: ['./src/routes/*.js'],
};
const specs = swaggerJsdoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {explorer: true}));


app.use(logger);
app.use(express.json());
app.use('/api/users', UserRoutes);
app.use('/api/products', ProductRoutes);
app.use('/api/categories', CategoryRoutes);
app.use(notFound);
app.use(errorHandler);
module.exports = app;