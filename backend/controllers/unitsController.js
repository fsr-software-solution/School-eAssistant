import Units from '../models/Units.js'
import Sections from '../models/Sections.js'

export const getUnitById = async (req, res, next) => {
  const { id } = req.params
  const unit = await Units.findOne({ _id: id, isDeleted: false })
  res.status(200).json({data: unit})
}

export const getUnitSections = async (req, res, next) => {
  const { id } = req.params
  const unit = await Units.findOne({ _id: id, isDeleted: false })
  
  if (!unit) next(new Error('Unit not found'))
  const sections = await Sections.findByUnit(id)
  
  res.status(200).json({data: sections})
}