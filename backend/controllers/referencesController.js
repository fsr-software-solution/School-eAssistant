import References from '../models/References.js'

export const getReferenceById = async (req, res, next) => {
  const { id } = req.params
  const reference = await References.findOne({_id: id, isDeleted: false})

  if (!reference) next(new Error('Reference not found'))
  res.status(200).json({data: reference})
}

export const getReferenceBooks = async (req, res, next) => {
  const { id } = req.params
  const reference = await References.findOne({_id: id, isDeleted: false})

  if (!reference) next(new Error('Reference not found'))
  const books = await References.findByBook(id)

  res.status(200).json({data: books})
}

export const deleteReferenceById = async (req, res, next) => {
  const { id } = req.params
  const reference = await References.findOne({_id: id, isDeleted: false})

  if (!reference) next(new Error('Reference not found'))
  await reference.softDelete()

  res.status(200).json({data: true})
}