import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import connectDb from './config/database.js'

dotenv.config()
connectDb()

const app = express()
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get("/api",(req,res)=>{
    res.send("eAssistant Server is Live ...")
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}/api`)
})
