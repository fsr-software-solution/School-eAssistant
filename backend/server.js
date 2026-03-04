import express from 'express'
import dotenv from 'dotenv'
import path from 'path'
import cors from 'cors'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import connectDb from './config/database.js'
import apiRoutes from './routes/index.js'
import initializeAdmin from './utils/adminInit.js'
import { initializePaymentAccount, initializePremiumPlans } from './utils/paymentInit.js'
import { fileURLToPath } from 'url'
import { readFile } from 'fs/promises'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config()
connectDb()

const app = express()
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
})
// app.use(limiter)

app.use(cors())
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/api/v1', apiRoutes)
app.get("/api", (req, res) => {
    res.send("FSR School eAssistant Server is Live ...")
})

app.use(/.*/, async (req, res) => {
    let htmlFile = await readFile(path.join(__dirname, "public", "index.html"), { encoding: 'utf-8' })
    console.log(htmlFile)
    res.type("text/html")
    res.status(200).send(htmlFile)
})

app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(err.status || 500).json({error: err.message || 'Internal Server Error'})
})

await initializeAdmin()
await initializePaymentAccount()
await initializePremiumPlans()

if (process.env.NODE_ENV === 'development') {
    const PORT = process.env.PORT || 5000
    app.listen(PORT, async () => {
        console.log(`Server is running on port ${PORT} => http://localhost:${PORT}/api`)
    })
}
export default app