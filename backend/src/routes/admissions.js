const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const Admission = require('../models/Admission');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { name, phone, email, program, message } = req.body;
    if (!name || !phone || !program) {
      return res.status(400).json({ message: 'Name, phone, and program are required' });
    }
    const admission = await Admission.create({ name, phone, email, program, message });
    res.status(201).json({ message: 'Admission request submitted successfully', admission });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const admissions = await Admission.find().sort({ createdAt: -1 });
    res.json(admissions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { status } = req.body;
    const admission = await Admission.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!admission) return res.status(404).json({ message: 'Admission not found' });
    res.json(admission);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
