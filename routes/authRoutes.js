const {register, login, logout, deleteAccount} = require('../controllers/authController')
const authenticate = require('../ middleware/authenticate')

const express = require('express')
const router = express.Router()

router.post('/register', register)
router.post('/login', login)
// router.get('/logout', logout)
// router.delete('/delete-account', authenticate, deleteAccount)

module.exports = router
