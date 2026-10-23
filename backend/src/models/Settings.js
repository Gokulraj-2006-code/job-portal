const mongoose = require('mongoose');

// Singleton document holding site-wide configuration that the mock
// frontend previously stored under separate localStorage keys.
const settingsSchema = new mongoose.Schema({
  announcement: {
    message: { type: String, default: 'Welcome to JobPortal! New jobs are added every week.' },
    active: { type: Boolean, default: true },
    updatedAt: { type: Date, default: Date.now },
  },
  categories: {
    type: [String],
    default: ['Engineering', 'Design', 'Product', 'Marketing', 'Sales', 'Finance', 'Human Resources'],
  },
  experienceLevels: {
    type: [String],
    default: ['Fresher', '1-3 Years', '3+ Years'],
  },
  salarySettings: {
    currency: { type: String, default: 'INR' },
    currencySymbol: { type: String, default: '₹' },
    minSalary: { type: Number, default: 150000 },
    maxSalary: { type: Number, default: 5000000 },
  },
});

settingsSchema.statics.getSingleton = async function getSingleton() {
  let doc = await this.findOne();
  if (!doc) {
    doc = await this.create({});
  }
  return doc;
};

module.exports = mongoose.model('Settings', settingsSchema);
