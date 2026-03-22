const axios = require('axios')
const config = require('../config')
const cache = require('./cache')
const { log } = require('../utils/logger')

async function robloxGet(url, params = {}) {
    const cacheKey = `GET:${url}:${JSON.stringify(params)}`
    const cached = cache.get(cacheKey)

    if (cached) {
        log('cache', 'Cache hit', { url })
        return cached
    }

    log('api', 'Fetching from Roblox API', { url, params })
    const response = await axios.get(url, {
        params,
        headers: config.roblox.headers,
        timeout: config.roblox.timeout
    })

    cache.set(cacheKey, response.data)
    log('api', 'Response cached', { url })
    return response.data
}

async function robloxPost(url, body) {
    const response = await axios.post(url, body, {
        headers: { ...config.roblox.headers, 'Content-Type': 'application/json' },
        timeout: config.roblox.timeout
    })
    return response.data
}

module.exports = { robloxGet, robloxPost }
