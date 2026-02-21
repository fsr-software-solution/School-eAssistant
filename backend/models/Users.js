import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const usersSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  role: {
    type: String,
    required: [true, 'Role is required'],
    enum: ['student', 'admin'],
    default: 'student'
  },
  refreshToken: {
    type: String
  },

  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: Date
}, {
  timestamps: true
});

usersSchema.pre('save', async function() {
  this.updatedAt = new Date();
  if (!this.isModified('password')) return this.save();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  return this.save();
});


usersSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};


usersSchema.index({ isDeleted: 1 });

usersSchema.statics.findActive = function () {
  return this.find({ isDeleted: false });
};

usersSchema.methods.softDelete = function () {
  this.isDeleted = true;
  this.deletedAt = new Date();
  return this.save();
};

export default mongoose.model('Users', usersSchema);
