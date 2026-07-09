const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const Teacher = require('../models/Teacher');
const User = require('../models/User');

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const teachers = await Teacher.find().populate('user', '-password').sort({ createdAt: -1 });
    res.json(teachers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { name, email, password, phone, subject, qualification, experience, assignedPrograms } = req.body;
    if (!name || !email || !password || !subject) {
      return res.status(400).json({ message: 'Name, email, password, and subject are required' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ message: 'Email already registered' });

    const user = await User.create({ name, email, password, phone, role: 'teacher' });
    const teacher = await Teacher.create({ user: user._id, subject, qualification, experience, assignedPrograms });

    const populated = await Teacher.findById(teacher._id).populate('user', '-password');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });

    const { name, phone, subject, qualification, experience, assignedPrograms, isActive } = req.body;

    if (name || phone !== undefined || isActive !== undefined) {
      await User.findByIdAndUpdate(teacher.user, {
        ...(name && { name }),
        ...(phone !== undefined && { phone }),
        ...(isActive !== undefined && { isActive }),
      });
    }

    Object.assign(teacher, {
      ...(subject && { subject }),
      ...(qualification !== undefined && { qualification }),
      ...(experience !== undefined && { experience }),
      ...(assignedPrograms && { assignedPrograms }),
    });
    await teacher.save();

    const populated = await Teacher.findById(teacher._id).populate('user', '-password');
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });
    await User.findByIdAndDelete(teacher.user);
    await Teacher.findByIdAndDelete(teacher._id);
    res.json({ message: 'Teacher deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
