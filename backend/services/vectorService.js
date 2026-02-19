import { ChatGroq } from '@langchain/groq'
import { VectorDocument } from '../config/vectorDatabase.js'
import dotenv from 'dotenv'

dotenv.config()

class VectorService {
    constructor() {
        this.genAI = null
        this.chatModel = null
    }

    async initialize() {
        try {
            this.genAI = new ChatGroq({
                apiKey: process.env.GROQ_API_KEY,
                model: 'llama-3.1-70b-versatile'
            })
            this.chatModel = this.genAI
            console.log('Vector service initialized with Groq LLM')
        } catch (error) {
            console.error('Error initializing vector service:', error)
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
                    model: 'llama-3.1-70b-versatile',
                    input: text
                })
            })

            if (!response.ok) {
                throw new Error(`Groq API error: ${response.status}`)
            }

            const data = await response.json()
            return data.data[0].embedding
        } catch (error) {
            console.error('Error creating embedding:', error)
            throw error
        }
    }

    async addChatMessage(sessionId, message, metadata) {
        try {
            const embedding = await this.createEmbedding(message)
            const messageId = `${sessionId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

            const vectorDoc = new VectorDocument({
                id: messageId,
                content: message,
                embedding: embedding,
                metadata: {
                    ...metadata,
                    sessionId,
                    timestamp: new Date().toISOString()
                }
            })

            await vectorDoc.save()
            return vectorDoc
        } catch (error) {
            console.error('Error adding chat message:', error)
            throw error
        }
    }

    async searchChatHistory(query, sessionId = null, maxResults = 5) {
        try {
            const queryEmbedding = await this.createEmbedding(query)

            // Build query object
            let queryObj = {}
            if (sessionId) {
                queryObj = { 'metadata.sessionId': sessionId }
            }

            // Search in MongoDB using cosine similarity
            const searchResults = await VectorDocument.find(queryObj)
                .limit(maxResults * 2) // Get more results for similarity calculation
                .lean()

            if (searchResults.length === 0) {
                return { results: [], similarities: [] }
            }

            // Calculate similarities manually
            const similarities = searchResults.map(doc => {
                const similarity = this.cosineSimilarity(queryEmbedding, doc.embedding)
                return {
                    id: doc.id,
                    similarity: similarity,
                    content: doc.content,
                    metadata: doc.metadata
                }
            })

            // Sort by similarity and return top results
            similarities.sort((a, b) => b.similarity - a.similarity)
            const topResults = similarities.slice(0, maxResults)

            return {
                results: topResults.map(r => ({
                    id: r.id,
                    content: r.content,
                    metadata: r.metadata
                })),
                similarities: topResults.map(r => r.similarity)
            }
        } catch (error) {
            console.error('Error searching chat history:', error)
            throw error
        }
    }

    async deleteSessionMessages(sessionId) {
        try {
            const deleteResult = await VectorDocument.deleteMany({
                'metadata.sessionId': sessionId
            })
            console.log(`Deleted ${deleteResult.deletedCount} messages from MongoDB for session ${sessionId}`)
            return deleteResult
        } catch (error) {
            console.error('Error deleting session messages:', error)
            throw error
        }
    }

    // Helper function to calculate cosine similarity
    cosineSimilarity(vec1, vec2) {
        const dotProduct = vec1.reduce((sum, val, i) => sum + val * vec2[i], 0)
        const magnitude1 = Math.sqrt(vec1.reduce((sum, val) => sum + val * val, 0))
        const magnitude2 = Math.sqrt(vec2.reduce((sum, val) => sum + val * val, 0))
        return dotProduct / (magnitude1 * magnitude2)
    }
}

export default new VectorService()
