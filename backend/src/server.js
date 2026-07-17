require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dns = require('dns');
const path = require('path');
const connectDB = require('./db');
const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/students');
const teacherRoutes = require('./routes/teachers');
const admissionRoutes = require('./routes/admissions');
const noticeRoutes = require('./routes/notices');
const timetableRoutes = require('./routes/timetable');
const assignmentRoutes = require('./routes/assignments');
const resultRoutes = require('./routes/results');
const feeRoutes = require('./routes/fees');
const attendanceRoutes = require('./routes/attendance');
const dashboardRoutes = require('./routes/dashboard');

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_DIR = path.join(__dirname, '../../frontend');

const startServer = () => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Scholar Coaching Academy API is running' });
});

app.use('/api', async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('Database connection error:', err.message);
    res.status(503).json({ message: 'Database unavailable. Please try again shortly.' });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/admissions', admissionRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/fees', feeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use(express.static(FRONTEND_DIR));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  const filePath = path.join(FRONTEND_DIR, req.path);
  if (req.path.endsWith('.html') || !path.extname(req.path)) {
    const resolved = req.path.endsWith('.html') ? filePath : path.join(FRONTEND_DIR, 'index.html');
    return res.sendFile(resolved, (err) => {
      if (err) res.sendFile(path.join(FRONTEND_DIR, 'index.html'));
    });
  }
  next();
});

dns.setServers(['8.8.8.8', '8.8.4.4']);

if (require.main === module) {
  connectDB()
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.error('MongoDB connection error:', err));
  startServer();
}

module.exports = app;
