const { writeLog } = require('../utils/logger');

const logger = (req, res, next) => {
    const logData = {
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.get('User-Agent')
    };

    writeLog('info', 'HTTP Request', logData);
    console.log(`${req.method} ${req.url} - ${new Date().toLocaleString()}`);
    next();
};

module.exports = logger;
