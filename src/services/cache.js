const NodeCache = require('node-cache')
const config = require('../config')

const cache = new NodeCache(config.cache)

module.exports = cache
