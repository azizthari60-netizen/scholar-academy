const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    subject: { type: String, required: true },
    description: { type: String, default: '' },
    dueDate: { type: Date, required: true },
    program: { type: String, required: true },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
    status: { type: String, enum: ['active', 'closed'], default: 'active' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Assignment', assignmentSchema);
