/**
 * Purpose: Defines the project schema for student submissions and their
 * verification lifecycle.
 */

const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    githubUrl: {
      type: String,
      required: true,
      trim: true
    },
    certificationFile: {
      type: String,
      default: ''
    },
    file: {
      type: String,
      default: ''
    },
    section: {
      type: String,
      required: true,
      trim: true
    },
    assigned_teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    feedback: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

module.exports = mongoose.model('Project', projectSchema);
