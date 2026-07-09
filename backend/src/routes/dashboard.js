const express = require('express');
const mongoose = require('mongoose');
const { authenticate, authorize } = require('../middleware/auth');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Fee = require('../models/Fee');
const Result = require('../models/Result');
const Assignment = require('../models/Assignment');
const Attendance = require('../models/Attendance');
const Admission = require('../models/Admission');
const Notice = require('../models/Notice');
const Timetable = require('../models/Timetable');

const router = express.Router();

router.get('/admin', authenticate, authorize('admin'), async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({
        stats: {
          totalStudents: 4,
          activeTeachers: 2,
          attendanceRate: 92,
          pendingFees: 2,
          pendingAdmissions: 2,
        },
        recentAdmissions: [
          { name: 'Zainab Khan', program: 'Pre-Medical', status: 'pending' },
        ],
        recentResults: [],
      });
    }

    const [students, teachers, pendingFees, admissions, recentResults] = await Promise.all([
      Student.countDocuments(),
      Teacher.countDocuments(),
      Fee.countDocuments({ status: { $in: ['pending', 'overdue'] } }),
      Admission.countDocuments({ status: 'pending' }),
      Result.find().sort({ createdAt: -1 }).limit(5).populate({ path: 'student', populate: { path: 'user', select: 'name' } }),
    ]);

    const allStudents = await Student.find();
    const avgAttendance = allStudents.length
      ? Math.round(allStudents.reduce((sum, s) => sum + s.attendancePercent, 0) / allStudents.length)
      : 0;

    const recentAdmissions = await Admission.find().sort({ createdAt: -1 }).limit(5);

    res.json({
      stats: {
        totalStudents: students,
        activeTeachers: teachers,
        attendanceRate: avgAttendance,
        pendingFees,
        pendingAdmissions: admissions,
      },
      recentAdmissions,
      recentResults,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/student', authenticate, authorize('student'), async (req, res) => {
  try {
    const profile = await Student.findOne({ user: req.user._id }).populate('user', '-password');
    if (!profile) return res.status(404).json({ message: 'Student profile not found' });

    const [results, assignments, fees, timetable, notices] = await Promise.all([
      Result.find({ student: profile._id }).sort({ createdAt: -1 }),
      Assignment.find({ program: profile.program, status: 'active' }).sort({ dueDate: 1 }).limit(5),
      Fee.find({ student: profile._id }).sort({ dueDate: -1 }).limit(3),
      Timetable.find({ program: profile.program, section: profile.section }).sort({ day: 1, startTime: 1 }),
      Notice.find({ $or: [{ targetRole: 'all' }, { targetRole: 'student' }] }).sort({ isPinned: -1, createdAt: -1 }).limit(5),
    ]);

    const avgScore = results.length
      ? Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length)
      : 0;

    const pendingAssignments = assignments.filter((a) => new Date(a.dueDate) >= new Date()).length;

    res.json({
      profile,
      stats: {
        attendance: profile.attendancePercent,
        assignments: assignments.length,
        pendingAssignments,
        avgScore,
      },
      results,
      assignments,
      fees,
      timetable,
      notices,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/teacher', authenticate, authorize('teacher'), async (req, res) => {
  try {
    const profile = await Teacher.findOne({ user: req.user._id }).populate('user', '-password');
    if (!profile) return res.status(404).json({ message: 'Teacher profile not found' });

    const [assignments, results, students, timetable] = await Promise.all([
      Assignment.find({ teacher: profile._id }).sort({ dueDate: 1 }),
      Result.find().populate({ path: 'student', populate: { path: 'user', select: 'name' } }).sort({ createdAt: -1 }).limit(10),
      Student.find({ program: { $in: profile.assignedPrograms.length ? profile.assignedPrograms : ['Pre-Medical', 'Pre-Engineering', 'Computer Science'] } }).populate('user', 'name'),
      Timetable.find({ teacher: profile._id }).sort({ day: 1, startTime: 1 }),
    ]);

    res.json({
      profile,
      stats: {
        classes: timetable.length,
        assignments: assignments.length,
        pendingReviews: assignments.filter((a) => new Date(a.dueDate) >= new Date()).length,
        students: students.length,
      },
      assignments,
      results,
      students,
      timetable,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
