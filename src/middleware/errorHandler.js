const { log } = require('../utils/logger')

function errorHandler(err, req, res, next) {
    log('error', err.message, { stack: err.stack })
    res.status(err.status || 500).json({
        error: err.message || 'Internal Server Error'
    })
}

module.exports = errorHandler
