import Units from '../models/Units.js';

/**
 * Get a unit by ID
 */
export const getUnitById = async (req, res) => {
  try {
    const { id } = req.params;
    const unit = await Units.findOne({ _id: id, isDeleted: false })
      .populate('bookId', 'gradeLevel subject version');
    
    if (!unit) {
      return res.status(404).json({
        success: false,
        message: 'Unit not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: unit
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching unit',
      error: error.message
    });
  }
};

/**
 * Get sections for a specific unit
 */
export const getUnitSections = async (req, res) => {
  try {
    const { id } = req.params;
    const unit = await Units.findOne({ _id: id, isDeleted: false });
    
    if (!unit) {
      return res.status(404).json({
        success: false,
        message: 'Unit not found'
      });
    }
    
    const Sections = await import('../models/Sections.js');
    const sections = await Sections.default.findByUnit(id);
    
    res.status(200).json({
      success: true,
      data: sections
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching unit sections',
      error: error.message
    });
  }
};