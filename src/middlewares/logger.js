const { writeLog } = require('../utils/logger');

const logger = (req, res, next) => {
    const logData = {
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.get('User-Agent')
    };

    writeLog('info', 'HTTP Request', logData);
    next();
};

module.exports = logger;
