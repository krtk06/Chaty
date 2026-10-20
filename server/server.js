import express from 'express'
import 'dotenv/config'
import dns from 'node:dns'
import cors from 'cors'
import connectDB from './configs/db.js'
import userRouter from './routes/userRoutes.js'
import chatRouter from './routes/chatRoutes.js'
import messageRouter from './routes/messageRoutes.js'
import creditRouter from './routes/creditRoutes.js'
import { stripeWebhooks } from './controllers/webhooks.js'

// Prefer IPv4 for outbound calls (AI gateway, ImageKit, Stripe): some
// networks have no working IPv6 route, which makes Node waste its first
// connection attempt on an unreachable address.
dns.setDefaultResultOrder('ipv4first')

const app = express()

await connectDB()

// Stripe needs the raw body to verify webhook signatures, so this route
// must be registered before the JSON body parser.
app.post('/api/stripe', express.raw({ type: 'application/json' }), stripeWebhooks)
app.use(express.json({ limit: '2mb' }))
app.use(cors())

app.get('/', (req, res) => res.send('Server is Live!'))
app.use('/api/user', userRouter)
app.use('/api/chat', chatRouter)
app.use('/api/message', messageRouter)
app.use('/api/credit', creditRouter)

app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' })
})

app.use((error, req, res, next) => {
    if (error?.name === 'MulterError') {
        return res.json({ success: false, message: error.code === 'LIMIT_FILE_SIZE'
            ? 'That file is too large. The limit is 2 MB.'
            : `Upload failed: ${error.message}` })
    }
    console.error('Unhandled error:', error)
    if (res.headersSent) return next(error)
    return res.status(500).json({ success: false, message: 'Internal server error' })
})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})
