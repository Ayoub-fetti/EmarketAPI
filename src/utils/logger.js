const fs = require('fs');
const path = require('path');
const logsDir = path.join(__dirname, '../../storage/logs');

if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, {recursive: true});
}
const writeLog = (level, message, data = null) => {
    const timestamp = new Date().toLocaleString();
    const logEntry = {
        timestamp,
        level,
        message,
        ...(data && { data})
    };
    const logLine = JSON.stringify(logEntry) + '\n';
    const logFile = path.join(logsDir, `${level}.log`);

    fs.appendFileSync(logFile, logLine);
};
module.exports = {writeLog}