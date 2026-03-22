const app = require('./app')
const config = require('./config')
const { log } = require('./utils/logger')

app.listen(config.port, () => {
    log('server', `Server started on port ${config.port}`)
})

process.on('unhandledRejection', (err) => {
    log('error', 'Unhandled rejection', { error: err.message, stack: err.stack })
})
