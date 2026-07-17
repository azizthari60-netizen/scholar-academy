const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const Result = require('../models/Result');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const filter = {};
    if (req.user.role === 'student') {
      const profile = await Student.findOne({ user: req.user._id });
      if (profile) filter.student = profile._id;
    } else if (req.user.role === 'teacher') {
      const profile = await Teacher.findOne({ user: req.user._id });
      if (profile) {
        const students = await Student.find({
          program: { $in: profile.assignedPrograms.length ? profile.assignedPrograms : ['Pre-Medical', 'Pre-Engineering', 'Computer Science'] },
        }).select('_id');
        filter.student = { $in: students.map((student) => student._id) };
      }
    } else if (req.query.student) {
      filter.student = req.query.student;
    }
    const results = await Result.find(filter)
      .populate({ path: 'student', populate: { path: 'user', select: 'name email' } })
      .sort({ createdAt: -1 });
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', authenticate, authorize('admin', 'teacher'), async (req, res) => {
  try {
    const result = await Result.create({ ...req.body, uploadedBy: req.user._id });
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', authenticate, authorize('admin', 'teacher'), async (req, res) => {
  try {
    const result = await Result.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!result) return res.status(404).json({ message: 'Result not found' });
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', authenticate, authorize('admin', 'teacher'), async (req, res) => {
  try {
    await Result.findByIdAndDelete(req.params.id);
    res.json({ message: 'Result deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
