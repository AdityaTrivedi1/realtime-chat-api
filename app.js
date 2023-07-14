require('dotenv').config()
require('express-async-errors')

// db
const connectDB = require('./db/connectDB')

// express
const express = require('express')
const app = express()

// packages
const http = require('http')
const socketio = require('socket.io')

// security packages
const rateLimier = require('express-rate-limit')
const helmet = require('helmet')
const cors = require('cors')
const xss = require('xss-clean')
const mongoSanitize = require('express-mongo-sanitize')

// error handlers
const notFound = require('./ middleware/notFound')
const customErrorHandler = require('./ middleware/customErrorHandler')

// routers
const authRoute = require('./routes/authRoutes')

const server = http.createServer(app)
const io = new socketio.Server(server)

app.use(express.json())


app.set('trust proxy', 1)
app.use(rateLimier({
    windowMS: 60 * 1000,
    max: 30
}))

app.use(helmet())
app.use(cors())
app.use(xss())
app.use(mongoSanitize())


app.get('/', (req, res) => {
    res.send('<h1>Realtime Chat App</h1>')
})

// routes
app.use('/api/v1/auth', authRoute)


// error handlers
app.use(notFound)
app.use(customErrorHandler)


// socket.io middlewares
const authenticateWS = require('./ middleware/authenticateWS')

io.use(authenticateWS)

// socket.io event-listeners
const {messageEventListener} = require('./event-listener/messageEventListener')

io.on('connection', (socket) => {
    socket.emit('connected', socket.user)

    if (io.sockets.adapter.rooms.get(socket.user.name) === undefined) {
        socket.broadcast.emit('user-connected', socket.user)
    }
    
    socket.join(socket.user.name)

    messageEventListener(io, socket)

    socket.on('disconnect', () => {
        if (io.sockets.adapter.rooms.get(socket.user.name) === undefined) {
            socket.broadcast.emit('user-disconnected', socket.user)
        }
    })
})


const port = process.env.PORT || 3000

const start = async () => {
    try {
        await connectDB(process.env.MONGO_URI)
        server.listen(port)
        console.log(`Server is listening on ${port}...`)
    } catch (error) {
        console.log('Unable to start the server')
        console.log(error)
    }
}

start()
