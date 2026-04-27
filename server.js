/**
 * Purpose: Application entry point that loads environment variables, connects
 * to MongoDB, registers middleware/routes, and serves the frontend.
 */

const path = require('path');
const express = require('express');
const dotenv = require('dotenv');

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const facultyRoutes = require('./routes/facultyRoutes');
const projectRoutes = require('./routes/projectRoutes');

dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT ||3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'frontend')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/frontend', express.static(path.join(__dirname, 'frontend')));


app.use('/api/auth', authRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/projects', projectRoutes);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

app.get('/faculty', (req, res) => {
  res.redirect('/');
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'dashboard.html'));
});

app.get('/add-project', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'add-project.html'));
});

app.get('/projects', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'projects.html'));
});

app.get('/certificates', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'certificates.html'));
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Server error'
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
