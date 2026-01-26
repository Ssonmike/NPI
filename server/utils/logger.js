const LOG_LEVELS = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3
};

const currentLevel = LOG_LEVELS[process.env.LOG_LEVEL?.toUpperCase()] || LOG_LEVELS.INFO;

function log(level, message, ...args) {
    if (LOG_LEVELS[level] >= currentLevel) {
        const timestamp = new Date().toISOString();
        const prefix = `[${timestamp}] [${level}]`;

        if (level === 'ERROR') {
            console.error(prefix, message, ...args);
        } else if (level === 'WARN') {
            console.warn(prefix, message, ...args);
        } else {
            console.log(prefix, message, ...args);
        }
    }
}

module.exports = {
    debug: (message, ...args) => log('DEBUG', message, ...args),
    info: (message, ...args) => log('INFO', message, ...args),
    warn: (message, ...args) => log('WARN', message, ...args),
    error: (message, ...args) => log('ERROR', message, ...args)
};
