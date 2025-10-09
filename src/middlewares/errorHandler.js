const { writeLog } = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
    const errorData = {
        message: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method,
        status: err.status || 500
    };

    writeLog('error', 'Application Error', errorData);
    console.error(err.stack);

    res.status(err.status || 500).json({
        message: err.message || 'Erreur interne du serveur'
    });
};

module.exports = errorHandler;
