const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const Attendance = require('../models/Attendance');
const Student = require('../models/Student');

const router = express.Router();

async function refreshStudentAttendancePercent(studentId) {
  const records = await Attendance.find({ student: studentId });
  if (!records.length) return;
  const presentCount = records.filter((record) => record.status === 'present' || record.status === 'late').length;
  const percent = Math.round((presentCount / records.length) * 100);
  await Student.findByIdAndUpdate(studentId, { attendancePercent: percent });
}

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
    await refreshStudentAttendancePercent(student);
    res.status(201).json(record);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/bulk', authenticate, authorize('admin', 'teacher'), async (req, res) => {
  try {
    const { records } = req.body;
    const results = [];
    const studentIds = new Set();
    for (const item of records) {
      const record = await Attendance.findOneAndUpdate(
        { student: item.student, date: new Date(item.date), subject: item.subject || '' },
        { status: item.status, markedBy: req.user._id },
        { upsert: true, new: true }
      );
      results.push(record);
      studentIds.add(String(item.student));
    }
    await Promise.all([...studentIds].map((studentId) => refreshStudentAttendancePercent(studentId)));
    res.status(201).json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
