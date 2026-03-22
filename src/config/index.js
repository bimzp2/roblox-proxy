require('dotenv').config()

module.exports = {
    port: process.env.PORT || 3000,

    cache: {
        stdTTL: 300,
        checkperiod: 60
    },

    rateLimit: {
        windowMs: 60000,
        max: 200
    },

    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type', 'Authorization']
    },

    ai: {
        apiUrl: 'https://api.groq.com/openai/v1/chat/completions',
        apiKey: process.env.GROQ_API_KEY,
        model: 'llama-3.3-70b-versatile',
        defaultTemperature: 0.7,
        defaultMaxTokens: 1024
    },

    roblox: {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
            'Accept': 'application/json',
            'Accept-Language': 'en-US,en;q=0.9'
        },
        timeout: 15000
    }
}
