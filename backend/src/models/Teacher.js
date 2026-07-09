const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    subject: { type: String, required: true, trim: true },
    qualification: { type: String, default: '' },
    experience: { type: String, default: '' },
    assignedPrograms: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Teacher', teacherSchema);
