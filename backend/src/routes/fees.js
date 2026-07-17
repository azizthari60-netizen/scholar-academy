const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const Fee = require('../models/Fee');
const Student = require('../models/Student');

const router = express.Router();

// list fees (optional ?student=ID)
router.get('/', authenticate, async (req, res) => {
  try {
    const filter = {};
    if (req.user.role === 'student') {
      const profile = await Student.findOne({ user: req.user._id });
      if (!profile) return res.json([]);
      filter.student = profile._id;
    } else if (req.query.student) {
      filter.student = req.query.student;
    } else if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    const fees = await Fee.find(filter)
      .populate({ path: 'student', populate: { path: 'user', select: 'name' } })
      .sort({ createdAt: -1 });
    res.json(fees);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { studentId, student, amount, description, dueDate, month, notes } = req.body;
    const targetStudentId = studentId || student;
    const studentRecord = await Student.findById(targetStudentId);
    if (!studentRecord) return res.status(404).json({ message: 'Student not found' });
    if (!amount || Number(amount) <= 0) return res.status(400).json({ message: 'Amount must be greater than zero' });

    const fee = await Fee.create({
      student: studentRecord._id,
      amount: Number(amount),
      description: description || '',
      dueDate: dueDate ? new Date(dueDate) : undefined,
      month: month || '',
      notes: notes || '',
      status: 'pending',
      paidAmount: 0,
      receiptNumber: `R-${Date.now()}`,
    });

    const populated = await Fee.findById(fee._id).populate({ path: 'student', populate: { path: 'user', select: 'name' } });
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch('/:id/pay', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { paidAmount } = req.body;
    const fee = await Fee.findById(req.params.id);
    if (!fee) return res.status(404).json({ message: 'Fee not found' });
    fee.status = 'paid';
    fee.paidDate = new Date();
    fee.paidAt = new Date();
    fee.paidAmount = Number(paidAmount) || fee.amount;
    await fee.save();
    const updated = await Fee.findById(fee._id).populate({ path: 'student', populate: { path: 'user', select: 'name' } });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id/receipt', async (req, res) => {
  try {
    const fee = await Fee.findById(req.params.id).populate({
      path: 'student',
      populate: { path: 'user', select: 'name phone email' },
    });
    if (!fee) return res.status(404).send('Fee not found');

    const studentName = fee.student?.user?.name || fee.student?.name || 'Student';
    const studentPhone = fee.student?.user?.phone || fee.student?.phone || '';
    const studentEmail = fee.student?.user?.email || fee.student?.email || '';
    const paidStatus = fee.status === 'paid' ? 'Paid' : 'Pending';
    const html = `<!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Receipt ${fee.receiptNumber}</title>
        <style>
          body{font-family: Arial, Helvetica, sans-serif; padding:20px}
          .receipt{max-width:650px;margin:0 auto;border:1px solid #ddd;padding:18px}
          h1{margin:0 0 8px}
          table{width:100%;border-collapse:collapse;margin-top:10px}
          td,th{padding:8px;border-bottom:1px solid #eee;text-align:left}
        </style>
      </head>
      <body>
        <div class="receipt">
          <h1>The Scholar Coaching Academy</h1>
          <div>Receipt: <strong>${fee.receiptNumber}</strong></div>
          <div>Date: <strong>${(fee.createdAt||new Date()).toLocaleString()}</strong></div>
          <hr />
          <h3>Student</h3>
          <div><strong>${studentName}</strong></div>
          <div>${studentPhone} ${studentEmail}</div>

          <h3>Payment</h3>
          <table>
            <tr><th>Description</th><td>${fee.description || 'Tuition fee'}</td></tr>
            <tr><th>Amount</th><td>${fee.amount.toFixed(2)}</td></tr>
            <tr><th>Status</th><td>${paidStatus}</td></tr>
            <tr><th>Paid Amount</th><td>${(fee.paidAmount||0).toFixed(2)}</td></tr>
            <tr><th>Paid At</th><td>${fee.paidDate?fee.paidDate.toLocaleString():''}</td></tr>
          </table>

          <div style="margin-top:18px">Thank you for your payment.</div>
          <div style="margin-top:22px;text-align:right"><button onclick="window.print()">Print</button></div>
        </div>
      </body>
    </html>`;

    res.send(html);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;
