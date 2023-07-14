const jwt = require('jsonwebtoken')
const User = require('../models/user')
const {StatusCodes} = require('http-status-codes')

const authenticate = async (req, res, next) => {
    try {
        const {token} = req.body
        const {name} = jwt.verify(token, process.env.JWT_SECRET)
        if (!await User.findOne({name})) {
            return res.status(StatusCodes.BAD_REQUEST).send('User account does not exist')
        }
        req.user = {name}
        next()
    } catch (error) {
        res.status(StatusCodes.UNAUTHORIZED).send('User either not logged in or unauthorized')
    }
}

module.exports = authenticate
