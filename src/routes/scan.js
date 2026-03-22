const express = require('express')
const router = express.Router()
const { robloxGet } = require('../services/roblox')

router.get('/scan/universe/:universeId', async (req, res) => {
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
            gamepasses: { data: gamepasses.data || [], count: gamepasses.data?.length || 0 },
            devProducts: { data: devProducts.data || [], count: devProducts.data?.length || 0 },
            badges: { data: badges.data || [], count: badges.data?.length || 0 },
            scanTime: new Date().toISOString()
        })
    } catch (e) {
        res.status(500).json({ error: e.response?.data || e.message })
    }
})

router.get('/scan/place/:placeId', async (req, res) => {
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
            gamepasses: { data: gamepasses.data || [], count: gamepasses.data?.length || 0 },
            devProducts: { data: devProducts.data || [], count: devProducts.data?.length || 0 },
            badges: { data: badges.data || [], count: badges.data?.length || 0 },
            activeServers: { data: servers.data || [], count: servers.data?.length || 0 },
            scanTime: new Date().toISOString()
        })
    } catch (e) {
        res.status(500).json({ error: e.response?.data || e.message })
    }
})

module.exports = router
