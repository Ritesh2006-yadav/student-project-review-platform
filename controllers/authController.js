/**
 * Purpose: Handles student registration, login, profile retrieval, and skill
 * updates with JWT-based authentication.
 */

const jwt = require('jsonwebtoken');

const User = require('../models/User');

const allowedRoles = ['student', 'faculty', 'recruiter'];

const createToken = (user) =>
  jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  skills: user.skills,
  createdAt: user.createdAt
});

const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required'
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: allowedRoles.includes(role) ? role : 'student'
    });

    res.status(201).json({
      success: true,
      data: {
        token: createToken(user),
        user: sanitizeUser(user)
      }
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    res.json({
      success: true,
      data: {
        token: createToken(user),
        user: sanitizeUser(user)
      }
    });
  } catch (error) {
    next(error);
  }
};

const getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

const getFacultyOptions = async (req, res, next) => {
  try {
    const faculty = await User.find({ role: 'faculty' })
      .select('name email')
      .sort({ name: 1 });

    res.json({
      success: true,
      data: faculty
    });
  } catch (error) {
    next(error);
  }
};

const updateSkills = async (req, res, next) => {
  try {
    const { skills } = req.body;

    if (!Array.isArray(skills)) {
      return res.status(400).json({
        success: false,
        message: 'Skills must be provided as an array'
      });
    }

    const sanitizedSkills = [...new Set(
      skills
        .map((skill) => String(skill).trim())
        .filter(Boolean)
    )];

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { skills: sanitizedSkills },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getCurrentUser,
  getFacultyOptions,
  updateSkills
};
