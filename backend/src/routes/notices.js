const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const Notice = require('../models/Notice');

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const role = req.user.role;
    const filter = role === 'admin' ? {} : { $or: [{ targetRole: 'all' }, { targetRole: role }] };
    const notices = await Notice.find(filter).populate('createdBy', 'name role').sort({ isPinned: -1, createdAt: -1 });
    res.json(notices);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', authenticate, authorize('admin', 'teacher'), async (req, res) => {
  try {
    const { title, content, targetRole, isPinned } = req.body;
    if (!title || !content) return res.status(400).json({ message: 'Title and content are required' });
    const notice = await Notice.create({ title, content, targetRole, isPinned, createdBy: req.user._id });
    res.status(201).json(notice);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', authenticate, authorize('admin', 'teacher'), async (req, res) => {
  try {
    const notice = await Notice.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!notice) return res.status(404).json({ message: 'Notice not found' });
    res.json(notice);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    await Notice.findByIdAndDelete(req.params.id);
    res.json({ message: 'Notice deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
