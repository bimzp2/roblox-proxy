const { log } = require('../utils/logger')

function requestLogger(req, res, next) {
    log('request', `${req.method} ${req.path}`, { ip: req.ip, query: req.query })
    next()
}

module.exports = requestLogger
