const express = require('express')
const router = express.Router()
const axios = require('axios')
const config = require('../config')

router.post('/chat/ai', async (req, res) => {
    try {
        const r = await axios.post(
            config.ai.apiUrl,
            {
                model: config.ai.model,
                messages: req.body.messages,
                temperature: req.body.temperature || config.ai.defaultTemperature,
                max_tokens: req.body.max_tokens || config.ai.defaultMaxTokens
            },
            {
                headers: {
                    Authorization: `Bearer ${config.ai.apiKey}`,
                    'Content-Type': 'application/json'
                }
            }
        )
        res.json(r.data)
    } catch (e) {
        res.status(500).json({ error: e.response?.data || e.message })
    }
})

router.get('/chat/ai/:msg', async (req, res) => {
    try {
        const r = await axios.post(
            config.ai.apiUrl,
            {
                model: config.ai.model,
                messages: [{ role: 'user', content: req.params.msg }],
                temperature: config.ai.defaultTemperature,
                max_tokens: config.ai.defaultMaxTokens
            },
            {
                headers: {
                    Authorization: `Bearer ${config.ai.apiKey}`,
                    'Content-Type': 'application/json'
                }
            }
        )
        res.json({ success: true, reply: r.data.choices[0].message.content })
    } catch (e) {
        res.status(500).json({ error: e.response?.data || e.message })
    }
})

module.exports = router
