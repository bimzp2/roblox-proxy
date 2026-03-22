const userRoutes = require('./user')
const avatarRoutes = require('./avatar')
const socialRoutes = require('./social')
const inventoryRoutes = require('./inventory')
const gameRoutes = require('./game')
const catalogRoutes = require('./catalog')
const scanRoutes = require('./scan')
const aiRoutes = require('./ai')
const statusRoutes = require('./status')

function setupRoutes(app) {
    app.use('/roblox', userRoutes)
    app.use('/roblox', avatarRoutes)
    app.use('/roblox', socialRoutes)
    app.use('/roblox', inventoryRoutes)
    app.use('/roblox', gameRoutes)
    app.use('/roblox', catalogRoutes)
    app.use('/roblox', scanRoutes)
    app.use('/api', aiRoutes)
    app.use('/', statusRoutes)
}

module.exports = setupRoutes
