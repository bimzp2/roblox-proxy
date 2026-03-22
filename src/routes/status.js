const express = require('express')
const router = express.Router()
const cache = require('../services/cache')
const { log } = require('../utils/logger')

router.get('/status', (req, res) => {
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

router.get('/cache/clear', (req, res) => {
    log('cache', 'Clearing all cache')
    cache.flushAll()
    log('cache', 'Cache cleared successfully')
    res.json({ success: true, message: 'Cache cleared' })
})

router.get('/api/endpoints', (req, res) => {
    res.json({
        categories: [
            {
                name: 'User',
                endpoints: [
                    { method: 'GET', path: '/roblox/user/:id', description: 'Get user by ID', defaults: { id: '8422452244' } },
                    { method: 'GET', path: '/roblox/user/:id/complete', description: 'Get complete user data with presence, followers, badges, and groups', defaults: { id: '8422452244' } },
                    { method: 'GET', path: '/roblox/username/:username', description: 'Get user by username', defaults: { username: 'Roblox' } }
                ]
            },
            {
                name: 'Avatar',
                endpoints: [
                    { method: 'GET', path: '/roblox/avatar/:id', description: 'Get full avatar thumbnail', params: ['size=720x720', 'circular=true/false'], defaults: { id: '8422452244' } },
                    { method: 'GET', path: '/roblox/avatar-headshot/:id', description: 'Get headshot thumbnail', params: ['size=420x420', 'circular=true/false'], defaults: { id: '8422452244' } }
                ]
            },
            {
                name: 'Social',
                endpoints: [
                    { method: 'GET', path: '/roblox/friends/:id', description: 'Get user friends list', defaults: { id: '8422452244' } },
                    { method: 'GET', path: '/roblox/groups/:id', description: 'Get user groups and roles', defaults: { id: '8422452244' } },
                    { method: 'GET', path: '/roblox/badges/:id', description: 'Get user badges', params: ['limit=100', 'sortOrder=Desc', 'cursor'], defaults: { id: '8422452244' } },
                    { method: 'GET', path: '/roblox/user/:userId/badges/awarded-dates', description: 'Get badge awarded dates', params: ['badgeIds=2124533401'], defaults: { userId: '8422452244' }, defaultQuery: 'badgeIds=2124533401' }
                ]
            },
            {
                name: 'Inventory',
                endpoints: [
                    { method: 'GET', path: '/roblox/inventory/:id/:type', description: 'Get user inventory by asset type ID (8=Hat, 11=Shirt, 12=Pants, 19=Gear, 41=HairAccessory, 42=FaceAccessory)', params: ['limit=100', 'sortOrder=Desc', 'cursor'], defaults: { id: '8422452244', type: '8' } }
                ]
            },
            {
                name: 'Game',
                endpoints: [
                    { method: 'GET', path: '/roblox/game/:placeId', description: 'Get game info with votes, favorites, and badges', defaults: { placeId: '4252370517' } },
                    { method: 'GET', path: '/roblox/game/:placeId/servers', description: 'Get game servers', params: ['limit=100', 'sortOrder=Desc', 'cursor'], defaults: { placeId: '4252370517' } },
                    { method: 'GET', path: '/roblox/universe/:universeId/gamepasses', description: 'Get game passes', defaults: { universeId: '1537690962' } },
                    { method: 'GET', path: '/roblox/universe/:universeId/dev-products', description: 'Get developer products', defaults: { universeId: '1537690962' } },
                    { method: 'GET', path: '/roblox/universe/:universeId/badges', description: 'Get universe badges', defaults: { universeId: '1537690962' } },
                    { method: 'GET', path: '/roblox/user/:userId/gamepass/:gamePassId/ownership', description: 'Check gamepass ownership', defaults: { userId: '8422452244', gamePassId: '9063647' } },
                    { method: 'GET', path: '/roblox/user/:userId/universe/:universeId/gamepasses-owned', description: 'Get owned game passes for a universe', defaults: { userId: '8422452244', universeId: '1537690962' } }
                ]
            },
            {
                name: 'Catalog',
                endpoints: [
                    { method: 'GET', path: '/roblox/catalog/search', description: 'Search catalog items', params: ['keyword', 'category', 'limit=60', 'cursor'], defaultQuery: 'keyword=dominus&limit=10' },
                    { method: 'GET', path: '/roblox/catalog/item/:itemId', description: 'Get catalog item details by asset ID', defaults: { itemId: '1028606' } }
                ]
            },
            {
                name: 'Scan',
                endpoints: [
                    { method: 'GET', path: '/roblox/scan/universe/:universeId', description: 'Full universe scan with all data', defaults: { universeId: '1537690962' } },
                    { method: 'GET', path: '/roblox/scan/place/:placeId', description: 'Full place scan with servers', defaults: { placeId: '4252370517' } }
                ]
            },
            {
                name: 'AI Chat',
                endpoints: [
                    { method: 'POST', path: '/api/chat/ai', description: 'Full AI chat with message history', body: { messages: [{ role: 'user', content: 'Hello!' }], temperature: 0.7, max_tokens: 1024 } },
                    { method: 'GET', path: '/api/chat/ai/:msg', description: 'Quick AI message', defaults: { msg: 'Hello' } }
                ]
            },
            {
                name: 'Status',
                endpoints: [
                    { method: 'GET', path: '/status', description: 'Health check with cache stats' },
                    { method: 'GET', path: '/cache/clear', description: 'Clear all cache' }
                ]
            }
        ]
    })
})

module.exports = router
