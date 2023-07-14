const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        unique: true,
        trim: true,
        minLength: 3,
        maxLength: 50
    },
    email: {
        type: String,
        unique: true,
        required: true,
        validate: {
            validator: validator.isEmail,
            message: 'Please provide a valid email'
        }
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minLength: 8,
        maxLength: 100
    }
}, {timestamps: true})

userSchema.pre('save', async function() {
    const salt = await bcrypt.genSalt(10)
    const password = await bcrypt.hash(this.password, salt)
    this.password = password
})

userSchema.methods.compare = async function(password) {
    const isPasswordCorrect = await bcrypt.compare(password, this.password)
    return isPasswordCorrect
}

module.exports = mongoose.model('user', userSchema)
