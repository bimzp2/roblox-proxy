const express = require('express')
const router = express.Router()
const { robloxGet } = require('../services/roblox')

router.get('/inventory/:id/:type', async (req, res) => {
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

module.exports = router
