import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import connectDb from './config/database.js'
import apiRoutes from './routes/index.js'
import authRoutes from './routes/authRoutes.js'
import chatRoutes from './routes/chatRoutes.js'
import { initializeAdmin } from './utils/adminInit.js'

dotenv.config()
connectDb()

const app = express()
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))


app.use("/api/auth", authRoutes)
app.use("/api/chat", chatRoutes)

app.get("/api", (req, res) => {
    res.send("eAssistant Server is Live ...")
})
// API routes
app.use('/api', apiRoutes)

const PORT = process.env.PORT || 5000
app.listen(PORT, async () => {
    console.log(`Server is running on port http://localhost:${PORT}/api`)

    // Initialize admin user
    await initializeAdmin()
})
