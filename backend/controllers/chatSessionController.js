import vectorService from '../services/vectorService.js'
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatGroq } from "@langchain/groq";
import dotenv from 'dotenv'
dotenv.config()

class ChatSessionController {
    constructor() {
        this.genAI = null
        this.chatModel = null
        this.sessions = new Map() 
    }

    async initialize() {
        this.genAI = new ChatGroq({
            apiKey: process.env.GROQ_API_KEY,
            model: "llama-3.1-8b-instant"
        })
        this.chatModel = this.genAI
    }

    async createSession(req, res) {
        try {
            const { userId } = req.body
            const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

            this.sessions.set(sessionId, {
                userId,
                createdAt: new Date(),
                messages: []
            })

            res.json({
                success: true,
                sessionId,
                message: "Chat session created successfully"
            })
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Error creating chat session",
                error: error.message
            })
        }
    }

    async chat(req, res) {
        try {
            const { sessionId, message } = req.body

            if (!this.sessions.has(sessionId)) {
                return res.status(404).json({
                    success: false,
                    message: "Session not found"
                })
            }

            const session = this.sessions.get(sessionId)

            const relevantHistory = await vectorService.searchChatHistory(
                message,
                sessionId,
                3
            )

            const context = relevantHistory.documents.join('\n\n')

            const prompt = `
You are a helpful AI assistant for students.
Based on the previous conversation context,
answer the student's current question.

Previous Conversation Context:
${context}

Current Question: ${message}

Recent conversation:
${session.messages.slice(-5).map(msg => `${msg.role}: ${msg.content}`).join('\n')}

Please provide a helpful and educational response. If the context doesn't contain relevant information, provide a general helpful answer.
            `

            const result = await this.chatModel.invoke([
                ["human", prompt]
            ])
            const response = result.content

            session.messages.push(
                { role: 'user', content: message, timestamp: new Date() },
                { role: 'assistant', content: response, timestamp: new Date() }
            )

            await vectorService.addChatMessage(sessionId, message, { role: 'user', userId: session.userId })
            await vectorService.addChatMessage(sessionId, response, { role: 'assistant', userId: session.userId })

            res.json({
                success: true,
                response,
                contextUsed: relevantHistory.documents.length > 0,
                sources: relevantHistory.metadatas.map(meta => ({
                    sessionId: meta.sessionId,
                    timestamp: meta.timestamp,
                    type: meta.type
                }))
            })

        } catch (error) {
            console.error("Error in chat:", error)
            res.status(500).json({
                success: false,
                message: "Error processing chat message",
                error: error.message
            })
        }
    }

    async getSessionHistory(req, res) {
        try {
            const { sessionId } = req.params

            if (!this.sessions.has(sessionId)) {
                return res.status(404).json({
                    success: false,
                    message: "Session not found"
                })
            }

            const session = this.sessions.get(sessionId)

            res.json({
                success: true,
                session: {
                    userId: session.userId,
                    createdAt: session.createdAt,
                    messages: session.messages
                }
            })

        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Error getting session history",
                error: error.message
            })
        }
    }

    async deleteSession(req, res) {
        try {
            const { sessionId } = req.params

            if (!this.sessions.has(sessionId)) {
                return res.status(404).json({
                    success: false,
                    message: "Session not found"
                })
            }

            this.sessions.delete(sessionId)
            await vectorService.deleteSessionMessages(sessionId)

            res.json({
                success: true,
                message: "Session deleted successfully"
            })

        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Error deleting session",
                error: error.message
            })
        }
    }
}

export default new ChatSessionController()
