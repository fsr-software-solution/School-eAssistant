import fs from 'fs/promises'
import path from 'path'
import dotenv from 'dotenv'
dotenv.config()
import { ChatGoogleGenerativeAI } from '@langchain/google-genai'
import { ChatGroq } from '@langchain/groq'
import { VectorDocument, connectVectorDb } from '../config/vectorDatabase.js'

class FaissService {
    constructor() {
        this.genAI = null
        this.embeddingModel = null
        this.index = null
        this.documents = [] 
        this.indexPath = path.join(process.cwd(), 'data', 'faiss_index.index')
        this.docsPath = path.join(process.cwd(), 'data', 'documents.json')
        this.dimension = 768
        
        // Model preferences array
        this.MODEL_PREFERENCES = [
            'llama-3.1-70b-versatile',
            'llama-3.1-8b-instant',
            'llama-3.2-90b-vision-preview',
            'llama-3.2-11b-vision-preview',
            'llama-3.2-3b-preview',
            'llama-3.2-1b-preview',
            'llama-3-70b-8192',
            'llama-3-8b-8192',
            'mixtral-8x7b-32768',
            'gemma2-9b-it',
            'gemma-7b-it',
            'whisper-large-v3',
        ]
    }

    async initialize() {
        try {
            let modelInitialized = false
            
            for (const modelName of this.MODEL_PREFERENCES) {
                try {
                    this.genAI = new ChatGroq({
                        apiKey: process.env.GROQ_API_KEY,
                        model: modelName
                    })
                    console.log(`Successfully initialized with model: ${modelName}`)
                    modelInitialized = true
                    break
                } catch (modelError) {
                    console.log(`Model ${modelName} not available, trying next...`)
                    continue
                }
            }

            if (!modelInitialized) {
                throw new Error("No available Groq models found")
            }

            // Create data directory if it doesn't exist
            const dataDir = path.dirname(this.indexPath)
            await fs.mkdir(dataDir, { recursive: true })

            // Load existing index and documents if they exist
            await this.loadIndex()

            console.log("FAISS service initialized successfully")
        } catch (error) {
            console.error("Error initializing FAISS service:", error)
            throw error
        }
    }

    async createEmbedding(text) {
        try {
            // Use Groq for embeddings (OpenAI-compatible API)
            const response = await fetch('https://api.groq.com/openai/v1/embeddings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
                },
                body: JSON.stringify({
                    model: 'text-embedding-ada-002',
                    input: text
                })
            })

            if (!response.ok) {
                throw new Error(`Groq API error: ${response.status}`)
            }

            const data = await response.json()
            return data.data[0].embedding
        } catch (error) {
            console.error("Error creating embedding:", error)
            // Fallback: create a simple hash-based embedding for testing
            return this.createSimpleEmbedding(text)
        }
    }

    createSimpleEmbedding(text) {
        // Simple fallback embedding (768 dimensions)
        const embedding = new Array(768).fill(0)
        let hash = 0
        for (let i = 0; i < text.length; i++) {
            hash = text.charCodeAt(i) + ((hash << 5) - hash)
        }

        // Distribute hash across embedding dimensions
        for (let i = 0; i < 768; i++) {
            embedding[i] = ((hash * (i + 1)) % 1000) / 1000
        }

        return embedding
    }

    async addChatMessage(sessionId, message, metadata) {
        try {
            const embedding = await this.createEmbedding(message)
            const messageId = `${sessionId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

            // Save to MongoDB Vector Store
            const vectorDoc = new VectorDocument({
                id: messageId,
                content: message,
                embedding: embedding,
                metadata: {
                    ...metadata,
                    sessionId,
                    timestamp: new Date().toISOString(),
                    type: metadata.type || 'message'
                }
            })

            await vectorDoc.save()

            // Also maintain in-memory index for compatibility
            const document = {
                id: messageId,
                content: message,
                metadata: {
                    ...metadata,
                    sessionId,
                    timestamp: new Date().toISOString(),
                    type: metadata.type || 'message'
                }
            }

            this.documents.push(document)

            if (!this.index) {
                this.index = {
                    vectors: [embedding],
                    ids: [messageId]
                }
            } else {
                // Add to existing index
                this.index.vectors.push(embedding)
                this.index.ids.push(messageId)
            }

            // Save to disk for fallback
            await this.saveIndex()

            return messageId
        } catch (error) {
            console.error("Error adding chat message:", error)
            throw error
        }
    }

    async searchChatHistory(query, sessionId = null, maxResults = 5) {
        try {
            const queryEmbedding = await this.createEmbedding(query)

            // Try to search in MongoDB first
            try {
                let queryObj = {}
                if (sessionId) {
                    queryObj = { 'metadata.sessionId': sessionId }
                }

                const mongoResults = await VectorDocument.find(queryObj)
                    .limit(maxResults * 2) // Get more results for similarity calculation
                    .sort({ createdAt: -1 })
                    .lean()

                if (mongoResults.length > 0) {
                    // Calculate similarities for MongoDB results
                    const similarities = mongoResults.map(doc => {
                        const similarity = this.cosineSimilarity(queryEmbedding, doc.embedding)
                        return {
                            ...doc,
                            similarity
                        }
                    })

                    // Sort by similarity and take top results
                    const topResults = similarities
                        .sort((a, b) => b.similarity - a.similarity)
                        .slice(0, maxResults)

                    const documents = topResults.map(doc => doc.content)
                    const metadatas = topResults.map(doc => doc.metadata)
                    const distances = topResults.map(doc => 1 - doc.similarity)

                    return {
                        documents,
                        metadatas,
                        distances
                    }
                }
            } catch (mongoError) {
                console.warn("MongoDB search failed, falling back to in-memory search:", mongoError)
            }

            // Fallback to in-memory search if MongoDB fails or is empty
            if (!this.index || this.index.vectors.length === 0) {
                return {
                    documents: [],
                    metadatas: [],
                    distances: []
                }
            }

            // Calculate cosine similarity for all vectors
            const similarities = this.index.vectors.map((vector, index) => {
                const similarity = this.cosineSimilarity(queryEmbedding, vector)
                return {
                    index,
                    similarity,
                    id: this.index.ids[index]
                }
            })

            // Filter by sessionId if provided
            let filteredSimilarities = similarities
            if (sessionId) {
                filteredSimilarities = similarities.filter(item => {
                    const doc = this.documents.find(d => d.id === item.id)
                    return doc && doc.metadata.sessionId === sessionId
                })
            }

            // Sort by similarity (highest first) and get top results
            const topResults = filteredSimilarities
                .sort((a, b) => b.similarity - a.similarity)
                .slice(0, maxResults)

            const documents = []
            const metadatas = []
            const distances = []

            for (const result of topResults) {
                const doc = this.documents.find(d => d.id === result.id)
                if (doc) {
                    documents.push(doc.content)
                    metadatas.push(doc.metadata)
                    distances.push(1 - result.similarity) // Convert similarity to distance
                }
            }

            return {
                documents,
                metadatas,
                distances
            }
        } catch (error) {
            console.error("Error searching chat history:", error)
            throw error
        }
    }

    async deleteSessionMessages(sessionId) {
        try {
            // Delete from MongoDB first
            try {
                const deleteResult = await VectorDocument.deleteMany({
                    'metadata.sessionId': sessionId
                })
                console.log(`Deleted ${deleteResult.deletedCount} messages from MongoDB for session ${sessionId}`)
            } catch (mongoError) {
                console.warn("MongoDB delete failed:", mongoError)
            }

            // Find message IDs for the session
            const sessionMessageIds = this.documents
                .filter(doc => doc.metadata.sessionId === sessionId)
                .map(doc => doc.id)

            // Remove documents for this session
            this.documents = this.documents.filter(doc => doc.metadata.sessionId !== sessionId)

            // Remove from index
            if (this.index && sessionMessageIds.length > 0) {
                const keepVectors = []
                const keepIds = []

                this.index.ids.forEach((id, index) => {
                    if (!sessionMessageIds.includes(id)) {
                        keepVectors.push(this.index.vectors[index])
                        keepIds.push(id)
                    }
                })

                this.index.vectors = keepVectors
                this.index.ids = keepIds
            }

            // Save updated index
            await this.saveIndex()
            console.log(`Deleted ${sessionMessageIds.length} messages for session ${sessionId}`)
        } catch (error) {
            console.error("Error deleting session messages:", error)
            throw error
        }
    }

    cosineSimilarity(vecA, vecB) {
        if (vecA.length !== vecB.length) {
            throw new Error('Vectors must be of same length')
        }

        let dotProduct = 0
        let normA = 0
        let normB = 0

        for (let i = 0; i < vecA.length; i++) {
            dotProduct += vecA[i] * vecB[i]
            normA += vecA[i] * vecA[i]
            normB += vecB[i] * vecB[i]
        }

        normA = Math.sqrt(normA)
        normB = Math.sqrt(normB)

        if (normA === 0 || normB === 0) {
            return 0
        }

        return dotProduct / (normA * normB)
    }

    async saveIndex() {
        try {
            const indexData = {
                vectors: this.index.vectors,
                ids: this.index.ids
            }
            await fs.writeFile(this.indexPath, JSON.stringify(indexData))
            await fs.writeFile(this.docsPath, JSON.stringify(this.documents, null, 2))
        } catch (error) {
            console.error("Error saving index:", error)
            throw error
        }
    }

    async loadIndex() {
        try {
            // Try to load from MongoDB first
            try {
                const mongoDocs = await VectorDocument.find({})
                    .sort({ createdAt: 1 })
                    .lean()

                if (mongoDocs.length > 0) {
                    this.documents = mongoDocs.map(doc => ({
                        id: doc.id,
                        content: doc.content,
                        metadata: doc.metadata
                    }))

                    this.index = {
                        vectors: mongoDocs.map(doc => doc.embedding),
                        ids: mongoDocs.map(doc => doc.id)
                    }

                    console.log(`Loaded ${this.documents.length} documents from MongoDB`)
                    return
                }
            } catch (mongoError) {
                console.warn("MongoDB load failed, falling back to file system:", mongoError)
            }

            // Fallback to file system
            const indexExists = await fs.access(this.indexPath).then(() => true).catch(() => false)
            const docsExists = await fs.access(this.docsPath).then(() => true).catch(() => false)

            if (indexExists && docsExists) {
                const indexData = await fs.readFile(this.indexPath, 'utf-8')
                const docsData = await fs.readFile(this.docsPath, 'utf-8')

                const parsedIndex = JSON.parse(indexData)
                this.index = {
                    vectors: parsedIndex.vectors,
                    ids: parsedIndex.ids
                }
                this.documents = JSON.parse(docsData)

                console.log(`Loaded FAISS index with ${this.documents.length} documents from file system`)
            } else {
                // Initialize empty index
                this.index = null
                this.documents = []
                console.log("Created new FAISS index")
            }
        } catch (error) {
            console.error("Error loading index:", error)
            // Start with empty index if loading fails
            this.index = null
            this.documents = []
        }
    }

    // Get index statistics
    async getStats() {
        try {
            const mongoCount = await VectorDocument.countDocuments()
            return {
                totalDocuments: this.documents.length,
                totalVectors: this.index ? this.index.vectors.length : 0,
                dimension: this.dimension,
                indexPath: this.indexPath,
                mongoDocuments: mongoCount,
                storageType: 'Hybrid (MongoDB + File System)'
            }
        } catch (error) {
            console.error("Error getting stats:", error)
            return {
                totalDocuments: this.documents.length,
                totalVectors: this.index ? this.index.vectors.length : 0,
                dimension: this.dimension,
                indexPath: this.indexPath,
                mongoDocuments: 0,
                storageType: 'File System Only'
            }
        }
    }
}

export default new FaissService()
