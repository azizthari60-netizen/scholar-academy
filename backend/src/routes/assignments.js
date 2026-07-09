const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const Assignment = require('../models/Assignment');
const Student = require('../models/Student');

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const filter = {};
    if (req.query.program) filter.program = req.query.program;
    if (req.user.role === 'student') {
      const profile = await Student.findOne({ user: req.user._id });
      if (profile) filter.program = profile.program;
    }
    const assignments = await Assignment.find(filter)
      .populate({ path: 'teacher', populate: { path: 'user', select: 'name' } })
      .sort({ dueDate: 1 });
    res.json(assignments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', authenticate, authorize('admin', 'teacher'), async (req, res) => {
  try {
    const assignment = await Assignment.create({ ...req.body, teacher: req.body.teacher || undefined });
    res.status(201).json(assignment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', authenticate, authorize('admin', 'teacher'), async (req, res) => {
  try {
    const assignment = await Assignment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });
    res.json(assignment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', authenticate, authorize('admin', 'teacher'), async (req, res) => {
  try {
    await Assignment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Assignment deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
