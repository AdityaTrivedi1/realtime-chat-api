const jwt = require('jsonwebtoken')
const User = require('../models/user')
const Message = require('../models/message')
const {StatusCodes} = require('http-status-codes')

const register = async (req, res) => {
    const {name, email, password} = req.body
    if (!name || !email || !password) {
        return res.status(StatusCodes.BAD_REQUEST).send('Please provide name, email and password')
    }
    if (password.length < 8) {
        return res.status(StatusCodes.BAD_REQUEST).send('Password should be atleast 8 characters long')
    }
    if (await User.findOne({email})) {
        return res.status(StatusCodes.BAD_REQUEST).send('Given email already exists')
    }
    if (await User.findOne({name})) {
        return res.status(StatusCodes.BAD_REQUEST).send('Given name is already taken, please choose another one')
    }
    await User.create({name, email, password})
    await Message.create({name})
    const token = jwt.sign({name}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_LIFETIME
    })
    res.status(StatusCodes.CREATED).send({msg: 'User account created', user: {name, email}, token})
}

const login = async (req, res) => {
    const {name, password} = req.body
    if (!name || !password) {
        return res.status(StatusCodes.BAD_REQUEST).send('Please provide name and password')
    }
    const user = await User.findOne({name})
    if (!user) {
        return res.status(StatusCodes.UNAUTHORIZED).send('Invalid credentials')
    }
    const isPasswordCorrect = await user.compare(password)
    if (!isPasswordCorrect) {
        return res.status(StatusCodes.UNAUTHORIZED).send('Invalid credentials')
    }
    const token = jwt.sign({name: user.name}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_LIFETIME
    })
    res.status(StatusCodes.OK).json({msg: 'User logged in', user: {name: user.name}, token})
}

const logout = async (req, res) => {
    res.status(StatusCodes.OK).json({msg: 'User logged out', token: 'logout'})
}

const deleteAccount = async (req, res) => {
    const {email} = req.user
    const user = await User.findOne({email})
    await user.deleteOne()
    res.status(StatusCodes.OK).json({msg: 'User account delete', user: {name: user.name, email: user.email}})
}

module.exports = {
    register,
    login,
    logout,
    deleteAccount
}