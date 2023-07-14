const {getUserChat, sendMessage} = require('../controllers/messageController')

const messageEventListener = (io, socket) => {
    socket.on('get-user-chat', ({of}) => { getUserChat(io, socket, { of }) })
    socket.on('send-message', ({content, to}) => { sendMessage(io, socket, {content, to}) })
}

module.exports = {
    messageEventListener
}
