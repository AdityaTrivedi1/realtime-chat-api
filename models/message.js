const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        unique: true,
        trim: true,
        minLength: 3,
        maxLength: 50
    },
    messages: {
        type: [],
        default: []
    }
})

module.exports = mongoose.model('message', messageSchema)
