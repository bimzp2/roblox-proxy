require('dotenv').config()

const express = require('express')
const axios = require('axios')
const rateLimit = require('express-rate-limit')
const NodeCache = require('node-cache')

const app = express()
const cache = new NodeCache({ stdTTL: 300, checkperiod: 60 })

function log(type, message, data = null) {
    const timestamp = new Date().toISOString()
    const logMsg = `[${timestamp}] [${type.toUpperCase()}] ${message}`
    console.log(data ? `${logMsg} - ${JSON.stringify(data)}` : logMsg)
}

app.use((req, res, next) => {
    log('request', `${req.method} ${req.path}`, { ip: req.ip, query: req.query })
    next()
})

app.use(express.json())
app.use(rateLimit({ windowMs: 60000, max: 200 }))

const AI_API = 'https://api.groq.com/openai/v1/chat/completions'

const ROBLOX_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    'Accept': 'application/json',
    'Accept-Language': 'en-US,en;q=0.9'
}

async function robloxGet(url, params = {}) {
    const cacheKey = `GET:${url}:${JSON.stringify(params)}`
    const cached = cache.get(cacheKey)
    if (cached) {
        log('cache', 'Cache hit', { url })
        return cached
    }

    log('api', 'Fetching from Roblox API', { url, params })
    const r = await axios.get(url, {
        params,
        headers: ROBLOX_HEADERS,
        timeout: 15000
    })
    cache.set(cacheKey, r.data)
    log('api', 'Response cached', { url })
    return r.data
}

async function robloxPost(url, body) {
    const r = await axios.post(url, body, {
        headers: { ...ROBLOX_HEADERS, 'Content-Type': 'application/json' },
        timeout: 15000
    })
    return r.data
}

app.get('/roblox/user/:id/complete', async (req, res) => {
    try {
        const id = Number(req.params.id)
        log('endpoint', 'Fetching complete user data', { userId: id })
        const [user, presence, followers, following, badges, groups] = await Promise.all([
            robloxGet(`https://users.roblox.com/v1/users/${id}`),
            robloxPost('https://presence.roblox.com/v1/presence/users', { userIds: [id] }),
            robloxGet(`https://friends.roblox.com/v1/users/${id}/followers/count`),
            robloxGet(`https://friends.roblox.com/v1/users/${id}/followings/count`),
            robloxGet(`https://badges.roblox.com/v1/users/${id}/badges?limit=10&sortOrder=Desc`),
            robloxGet(`https://groups.roblox.com/v2/users/${id}/groups/roles`)
        ])
        log('success', 'Complete user data fetched', { userId: id })
        res.json({
            user,
            presence: presence.userPresences?.[0] ?? null,
            followers,
            following,
            badges: badges.data || [],
            groups: groups.data || []
        })
    } catch (e) {
        log('error', 'Failed to fetch complete user data', { error: e.message })
        res.status(500).json({ error: e.response?.data || e.message })
    }
})

app.get('/roblox/user/:id', async (req, res) => {
    try {
        const id = Number(req.params.id)
        const user = await robloxGet(`https://users.roblox.com/v1/users/${id}`)
        res.json(user)
    } catch (e) {
        res.status(500).json({ error: e.response?.data || e.message })
    }
})

app.get('/roblox/username/:username', async (req, res) => {
    try {
        const r = await robloxPost('https://users.roblox.com/v1/usernames/users', {
            usernames: [req.params.username],
            excludeBannedUsers: false
        })
        const user = r.data?.[0]
        if (!user) return res.status(404).json({ error: 'user_not_found' })
        res.json(user)
    } catch (e) {
        res.status(500).json({ error: e.response?.data || e.message })
    }
})

app.get('/roblox/avatar/:id', async (req, res) => {
    try {
        const data = await robloxGet('https://thumbnails.roblox.com/v1/users/avatar', {
            userIds: req.params.id,
            size: req.query.size || '720x720',
            format: 'Png',
            isCircular: req.query.circular === 'true'
        })
        res.json(data)
    } catch (e) {
        res.status(500).json({ error: e.response?.data || e.message })
    }
})

app.get('/roblox/avatar-headshot/:id', async (req, res) => {
    try {
        const data = await robloxGet('https://thumbnails.roblox.com/v1/users/avatar-headshot', {
            userIds: req.params.id,
            size: req.query.size || '420x420',
            format: 'Png',
            isCircular: req.query.circular === 'true'
        })
        res.json(data)
    } catch (e) {
        res.status(500).json({ error: e.response?.data || e.message })
    }
})

app.get('/roblox/badges/:id', async (req, res) => {
    try {
        const data = await robloxGet(`https://badges.roblox.com/v1/users/${req.params.id}/badges`, {
            limit: req.query.limit || 100,
            sortOrder: req.query.sortOrder || 'Desc',
            cursor: req.query.cursor
        })
        res.json(data)
    } catch (e) {
        res.status(500).json({ error: e.response?.data || e.message })
    }
})

app.get('/roblox/friends/:id', async (req, res) => {
    try {
        const data = await robloxGet(`https://friends.roblox.com/v1/users/${req.params.id}/friends`)
        
        if (data.data && data.data.length > 0) {
            const userIds = data.data.map(f => f.id)
            const userDetails = await robloxPost('https://users.roblox.com/v1/users', {
                userIds: userIds,
                excludeBannedUsers: false
            })
            
            const userMap = new Map(userDetails.data.map(u => [u.id, u]))
            
            data.data = data.data.map(friend => {
                const details = userMap.get(friend.id)
                return {
                    id: friend.id,
                    name: details?.name || friend.name,
                    displayName: details?.displayName || friend.displayName,
                    hasVerifiedBadge: details?.hasVerifiedBadge || false,
                    created: friend.created
                }
            })
        }
        
        res.json(data)
    } catch (e) {
        log('error', 'Failed to fetch friends', { error: e.message })
        res.status(500).json({ error: e.response?.data || e.message })
    }
})

app.get('/roblox/groups/:id', async (req, res) => {
    try {
        const data = await robloxGet(`https://groups.roblox.com/v2/users/${req.params.id}/groups/roles`)
        res.json(data)
    } catch (e) {
        res.status(500).json({ error: e.response?.data || e.message })
    }
})

app.get('/roblox/inventory/:id/:type', async (req, res) => {
    try {
        const data = await robloxGet(
            `https://inventory.roblox.com/v2/users/${req.params.id}/inventory/${req.params.type}`,
            {
                limit: req.query.limit || 100,
                sortOrder: req.query.sortOrder || 'Desc',
                cursor: req.query.cursor
            }
        )
        res.json(data)
    } catch (e) {
        res.status(500).json({ error: e.response?.data || e.message })
    }
})

app.get('/roblox/game/:placeId', async (req, res) => {
    try {
        const universeReq = await robloxGet(`https://apis.roblox.com/universes/v1/places/${req.params.placeId}/universe`)
        const universeId = universeReq.universeId
        
        const [gameData, votes, favorites, badges] = await Promise.all([
            robloxGet(`https://games.roblox.com/v1/games`, { universeIds: universeId }),
            robloxGet(`https://games.roblox.com/v1/games/${universeId}/votes`),
            robloxGet(`https://games.roblox.com/v1/games/${universeId}/favorites/count`),
            robloxGet(`https://badges.roblox.com/v1/universes/${universeId}/badges`, { limit: 100, sortOrder: 'Desc' })
        ])
        
        res.json({
            game: gameData.data?.[0] || null,
            votes,
            favorites,
            badges: badges.data || [],
            universeId,
            placeId: req.params.placeId
        })
    } catch (e) {
        res.status(500).json({ error: e.response?.data || e.message })
    }
})

app.get('/roblox/game/:placeId/servers', async (req, res) => {
    try {
        const data = await robloxGet(
            `https://games.roblox.com/v1/games/${req.params.placeId}/servers/Public`,
            {
                limit: req.query.limit || 100,
                sortOrder: req.query.sortOrder || 'Desc',
                cursor: req.query.cursor
            }
        )
        res.json(data)
    } catch (e) {
        res.status(500).json({ error: e.response?.data || e.message })
    }
})

app.get('/roblox/universe/:universeId/gamepasses', async (req, res) => {
    try {
        const data = await robloxGet(`https://games.roblox.com/v1/games/${req.params.universeId}/game-passes`, {
            limit: req.query.limit || 100,
            sortOrder: req.query.sortOrder || 'Asc',
            cursor: req.query.cursor
        })
        res.json(data)
    } catch (e) {
        res.status(500).json({ error: e.response?.data || e.message })
    }
})

app.get('/roblox/user/:userId/gamepass/:gamePassId/ownership', async (req, res) => {
    try {
        const data = await robloxGet(
            `https://inventory.roblox.com/v1/users/${req.params.userId}/items/GamePass/${req.params.gamePassId}`
        )
        res.json({
            userId: req.params.userId,
            gamePassId: req.params.gamePassId,
            owns: data.data && data.data.length > 0
        })
    } catch (e) {
        res.status(500).json({ error: e.response?.data || e.message })
    }
})

app.get('/roblox/user/:userId/universe/:universeId/gamepasses-owned', async (req, res) => {
    try {
        const gamepasses = await robloxGet(`https://games.roblox.com/v1/games/${req.params.universeId}/game-passes`, {
            limit: 100,
            sortOrder: 'Asc'
        })
        
        const ownership = await Promise.all(
            (gamepasses.data || []).map(async (pass) => {
                try {
                    const inv = await robloxGet(
                        `https://inventory.roblox.com/v1/users/${req.params.userId}/items/GamePass/${pass.id}`
                    )
                    return {
                        ...pass,
                        owned: inv.data && inv.data.length > 0
                    }
                } catch {
                    return {
                        ...pass,
                        owned: false
                    }
                }
            })
        )
        
        res.json({
            userId: req.params.userId,
            universeId: req.params.universeId,
            gamepasses: ownership,
            ownedCount: ownership.filter(p => p.owned).length,
            totalCount: ownership.length
        })
    } catch (e) {
        res.status(500).json({ error: e.response?.data || e.message })
    }
})

app.get('/roblox/universe/:universeId/dev-products', async (req, res) => {
    try {
        const data = await robloxGet(`https://games.roblox.com/v1/games/${req.params.universeId}/developer-products`, {
            limit: req.query.limit || 100,
            sortOrder: req.query.sortOrder || 'Asc',
            cursor: req.query.cursor
        })
        res.json(data)
    } catch (e) {
        res.status(500).json({ error: e.response?.data || e.message })
    }
})

app.get('/roblox/universe/:universeId/badges', async (req, res) => {
    try {
        const data = await robloxGet(`https://badges.roblox.com/v1/universes/${req.params.universeId}/badges`, {
            limit: req.query.limit || 100,
            sortOrder: req.query.sortOrder || 'Desc',
            cursor: req.query.cursor
        })
        res.json(data)
    } catch (e) {
        res.status(500).json({ error: e.response?.data || e.message })
    }
})

app.get('/roblox/user/:userId/badges/awarded-dates', async (req, res) => {
    try {
        const badgeIds = req.query.badgeIds?.split(',').map(Number) || []
        if (badgeIds.length === 0) {
            return res.status(400).json({ error: 'badgeIds query parameter required' })
        }
        
        const data = await robloxGet(`https://badges.roblox.com/v1/users/${req.params.userId}/badges/awarded-dates`, {
            badgeIds: badgeIds.join(',')
        })
        res.json(data)
    } catch (e) {
        res.status(500).json({ error: e.response?.data || e.message })
    }
})

app.get('/roblox/catalog/search', async (req, res) => {
    try {
        const data = await robloxGet('https://catalog.roblox.com/v1/search/items', {
            keyword: req.query.keyword,
            category: req.query.category,
            limit: req.query.limit || 60,
            cursor: req.query.cursor
        })
        res.json(data)
    } catch (e) {
        res.status(500).json({ error: e.response?.data || e.message })
    }
})

app.get('/roblox/catalog/item/:itemId', async (req, res) => {
    try {
        const data = await robloxGet(`https://catalog.roblox.com/v1/catalog/items/${req.params.itemId}/details`)
        res.json(data)
    } catch (e) {
        res.status(500).json({ error: e.response?.data || e.message })
    }
})

app.get('/roblox/scan/universe/:universeId', async (req, res) => {
    try {
        const universeId = req.params.universeId
        
        const [gameData, votes, favorites, gamepasses, devProducts, badges] = await Promise.all([
            robloxGet(`https://games.roblox.com/v1/games`, { universeIds: universeId }),
            robloxGet(`https://games.roblox.com/v1/games/${universeId}/votes`),
            robloxGet(`https://games.roblox.com/v1/games/${universeId}/favorites/count`),
            robloxGet(`https://games.roblox.com/v1/games/${universeId}/game-passes`, { limit: 100 }),
            robloxGet(`https://games.roblox.com/v1/games/${universeId}/developer-products`, { limit: 100 }),
            robloxGet(`https://badges.roblox.com/v1/universes/${universeId}/badges`, { limit: 100 })
        ])
        
        res.json({
            game: gameData.data?.[0] || null,
            votes,
            favorites,
            gamepasses: {
                data: gamepasses.data || [],
                count: gamepasses.data?.length || 0
            },
            devProducts: {
                data: devProducts.data || [],
                count: devProducts.data?.length || 0
            },
            badges: {
                data: badges.data || [],
                count: badges.data?.length || 0
            },
            scanTime: new Date().toISOString()
        })
    } catch (e) {
        res.status(500).json({ error: e.response?.data || e.message })
    }
})

app.get('/roblox/scan/place/:placeId', async (req, res) => {
    try {
        const universeReq = await robloxGet(`https://apis.roblox.com/universes/v1/places/${req.params.placeId}/universe`)
        const universeId = universeReq.universeId
        
        const [gameData, votes, favorites, gamepasses, devProducts, badges, servers] = await Promise.all([
            robloxGet(`https://games.roblox.com/v1/games`, { universeIds: universeId }),
            robloxGet(`https://games.roblox.com/v1/games/${universeId}/votes`),
            robloxGet(`https://games.roblox.com/v1/games/${universeId}/favorites/count`),
            robloxGet(`https://games.roblox.com/v1/games/${universeId}/game-passes`, { limit: 100 }),
            robloxGet(`https://games.roblox.com/v1/games/${universeId}/developer-products`, { limit: 100 }),
            robloxGet(`https://badges.roblox.com/v1/universes/${universeId}/badges`, { limit: 100 }),
            robloxGet(`https://games.roblox.com/v1/games/${req.params.placeId}/servers/Public`, { limit: 10 })
        ])
        
        res.json({
            placeId: req.params.placeId,
            universeId,
            game: gameData.data?.[0] || null,
            votes,
            favorites,
            gamepasses: {
                data: gamepasses.data || [],
                count: gamepasses.data?.length || 0
            },
            devProducts: {
                data: devProducts.data || [],
                count: devProducts.data?.length || 0
            },
            badges: {
                data: badges.data || [],
                count: badges.data?.length || 0
            },
            activeServers: {
                data: servers.data || [],
                count: servers.data?.length || 0
            },
            scanTime: new Date().toISOString()
        })
    } catch (e) {
        res.status(500).json({ error: e.response?.data || e.message })
    }
})

app.post('/api/chat/ai', async (req, res) => {
    try {
        const r = await axios.post(
            AI_API,
            {
                model: 'llama-3.3-70b-versatile',
                messages: req.body.messages,
                temperature: req.body.temperature || 0.7,
                max_tokens: req.body.max_tokens || 1024
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        )
        res.json(r.data)
    } catch (e) {
        res.status(500).json({ error: e.response?.data || e.message })
    }
})

app.get('/api/chat/ai/:msg', async (req, res) => {
    try {
        const r = await axios.post(
            AI_API,
            {
                model: 'llama-3.3-70b-versatile',
                messages: [{ role: 'user', content: req.params.msg }],
                temperature: 0.7,
                max_tokens: 1024
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        )
        res.json({ success: true, reply: r.data.choices[0].message.content })
    } catch (e) {
        res.status(500).json({ error: e.response?.data || e.message })
    }
})

app.get('/status', (req, res) => {
    res.json({
        status: 'ok',
        uptime: process.uptime(),
        cache: {
            keys: cache.keys().length,
            stats: cache.getStats()
        },
        timestamp: new Date().toISOString()
    })
})

app.get('/cache/clear', (req, res) => {
    log('cache', 'Clearing all cache')
    cache.flushAll()
    log('cache', 'Cache cleared successfully')
    res.json({ success: true, message: 'Cache cleared' })
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    log('server', `Server started on port ${PORT}`)
})

process.on('unhandledRejection', (err) => {
    log('error', 'Unhandled rejection', { error: err.message, stack: err.stack })
})