import Resources from '../models/Resources.js'

export const getResourceById = async (req, res, next) => {
  const { id } = req.params
  const resource = await Resources.findOne({_id: id, isDeleted: false})

  if (!resource) return next(new Error('Resource not found'))
  res.status(200).json({data: resource})
}

export const deleteResourceById = async (req, res, next) => {
  const { id } = req.params
  const resource = await Resources.findOne({_id: id, isDeleted: false})

  if (!resource) return next(new Error('Resource not found'))

  await resource.softDelete()
  res.status(200).json({data: true})
}