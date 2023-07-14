const User = require('../models/user')
const Message = require('../models/message')

const getUserChat = async (io, socket, {of}) => {
    const name = socket.user.name

    if (!of) {
        return socket.emit('get-user-chat-error', 'Please provide name of recipient') 
    }
    if (of === name) {
        return socket.emit('get-user-chat-error', 'User cannot get chat with themself') 
    }
    if (!await User.findOne({name: of})) {
        return socket.emit('get-user-chat-error', 'Recipient does not exist') 
    }

    const pipeline = [
        { '$match': { '$or': [ { name: name }, { name: of } ] } },
        { '$unwind': '$messages' },
        { '$match': { '$or': [ { 'messages.to': name }, { 'messages.to': of } ] } },
        { '$project': { _id: 0 } },
        { '$sort': { 'messages.time': 1 } }
    ]

    const messages = await Message.aggregate(pipeline)

    socket.emit('client-get-user-chat', messages)
}

const sendMessage = async (io, socket, {content, to}) => {
    const name = socket.user.name

    if (!content || !to) {
        return socket.emit('send-message-error', 'Please provide message and recipient name') 
    }
    if (to === name) {
        return socket.emit('send-message-error', 'User cannot send message to themself')
    }
    if (!await User.findOne({name: to})) {
        return socket.emit('send-message-error', 'Recipient of message does not exist')
    }
    
    const IndianTime = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata'})
    const d = new Date(IndianTime)
    const time = '' + d.getFullYear() + '/' + 
    ( (d.getMonth() < 10) ? '0' + d.getMonth() : d.getMonth() ) + '/' + 
    ( (d.getDate() < 10) ? '0' + d.getDate() : d.getDate() ) + ' ' + 
    ( (d.getHours() < 10) ? '0' + d.getHours() : d.getHours() ) + ':' +
    ( (d.getMinutes() < 10 ? '0' + d.getMinutes() : d.getMinutes()) ) + ' ' +
    ( (d.getSeconds() < 10 ? '0' + d.getSeconds() : d.getSeconds()) ) + ':' +
    ( (d.getMilliseconds() < 10 ? '0' + d.getMilliseconds() : d.getMilliseconds()) )
    
    await Message.findOneAndUpdate({name}, {'$push': {messages: {message: content, to, time}}}, {
        new: true,
        runValidators: true
    })
    
    io.to(to).emit('receive-message', {content, from: name, to, time})
    io.to(name).emit('receive-message', {content, from: name, to, time})
}

module.exports = {
    getUserChat,
    sendMessage
}