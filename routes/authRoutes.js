/**
 * Purpose: Registers authentication and profile-related routes for students.
 */

const express = require('express');

const {
  register,
  login,
  getCurrentUser,
  getFacultyOptions,
  updateSkills
} = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authMiddleware, getCurrentUser);
router.get('/faculty', authMiddleware, getFacultyOptions);
router.put('/skills', authMiddleware, updateSkills);

module.exports = router;
