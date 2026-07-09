const mongoose = require('mongoose');

const FeeSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    amount: { type: Number, required: true, min: 0 },
    description: { type: String, default: '' },
    dueDate: { type: Date },
    month: { type: String, default: '' },
    notes: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'paid', 'overdue'], default: 'pending' },
    paidAmount: { type: Number, default: 0 },
    paidAt: { type: Date },
    paidDate: { type: Date },
    receiptNumber: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Fee', FeeSchema);
