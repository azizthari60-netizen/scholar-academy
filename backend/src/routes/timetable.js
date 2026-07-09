const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const Timetable = require('../models/Timetable');

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const filter = {};
    if (req.query.program) filter.program = req.query.program;
    if (req.query.section) filter.section = req.query.section;
    const entries = await Timetable.find(filter).populate({ path: 'teacher', populate: { path: 'user', select: 'name' } }).sort({ day: 1, startTime: 1 });
    res.json(entries);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const entry = await Timetable.create(req.body);
    res.status(201).json(entry);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const entry = await Timetable.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!entry) return res.status(404).json({ message: 'Timetable entry not found' });
    res.json(entry);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    await Timetable.findByIdAndDelete(req.params.id);
    res.json({ message: 'Timetable entry deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
