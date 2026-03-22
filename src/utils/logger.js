function log(type, message, data = null) {
    const timestamp = new Date().toISOString()
    const logMsg = `[${timestamp}] [${type.toUpperCase()}] ${message}`
    console.log(data ? `${logMsg} - ${JSON.stringify(data)}` : logMsg)
}

module.exports = { log }
