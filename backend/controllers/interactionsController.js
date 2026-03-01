import Interactions from '../models/Interactions.js'
import Resources from '../models/Resources.js'
import Section from '../models/Sections.js'
import resolveInteraction from '../utils/ai_services/resolve_interactions.js'
import addResources from '../utils/ai_services/resource_browser.js'

export const getInteractionById = async (req, res, next) => {
    const { id } = req.params
    const interaction = await Interactions.findOne({_id: id, isDeleted: false})

    if (!interaction) return next(new Error('Interaction not found'))

    res.status(200).json({data: interaction})
}

export const getInteractionResources = async (req, res, next) => {
    const { id } = req.params
    const interaction = await Interactions.findOne({_id: id, isDeleted: false})
    
    if (!interaction) return next(new Error('Interaction not found'))

    let resources = await Resources.find({interactionId: id, isDeleted: false}).sort({ updatedAt: -1 }) ?? []
    if (resources.length === 0) {
        resources = await addResources({interaction})
    }
    
    res.status(200).json({data: resources})
}

export const createInteraction = async (req, res, next) => {
    const { sectionId, chatSessionId, studentQuestion } = req.body
    const studentId = req.user._id
  
    if (!studentQuestion) return next(new Error('Student question required'))
    
    let interaction = null
    if (sectionId) {
        const section = await Section.findOne({_id: sectionId, isDeleted: false})
        const histories = await Interactions.find({sectionId, isDeleted: false}).sort({ updatedAt: -1 })
        interaction = await resolveInteraction({sectionId, chatSessionId, studentId, studentQuestion, histories: histories.slice(-5), section})
    } else if (chatSessionId) {
        const histories = await Interactions.find({chatSessionId, isDeleted: false}).sort({ updatedAt: -1 })
        interaction = await resolveInteraction({sectionId, chatSessionId, studentId, studentQuestion, histories: histories.slice(-5)})
    } else next(new Error('sectionId or chatSessionId is required'))
    
    res.status(201).json({data: interaction})
}

export const deleteInteraction = async (req, res, next) => {
    const { id } = req.params
  
    const interaction = await Interactions.findOne({_id: id,isDeleted: false})
    
    if (!interaction) return next(new Error('Interaction not found'))
    await interaction.softDelete()
    
    res.status(200).json({data: true})
}