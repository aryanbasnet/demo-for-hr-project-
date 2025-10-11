// backend/models/Job.js
const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    trim: true
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  employmentType: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Contract', 'Internship'],
    default: 'Full-time'
  },
  experienceLevel: {
    type: String,
    enum: ['Entry', 'Mid', 'Senior', 'Lead', 'Executive'],
    required: true
  },
  description: {
    type: String,
    required: [true, 'Job description is required']
  },
  requirements: {
    type: [String],
    required: true
  },
  responsibilities: {
    type: [String],
    required: true
  },
  salaryRange: {
    min: { type: Number },
    max: { type: Number },
    currency: { type: String, default: 'USD' }
  },
  postingType: {
    type: String,
    enum: ['internal', 'external', 'both'],
    default: 'both'
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'closed', 'on-hold'],
    default: 'draft'
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  hiringManager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  openings: {
    type: Number,
    default: 1,
    min: 1
  },
  deadline: {
    type: Date
  },
  skills: {
    type: [String]
  },
  benefits: {
    type: [String]
  },
  applicationsCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for search optimization
jobSchema.index({ title: 'text', department: 'text', description: 'text' });

module.exports = mongoose.model('Job', jobSchema);