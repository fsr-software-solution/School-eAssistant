import StudentProgress from '../models/StudentProgress.js'
import Users from '../models/Users.js'
import Sections from '../models/Sections.js'

export const getStudentProgress = async (req, res, next) => {
    const { id } = req.params
    
    const progress = await StudentProgress.findOne({_id: id, isDeleted: false})

    if (!progress) return next(new Error('Student progress record not found'))
    res.status(200).json({data: progress})
}

export const createStudentProgress = async (req, res, next) => {
    const { sectionId, status = 'not started' } = req.body
    const studentId = req.user._id

    if (!sectionId) return next(new Error('Section ID are required'))

    if (!['not started', 'in progress', 'completed'].includes(status)) 
        return next(new Error('Invalid status. Must be one of: not started, in progress, completed'))

    const student = await Users.findOne({_id: studentId, isDeleted: false})
    if (!student) return next(new Error('Invalid student ID or student not found'))

    const section = await Sections.findOne({_id: sectionId, isDeleted: false})
    if (!section) return next(new Error('Invalid section ID or section not found'))

    const existingProgress = await StudentProgress.findOne({studentId, sectionId, isDeleted: false})
    if (existingProgress) {
        existingProgress.status = status
        await existingProgress.save()
        return res.status(201).json({data: existingProgress})
    }

    const progress = await StudentProgress.create({
      studentId,
      sectionId,
      status
    })

    res.status(201).json({data: progress})
}

export const updateStudentProgress = async (req, res, next) => {
    const { id } = req.params
    const { status = 'in progress' } = req.body

    if (!['not started', 'in progress', 'completed'].includes(status)) 
        return next(new Error('Invalid status. Must be one of: not started, in progress, completed'))

    const progress = await StudentProgress.findOne({_id: id, isDeleted: false})
    if (!progress) return next(new Error('Student progress record not found'))
        
    progress.status = status
    await progress.save()

    res.status(200).json({data: progress})
}

export const deleteStudentProgress = async (req, res, next) => {
    const { id } = req.params
    const progress = await StudentProgress.findOne({_id: id, isDeleted: false})

    if (!progress) return next(new Error('Student progress record not found'))
    await progress.softDelete()

    res.status(200).json({data: true})
}