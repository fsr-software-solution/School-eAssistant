import mongoose from 'mongoose';

const resourcesSchema = new mongoose.Schema({
  sectionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sections',
    validate: {
      validator: async function(value) {
        if (!value) return true; // null is valid when referencing interaction
        const section = await mongoose.model('Sections').findById(value);
        return section && !section.isDeleted;
      },
      message: 'Referenced section does not exist or has been deleted'
    }
  },
  interactionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Interactions',
    validate: {
      validator: async function(value) {
        if (!value) return true; // null is valid when referencing section
        const interaction = await mongoose.model('Interactions').findById(value);
        return interaction && !interaction.isDeleted;
      },
      message: 'Referenced interaction does not exist or has been deleted'
    }
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
  },
  description: {
    type: String,
  },
  type: {
    type: String,
    required: [true, 'Type is required'],
    enum: {
      values: ['article', 'youtube', 'image', 'other'],
      message: 'Type must be one of: article, youtube, image, other'
    }
  },
  link: {
    type: String,
    required: [true, 'Link is required'],
    trim: true,
    validate: {
      validator: function(value) {
        // Basic URL validation
        const urlRegex = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;
        return urlRegex.test(value);
      },
      message: 'Link must be a valid URL'
    }
  },
  // Common attributes
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

// Compound index to ensure a resource is linked to either a section or interaction, but not both
resourcesSchema.index({ sectionId: 1, interactionId: 1 }, { unique: true });

// Index for sectionId to optimize queries
resourcesSchema.index({ sectionId: 1 });

// Index for interactionId to optimize queries
resourcesSchema.index({ interactionId: 1 });

// Index for type to optimize queries
resourcesSchema.index({ type: 1 });

// Index for soft delete queries
resourcesSchema.index({ isDeleted: 1 });

// Custom validation to ensure exactly one of sectionId or interactionId is provided
resourcesSchema.pre('save', function() {
  this.updatedAt = new Date();
  
  if (!this.sectionId && !this.interactionId) {
    return next(new Error('Either sectionId or interactionId must be provided'));
  }
  
  if (this.sectionId && this.interactionId) {
    return next(new Error('Resource cannot be linked to both a section and an interaction'));
  }
  
  next();
});

// Static method to find active resources
resourcesSchema.statics.findActive = function() {
  return this.find({ isDeleted: false });
};

// Static method to find resources by section
resourcesSchema.statics.findBySection = function(sectionId) {
  return this.find({ sectionId, isDeleted: false });
};

// Static method to find resources by interaction
resourcesSchema.statics.findByInteraction = function(interactionId) {
  return this.find({ interactionId, isDeleted: false });
};

// Static method to find resources by type
resourcesSchema.statics.findByType = function(type) {
  return this.find({ type, isDeleted: false });
};

// Instance method to mark as deleted
resourcesSchema.methods.softDelete = function() {
  this.isDeleted = true;
  this.deletedAt = new Date();
  return this.save();
};

export default mongoose.model('Resources', resourcesSchema);