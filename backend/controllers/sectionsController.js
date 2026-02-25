import Sections from '../models/Sections.js'
import Resources from '../models/Resources.js'
import Interactions from '../models/Interactions.js'
import { summarizer, clarifier } from '../utils/ai_services/content_generator.js'
import addResources from '../utils/ai_services/resource_browser.js'


export const getSectionById = async (req, res, next) => {
  const { id } = req.params
  const section = await Sections.findOne({ _id: id, isDeleted: false })
  
  if (!section) {
    next(new Error('Section not found'))
  }

  if (!section.summary) {
    section.summary = await summarizer({section})
    await section.save()
  }

  if (!section.aiClarification) {
    section.aiClarification = await clarifier({section})
    await section.save()
  }
    
  res.status(200).json({data: section})
}

export const getSectionSubsections = async (req, res, next) => {
    const { id } = req.params
    const section = await Sections.findOne({ _id: id, isDeleted: false })
    
    if (!section) next(new Error('Section not found'))    
    const subsections = await Sections.findSubsections(id)
    
    res.status(200).json({data: subsections})
}

export const getSectionResources = async (req, res, next) => {
  const { id } = req.params
  const section = await Sections.findOne({ _id: id, isDeleted: false })
  
  if (!section) next(new Error('Section not found'))
    
  let resources = await Resources.find({ sectionId: id, isDeleted: false }) ?? []
  if (resources.length === 0) {
    resources = await addResources({section})
  }
  
  res.status(200).json({data: resources})
}

export const getSectionInteractions = async (req, res, next) => {
  const { id } = req.params
  const section = await Sections.findOne({ _id: id, isDeleted: false })
  
  if (!section) next(new Error('Section not found'))

  let interactions = []
  if (req.user?.role == 'admin')
    interactions = await Interactions.find({ sectionId: id, isDeleted: false })
  else
    interactions = await Interactions.find({ sectionId: id, studentId: req.user?._id, isDeleted: false })
  
  res.status(200).json({data: interactions})
}

export const updateSection = async (req, res, next) => {
  const { id } = req.params
  const { aiClarification } = req.body
  
  const section = await Sections.findOne({ _id: id, isDeleted: false })
  
  if (!section) next(new Error('Section not found'))
  section.aiClarification = aiClarification
  await section.save()
  
  res.status(200).json({data: section})
}