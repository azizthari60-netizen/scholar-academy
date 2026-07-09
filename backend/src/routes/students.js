const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const Student = require('../models/Student');
const User = require('../models/User');

const router = express.Router();

router.get('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const students = await Student.find().populate('user', '-password').sort({ createdAt: -1 });
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      rollNumber,
      program,
      batch,
      section,
      guardianName,
      guardianPhone,
    } = req.body;

    if (!name || !email || !rollNumber || !program) {
      return res.status(400).json({ message: 'Name, email, roll number, and program are required' });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) return res.status(409).json({ message: 'Email already registered' });

    const user = await User.create({
      name,
      email,
      password: password || 'student123',
      phone,
      role: 'student',
    });

    const student = await Student.create({
      user: user._id,
      name,
      email,
      phone,
      program,
      rollNumber,
      batch,
      section,
      guardianName,
      guardianPhone,
      attendancePercent: 0,
    });

    const populated = await Student.findById(student._id).populate('user', '-password');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate('user', '-password');
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const {
      name,
      email,
      password,
      phone,
      rollNumber,
      program,
      batch,
      section,
      guardianName,
      guardianPhone,
      attendancePercent,
      isActive,
    } = req.body;

    if (name || email || phone || password !== undefined || isActive !== undefined) {
      const userUpdates = {};
      if (name) userUpdates.name = name;
      if (email) userUpdates.email = email.toLowerCase().trim();
      if (phone !== undefined) userUpdates.phone = phone;
      if (isActive !== undefined) userUpdates.isActive = isActive;
      if (password) userUpdates.password = password;
      await User.findByIdAndUpdate(student.user, userUpdates, { new: true, runValidators: true });
    }

    Object.assign(student, {
      ...(name && { name }),
      ...(email && { email: email.toLowerCase().trim() }),
      ...(phone !== undefined && { phone }),
      ...(rollNumber && { rollNumber }),
      ...(program && { program }),
      ...(batch !== undefined && { batch }),
      ...(section !== undefined && { section }),
      ...(guardianName !== undefined && { guardianName }),
      ...(guardianPhone !== undefined && { guardianPhone }),
      ...(attendancePercent !== undefined && { attendancePercent }),
    });
    await student.save();

    const populated = await Student.findById(student._id).populate('user', '-password');
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    await User.findByIdAndDelete(student.user);
    await Student.findByIdAndDelete(student._id);
    res.json({ message: 'Student deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
