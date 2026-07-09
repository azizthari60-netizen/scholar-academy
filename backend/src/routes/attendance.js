const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const Attendance = require('../models/Attendance');
const Student = require('../models/Student');

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const filter = {};
    if (req.query.date) {
      const day = new Date(req.query.date);
      const next = new Date(day);
      next.setDate(next.getDate() + 1);
      filter.date = { $gte: day, $lt: next };
    }
    if (req.user.role === 'student') {
      const profile = await Student.findOne({ user: req.user._id });
      if (profile) filter.student = profile._id;
    } else if (req.query.student) {
      filter.student = req.query.student;
    }
    const records = await Attendance.find(filter)
      .populate({ path: 'student', populate: { path: 'user', select: 'name' } })
      .sort({ date: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', authenticate, authorize('admin', 'teacher'), async (req, res) => {
  try {
    const { student, date, status, subject } = req.body;
    const record = await Attendance.findOneAndUpdate(
      { student, date: new Date(date), subject: subject || '' },
      { status, markedBy: req.user._id },
      { upsert: true, new: true }
    );
    res.status(201).json(record);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/bulk', authenticate, authorize('admin', 'teacher'), async (req, res) => {
  try {
    const { records } = req.body;
    const results = [];
    for (const item of records) {
      const record = await Attendance.findOneAndUpdate(
        { student: item.student, date: new Date(item.date), subject: item.subject || '' },
        { status: item.status, markedBy: req.user._id },
        { upsert: true, new: true }
      );
      results.push(record);
    }
    res.status(201).json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
