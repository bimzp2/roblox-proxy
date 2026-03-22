const express = require('express')
const router = express.Router()
const { robloxGet, robloxPost } = require('../services/roblox')

router.get('/user/:id/complete', async (req, res, next) => {
    try {
        const id = Number(req.params.id)
        const [user, presence, followers, following, badges, groups] = await Promise.all([
            robloxGet(`https://users.roblox.com/v1/users/${id}`),
            robloxPost('https://presence.roblox.com/v1/presence/users', { userIds: [id] }),
            robloxGet(`https://friends.roblox.com/v1/users/${id}/followers/count`),
            robloxGet(`https://friends.roblox.com/v1/users/${id}/followings/count`),
            robloxGet(`https://badges.roblox.com/v1/users/${id}/badges?limit=10&sortOrder=Desc`),
            robloxGet(`https://groups.roblox.com/v2/users/${id}/groups/roles`)
        ])
        res.json({
            user,
            presence: presence.userPresences?.[0] ?? null,
            followers,
            following,
            badges: badges.data || [],
            groups: groups.data || []
        })
    } catch (e) {
        res.status(500).json({ error: e.response?.data || e.message })
    }
})

router.get('/user/:id', async (req, res, next) => {
    try {
        const id = Number(req.params.id)
        const user = await robloxGet(`https://users.roblox.com/v1/users/${id}`)
        res.json(user)
    } catch (e) {
        res.status(500).json({ error: e.response?.data || e.message })
    }
})

router.get('/username/:username', async (req, res, next) => {
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

module.exports = router
