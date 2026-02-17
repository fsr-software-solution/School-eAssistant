import Sections from '../models/Sections.js';

/**
 * Get a section by ID
 */
export const getSectionById = async (req, res) => {
  try {
    const { id } = req.params;
    const section = await Sections.findOne({ _id: id, isDeleted: false })
      .populate('unitId', 'unitNumber title');
    
    if (!section) {
      return res.status(404).json({
        success: false,
        message: 'Section not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: section
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching section',
      error: error.message
    });
  }
};

/**
 * Get subsections for a specific section
 */
export const getSectionSubsections = async (req, res) => {
  try {
    const { id } = req.params;
    const section = await Sections.findOne({ _id: id, isDeleted: false });
    
    if (!section) {
      return res.status(404).json({
        success: false,
        message: 'Section not found'
      });
    }
    
    const subsections = await Sections.findSubsections(id);
    
    res.status(200).json({
      success: true,
      data: subsections
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching section subsections',
      error: error.message
    });
  }
};

/**
 * Get resources for a specific section
 */
export const getSectionResources = async (req, res) => {
  try {
    const { id } = req.params;
    const section = await Sections.findOne({ _id: id, isDeleted: false });
    
    if (!section) {
      return res.status(404).json({
        success: false,
        message: 'Section not found'
      });
    }
    
    // Import Resources model dynamically to avoid circular dependencies
    const Resources = await import('../models/Resources.js');
    const resources = await Resources.default.find({ sectionId: id, isDeleted: false });
    
    res.status(200).json({
      success: true,
      data: resources
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching section resources',
      error: error.message
    });
  }
};

/**
 * Get interactions for a specific section
 */
export const getSectionInteractions = async (req, res) => {
  try {
    const { id } = req.params;
    const section = await Sections.findOne({ _id: id, isDeleted: false });
    
    if (!section) {
      return res.status(404).json({
        success: false,
        message: 'Section not found'
      });
    }
    
    // Import Interactions model dynamically to avoid circular dependencies
    const Interactions = await import('../models/Interactions.js');
    const interactions = await Interactions.default.find({ sectionId: id, isDeleted: false });
    
    res.status(200).json({
      success: true,
      data: interactions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching section interactions',
      error: error.message
    });
  }
};

/**
 * Update a section
 */
export const updateSection = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const section = await Sections.findOne({ _id: id, isDeleted: false });
    
    if (!section) {
      return res.status(404).json({
        success: false,
        message: 'Section not found'
      });
    }
    
    // Update the section with new data
    Object.assign(section, updateData);
    await section.save();
    
    res.status(200).json({
      success: true,
      data: section,
      message: 'Section updated successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating section',
      error: error.message
    });
  }
};

/**
 * Delete a section
 */
export const deleteSection = async (req, res) => {
  try {
    const { id } = req.params;
    const section = await Sections.findOne({ _id: id, isDeleted: false });
    
    if (!section) {
      return res.status(404).json({
        success: false,
        message: 'Section not found'
      });
    }
    
    // Use the soft delete method which also deletes subsections
    await section.softDelete();
    
    res.status(200).json({
      success: true,
      message: 'Section deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting section',
      error: error.message
    });
  }
};