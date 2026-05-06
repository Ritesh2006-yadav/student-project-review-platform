/**
 * Purpose: Manages student-owned project CRUD operations, certification file
 * uploads, and approved portfolio retrieval.
 */

const Project = require('../models/Project');
const User = require('../models/User');
const mongoose = require('mongoose');

const formatProjectPayload = (project, filePath) => ({
  title: project.title,
  description: project.description,
  githubUrl: project.githubUrl,
  certificationFile: filePath !== undefined ? filePath : project.certificationFile,
  file: filePath !== undefined ? filePath : project.file,
  section: project.section,
  assigned_teacher: project.assigned_teacher,
  status: 'pending'
});

const isValidFacultyId = (teacherId) => mongoose.isValidObjectId(teacherId);

const getProjects = async (req, res, next) => {
  try {
    const projects = await Project.find({ studentId: req.user.id })
      .populate('assigned_teacher', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: projects
    });
  } catch (error) {
    next(error);
  }
};

const createProject = async (req, res, next) => {
  try {
    const { title, description, githubUrl, section, assigned_teacher } = req.body;

    if (!title || !description || !githubUrl || !section || !assigned_teacher) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, GitHub URL, section, and teacher are required'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Project file is required'
      });
    }

    const teacher = isValidFacultyId(assigned_teacher)
      ? await User.findOne({ _id: assigned_teacher, role: 'faculty' })
      : null;

    if (!teacher) {
      return res.status(400).json({
        success: false,
        message: 'Please select a valid faculty member'
      });
    }

    const project = await Project.create({
      studentId: req.user.id,
      ...formatProjectPayload(req.body, req.file ? req.file.path : '')
    });

    res.status(201).json({
      success: true,
      data: project
    });
  } catch (error) {
    next(error);
  }
};

const updateProject = async (req, res, next) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      studentId: req.user.id
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const { title, description, githubUrl, section, assigned_teacher } = req.body;

    if (!title || !description || !githubUrl || !section || !assigned_teacher) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, GitHub URL, section, and teacher are required'
      });
    }

    const teacher = isValidFacultyId(assigned_teacher)
      ? await User.findOne({ _id: assigned_teacher, role: 'faculty' })
      : null;

    if (!teacher) {
      return res.status(400).json({
        success: false,
        message: 'Please select a valid faculty member'
      });
    }

    project.title = title;
    project.description = description;
    project.githubUrl = githubUrl;
    project.certificationFile = req.file ? req.file.path : project.certificationFile;
    project.file = req.file ? req.file.path : project.file;
    project.section = section;
    project.assigned_teacher = assigned_teacher;
    project.status = 'pending';

    await project.save();

    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    next(error);
  }
};

const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findOneAndDelete({
      _id: req.params.id,
      studentId: req.user.id
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    res.json({
      success: true,
      data: { id: req.params.id }
    });
  } catch (error) {
    next(error);
  }
};

const getApprovedPortfolio = async (req, res, next) => {
  try {
    const projects = await Project.find({
      studentId: req.user.id,
      status: 'approved'
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: projects
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  getApprovedPortfolio
};
