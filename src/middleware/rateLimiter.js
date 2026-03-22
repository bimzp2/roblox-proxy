const rateLimit = require('express-rate-limit')
const config = require('../config')

const limiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.max,
    message: { error: 'Too many requests, please try again later' }
})

module.exports = limiter
