const express = require('express')
const router = express.Router()
const { robloxGet } = require('../services/roblox')

router.get('/avatar/:id', async (req, res) => {
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

router.get('/avatar-headshot/:id', async (req, res) => {
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

module.exports = router
