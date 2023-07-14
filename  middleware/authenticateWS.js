const jwt = require('jsonwebtoken')
const User = require('../models/user')

const authenticateWS = async (socket, next) => {
    try {
        const token = socket.handshake.headers.token
        const {name} = jwt.verify(token, process.env.JWT_SECRET)
        socket.user = {name}
        next()
    } catch (error) {
        next(new Error('User is either not logged in or unauthorized'))
    }
}

module.exports = authenticateWS
