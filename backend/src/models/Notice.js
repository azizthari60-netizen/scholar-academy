const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    targetRole: { type: String, enum: ['all', 'student', 'teacher', 'admin'], default: 'all' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isPinned: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notice', noticeSchema);
