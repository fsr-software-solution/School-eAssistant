import dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'
import connectDb from './config/database.js'
import { connectVectorDb } from './config/vectorDatabase.js'
import authRoutes from './routes/authRoutes.js'
import chatRoutes from './routes/chatRoutes.js'
import quizRoutes from './routes/quizRoutes.js'
import paymentRoutes from './routes/paymentRoutes.js'
import { initializeAdmin } from './utils/adminInit.js'
import { initializePaymentAccount, initializePremiumPlans } from './utils/paymentInit.js'
import vectorService from './services/vectorService.js'

// Load environment variables first
console.log('Loading environment variables...')
dotenv.config({ path: './.env' })
console.log('MONGO_URI:', process.env.MONGO_URI ? 'Loaded' : 'Not loaded')
console.log('GROQ_API_KEY:', process.env.GROQ_API_KEY ? 'Loaded' : 'Not loaded')

// Connect to both databases before starting the server
let mongoConnected = false
let vectorConnection = null
try {
    mongoConnected = await connectDb()
} catch (e) {
    console.error('Error while connecting to MongoDB:', e?.message ?? e)
}
try {
    vectorConnection = await connectVectorDb()
} catch (e) {
    console.error('Error while connecting to Vector DB:', e?.message ?? e)
}

const app = express()
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))


app.use("/api/auth", authRoutes)
app.use("/api/chat", chatRoutes)
app.use("/api/quizzes", quizRoutes)
app.use("/api/payments", paymentRoutes)

app.get("/api", (req, res) => {
    res.send("eAssistant Server is Live ...")
})

const PORT = process.env.PORT || 3000
app.listen(PORT, async () => {
    console.log(`Server is running on port http://localhost:${PORT}/api`)

    await initializeAdmin()
    await initializePaymentAccount()
    await initializePremiumPlans()
    await vectorService.initialize()

    // Initialize chat session controller
    const { default: chatSessionController } = await import('./controllers/chatSessionController.js')
    await chatSessionController.initialize()

    console.log("Vector service initialized successfully")
})
