/**
 * Purpose: Handles faculty access to review all submitted projects and update
 * their approval status with optional feedback.
 */

const Project = require('../models/Project');

const getFacultySections = async (req, res) => {
  try {
    const sections = await Project.distinct('section', { assigned_teacher: req.user.id });

    return res.json({
      success: true,
      data: sections.filter(Boolean).sort()
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getAllProjects = async (req, res) => {
  try {
    const { section } = req.query;

    if (!section) {
      return res.status(400).json({
        success: false,
        message: 'Section is required'
      });
    }

    const projects = await Project.find({
      section,
      assigned_teacher: req.user.id
    })
      .populate('studentId', 'name email')
      .populate('assigned_teacher', 'name email')
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      data: projects
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const updateProjectStatus = async (req, res) => {
  try {
    const projectId = req.params.id;
    const { status, feedback } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const updatedProject = await Project.findOneAndUpdate(
      {
        _id: projectId,
        assigned_teacher: req.user.id
      },
      {
        status,
        feedback: feedback || ''
      },
      { new: true, runValidators: true }
    ).populate('studentId', 'name email');

    if (!updatedProject) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    return res.json({
      success: true,
      data: updatedProject
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getFacultySections,
  getAllProjects,
  updateProjectStatus
};
