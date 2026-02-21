import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import connectDb from './config/database.js'
import apiRoutes from './routes/index.js'
import { initializeAdmin } from './utils/adminInit.js'

dotenv.config()
connectDb()

const app = express()
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/api/v1', apiRoutes)
app.get("/api", (req, res) => {
    res.send("eAssistant Server is Live ...")
})

app.use((req, res) => {
    res.status(404).json({error: 'Route not found'})
})
app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(err.status || 500).json({error: err.message || 'Internal Server Error'})
})

const PORT = process.env.PORT || 5000
app.listen(PORT, async () => {
    console.log(`Server is running on port http://localhost:${PORT}/api`)

    // Initialize admin user
    await initializeAdmin()
})
