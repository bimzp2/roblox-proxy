const express = require('express')
const router = express.Router()
const { robloxGet, robloxPost } = require('../services/roblox')

router.get('/friends/:id', async (req, res) => {
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
        res.status(500).json({ error: e.response?.data || e.message })
    }
})

router.get('/groups/:id', async (req, res) => {
    try {
        const data = await robloxGet(`https://groups.roblox.com/v2/users/${req.params.id}/groups/roles`)
        res.json(data)
    } catch (e) {
        res.status(500).json({ error: e.response?.data || e.message })
    }
})

router.get('/badges/:id', async (req, res) => {
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

router.get('/user/:userId/badges/awarded-dates', async (req, res) => {
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

module.exports = router
