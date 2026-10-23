const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const educationSchema = new mongoose.Schema(
  {
    degree: { type: String, default: '' },
    institution: { type: String, default: '' },
    year: { type: String, default: '' },
  },
  { _id: false, id: true }
);

const experienceSchema = new mongoose.Schema(
  {
    title: { type: String, default: '' },
    company: { type: String, default: '' },
    duration: { type: String, default: '' },
    description: { type: String, default: '' },
  },
  { _id: false, id: true }
);

const resumeSchema = new mongoose.Schema(
  {
    name: String,
    size: Number,
    url: String,
    uploadedAt: Date,
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ['seeker', 'recruiter', 'admin'], default: 'seeker' },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true, minlength: 6, select: false },
    phone: { type: String, default: '' },
    location: { type: String, default: '' },
    headline: { type: String, default: '' },
    bio: { type: String, default: '' },
    skills: { type: [String], default: [] },
    education: { type: [educationSchema], default: [] },
    experience: { type: [experienceSchema], default: [] },
    resume: { type: resumeSchema, default: null },
    avatar: { type: String, default: '' },
    status: { type: String, enum: ['active', 'blocked'], default: 'active' },

    // Recruiter-only fields
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', default: null },
    companyName: { type: String, default: '' },
    designation: { type: String, default: '' },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } }
);

userSchema.index({ phone: 1 });

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toSafeObject = function toSafeObject() {
  const obj = this.toObject({ virtuals: true });
  delete obj.password;
  delete obj.__v;
  obj.id = obj._id.toString();
  return obj;
};

module.exports = mongoose.model('User', userSchema);
