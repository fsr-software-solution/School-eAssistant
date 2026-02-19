import mongoose from 'mongoose'
import dotenv from 'dotenv'
dotenv.config()
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const connectVectorWithRetries = async (uri, options = {}, maxRetries = 5) => {
    let attempt = 0
    while (attempt < maxRetries) {
        try {
            const conn = mongoose.createConnection(uri, options)
            await conn.asPromise()
            console.log('Connected to MongoDB Vector Store')
                        conn.on('error', (err) => {
                console.error('Vector DB connection error:', err)
            })
            
            conn.on('disconnected', () => {
                console.log('Vector DB disconnected')
            })
            
            return conn
        } catch (err) {
            attempt++
            const delay = Math.min(1000 * 2 ** attempt, 30000)
            console.error(`Vector DB connection attempt ${attempt} failed:`, err.message)
            if (attempt < maxRetries) {
                console.log(`Retrying vector DB connection in ${delay}ms...`)
                await wait(delay)
            } else {
                console.error('All vector DB connection attempts failed.')
                console.error('If you use MongoDB Atlas, ensure your IP is added to the cluster access list:')
                console.error('https://www.mongodb.com/docs/atlas/security-whitelist/')
                console.error('Current MONGO_VECTOR_URI:', uri?.substring(0, 50) + '...')
                return null
            }
        }
    }
}

const connectVectorDb = async () => {
    const uri = process.env.MONGO_VECTOR_URI
    if (!uri) {
        console.warn('MONGO_VECTOR_URI is not set. Skipping vector DB connection.')
        return null
    }

    const options = {
        serverSelectionTimeoutMS: 30000,
        socketTimeoutMS: 45000,
        maxPoolSize: 10,
        heartbeatFrequencyMS: 10000,
        connectTimeoutMS: 30000,
        family: 4,
      
    }

    return await connectVectorWithRetries(uri, options, 5)
}

// Define vector document schema
const vectorDocumentSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    content: {
        type: String,
        required: true
    },
    embedding: {
        type: [Number],
        required: true
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
})

// Create indexes for better performance
vectorDocumentSchema.index({ id: 1 })
vectorDocumentSchema.index({ 'metadata.sessionId': 1 })
vectorDocumentSchema.index({ 'metadata.timestamp': 1 })

// Avoid redefining the model during hot-reload / multiple imports
const VectorDocument = mongoose.models.VectorDocument || mongoose.model('VectorDocument', vectorDocumentSchema)

export { connectVectorDb, VectorDocument }
