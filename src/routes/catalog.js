const express = require('express')
const router = express.Router()
const { robloxGet } = require('../services/roblox')

router.get('/catalog/search', async (req, res) => {
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

router.get('/catalog/item/:itemId', async (req, res) => {
    try {
        const data = await robloxGet(`https://economy.roblox.com/v2/assets/${req.params.itemId}/details`)
        res.json(data)
    } catch (e) {
        res.status(500).json({ error: e.response?.data || e.message })
    }
})

module.exports = router
