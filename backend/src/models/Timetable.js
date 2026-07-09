const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema(
  {
    day: { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    subject: { type: String, required: true },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
    classroom: { type: String, default: '' },
    program: { type: String, required: true },
    section: { type: String, default: 'A' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Timetable', timetableSchema);
