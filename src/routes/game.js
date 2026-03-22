const express = require('express')
const router = express.Router()
const { robloxGet } = require('../services/roblox')

router.get('/game/:placeId', async (req, res) => {
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

router.get('/game/:placeId/servers', async (req, res) => {
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

router.get('/universe/:universeId/gamepasses', async (req, res) => {
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

router.get('/universe/:universeId/dev-products', async (req, res) => {
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

router.get('/universe/:universeId/badges', async (req, res) => {
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

router.get('/user/:userId/gamepass/:gamePassId/ownership', async (req, res) => {
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

router.get('/user/:userId/universe/:universeId/gamepasses-owned', async (req, res) => {
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
                    return { ...pass, owned: inv.data && inv.data.length > 0 }
                } catch {
                    return { ...pass, owned: false }
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

module.exports = router
