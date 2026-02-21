import mongoose from 'mongoose';

const sectionsSchema = new mongoose.Schema({
  unitId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Units',
    required: [true, 'Unit ID is required'],
    validate: {
      validator: async function(value) {
        const unit = await mongoose.model('Units').findById(value);
        return unit && !unit.isDeleted;
      },
      message: 'Referenced unit does not exist or has been deleted'
    }
  },
  sectionNumber: {
    type: String,
    required: [true, 'Section number is required'],
    trim: true,
  },
  parentSectionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sections',
    validate: {
      validator: async function(value) {
        if (!value) return true; // null is valid for top-level sections
        const section = await mongoose.model('Sections').findById(value);
        return section && !section.isDeleted;
      },
      message: 'Referenced parent section does not exist or has been deleted'
    }
  },
  headingLevel: {
    type: Number,
    required: [true, 'Heading level is required'],
    min: [1, 'Heading level must be at least 1'],
    max: [6, 'Heading level cannot exceed 6']
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
  },
  startingPage: {
    type: Number,
    required: [true, 'Starting page is required'],
    min: [1, 'Starting page must be at least 1']
  },
  endingPage: {
    type: Number,
    required: [true, 'Ending page is required'],
    min: [1, 'Ending page must be at least 1'],
    validate: {
      validator: function(value) {
        return value >= this.startingPage;
      },
      message: 'Ending page must be greater than or equal to starting page'
    }
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
  },
  aiClarification: {
    type: String,
  },
  summary: {
    type: String,
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index for unitId and sectionNumber to ensure uniqueness within a unit
sectionsSchema.index({ unitId: 1, sectionNumber: 1 }, { unique: true });

// Index for parent sections
sectionsSchema.index({ parentSectionId: 1 });

// Index for soft delete queries
sectionsSchema.index({ isDeleted: 1 });

// Update the updatedAt field before saving
sectionsSchema.pre('save', function() {
  this.updatedAt = new Date();
});

// Static method to find active sections
sectionsSchema.statics.findActive = function() {
  return this.find({ isDeleted: false });
};

// Static method to find sections by unit
sectionsSchema.statics.findByUnit = function(unitId) {
  return this.find({ unitId, isDeleted: false, parentSectionId: null })
    .sort({ sectionNumber: 1 });
};

// Static method to find subsections by parent section
sectionsSchema.statics.findSubsections = function(parentSectionId) {
  return this.find({ parentSectionId, isDeleted: false })
    .sort({ sectionNumber: 1 });
};

// Static method to find all sections in a hierarchy
sectionsSchema.statics.findHierarchy = async function(unitId) {
  const topLevelSections = await this.findByUnit(unitId);
  
  const buildHierarchy = async (sections) => {
    for (const section of sections) {
      const subsections = await this.findSubsections(section._id);
      if (subsections.length > 0) {
        section.subsections = await buildHierarchy(subsections);
      }
    }
    return sections;
  };
  
  return await buildHierarchy(topLevelSections);
};

// Instance method to mark as deleted (with cascade deletion for subsections)
sectionsSchema.methods.softDelete = async function() {
  this.isDeleted = true;
  this.deletedAt = new Date();
  await this.save();
  
  // Cascade delete subsections
  await mongoose.model('Sections').updateMany(
    { parentSectionId: this._id },
    { $set: { isDeleted: true, deletedAt: new Date() } }
  );
  
  return this;
};

export default mongoose.model('Sections', sectionsSchema);