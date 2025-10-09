const { writeLog } = require('../utils/logger');

const notFound = (req, res) => {
    const notFoundData = {
        url: req.originalUrl,
        method: req.method,
        ip: req.ip
    };

    writeLog('warning', '404 Not Found', notFoundData);

    res.status(404).json({
        message: `Route ${req.originalUrl} not found this page`
    });
};

module.exports = notFound;
