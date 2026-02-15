import express from 'express'
const PORT = 5000
import dotenv from 'dotenv'
dotenv.config()
import cors from 'cors'
const app=express()
app.use(cors())
import connectDb from './config/database.js'
// connectDb()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get("/use",(req,res)=>{
    res.send("Hello World")
})
app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost/${PORT}`)
})       