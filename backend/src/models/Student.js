const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, default: '' },
    program: { type: String, enum: ['Pre-Medical', 'Pre-Engineering', 'Computer Science', 'General'], default: 'General' },
    rollNumber: { type: String, trim: true },
    batch: { type: String, default: '' },
    section: { type: String, default: '' },
    guardianName: { type: String, default: '' },
    guardianPhone: { type: String, default: '' },
    attendancePercent: { type: Number, default: 0, min: 0, max: 100 },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Student', StudentSchema);
