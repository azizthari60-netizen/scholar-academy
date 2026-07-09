const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    subject: { type: String, required: true },
    examType: { type: String, enum: ['Weekly Test', 'Midterm', 'Final', 'Mock'], default: 'Weekly Test' },
    term: { type: String, default: '2025-26' },
    score: { type: Number, required: true, min: 0, max: 100 },
    totalMarks: { type: Number, default: 100 },
    remarks: { type: String, default: '' },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Result', resultSchema);
