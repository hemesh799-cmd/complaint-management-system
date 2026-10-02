const express = require('express');
const cors = require('cors');
require('dotenv').config();

const db = require('./db/db');
const errorHandler = require('./middleware/errorHandler');

const complaintRoutes = require('./routes/complaintRoutes');
const userRoutes = require('./routes/userRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const statusRoutes = require('./routes/statusRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS & JSON Request Parsing
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// Root Health Check Route
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    system: 'Online Complaint Management System API',
    database: 'PostgreSQL',
    version: '1.0.0'
  });
});

// API Routes
app.use('/api/complaints', complaintRoutes);
app.use('/api/users', userRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/statuses', statusRoutes);
app.use('/api/dashboard', dashboardRoutes);

// 404 Route Handler
app.use((req, res, next) => {
  res.status(404).json({ error: true, message: `Route ${req.method} ${req.originalUrl} not found.` });
});

// Global Error Handler
app.use(errorHandler);

// Start Server
app.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(`🚀 Complaint Management API Server running on port ${PORT}`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
  console.log(`===================================================`);
});
