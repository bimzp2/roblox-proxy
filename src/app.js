const express = require('express')
const cors = require('cors')
const compression = require('compression')
const path = require('path')
const fs = require('fs')
const config = require('./config')
const requestLogger = require('./middleware/logger')
const errorHandler = require('./middleware/errorHandler')
const rateLimiter = require('./middleware/rateLimiter')
const setupRoutes = require('./routes')

const app = express()

app.use(compression())
app.use(cors(config.cors))
app.use(requestLogger)
app.use(express.json())
app.use(rateLimiter)

const publicDir = path.join(__dirname, '..', 'public')
app.use(express.static(publicDir))

setupRoutes(app)

const indexPath = path.join(publicDir, 'index.html')
app.use((req, res, next) => {
    if (req.method === 'GET' && req.accepts('html') && !req.path.startsWith('/roblox') && !req.path.startsWith('/api') && !req.path.startsWith('/status') && !req.path.startsWith('/cache')) {
        if (fs.existsSync(indexPath)) {
            return res.sendFile(indexPath)
        }
    }
    next()
})

app.use(errorHandler)

module.exports = app
