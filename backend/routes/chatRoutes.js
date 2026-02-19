import express from 'express'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

let chatSessionController = null

const initializeController = async () => {
    if (!chatSessionController) {
        const { default: controller } = await import('../controllers/chatSessionController.js')
        chatSessionController = controller
        await chatSessionController.initialize()
    }
    return chatSessionController
}

router.post('/session/create', protect, async (req, res) => {
    const controller = await initializeController()
    return controller.createSession(req, res)
})

router.post('/session/chat', protect, async (req, res) => {
    const controller = await initializeController()
    return controller.chat(req, res)
})

router.get('/session/:sessionId', protect, async (req, res) => {
    const controller = await initializeController()
    return controller.getSessionHistory(req, res)
})

router.delete('/session/:sessionId', protect, async (req, res) => {
    const controller = await initializeController()
    return controller.deleteSession(req, res)
})

export default router
