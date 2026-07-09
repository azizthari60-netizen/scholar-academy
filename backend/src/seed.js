require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Student = require('./models/Student');
const Teacher = require('./models/Teacher');
const Notice = require('./models/Notice');
const Timetable = require('./models/Timetable');
const Assignment = require('./models/Assignment');
const Result = require('./models/Result');
const Fee = require('./models/Fee');
const Attendance = require('./models/Attendance');
const Admission = require('./models/Admission');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/scholar_db');
  console.log('Connected to MongoDB for seeding...');

  await Promise.all([
    User.deleteMany({}),
    Student.deleteMany({}),
    Teacher.deleteMany({}),
    Notice.deleteMany({}),
    Timetable.deleteMany({}),
    Assignment.deleteMany({}),
    Result.deleteMany({}),
    Fee.deleteMany({}),
    Attendance.deleteMany({}),
    Admission.deleteMany({}),
  ]);

  const admin = await User.create({
    name: 'Academy Admin',
    email: 'admin@scholar.edu',
    password: 'admin123',
    role: 'admin',
    phone: '+92 333 1234567',
  });

  const teacherUser1 = await User.create({
    name: 'Mr. Ahmed Raza',
    email: 'ahmed@scholar.edu',
    password: 'teacher123',
    role: 'teacher',
    phone: '+92 300 1112233',
  });

  const teacherUser2 = await User.create({
    name: 'Ms. Saira Khan',
    email: 'saira@scholar.edu',
    password: 'teacher123',
    role: 'teacher',
    phone: '+92 301 2223344',
  });

  const teacher1 = await Teacher.create({
    user: teacherUser1._id,
    subject: 'Physics',
    qualification: 'M.Sc Physics',
    experience: '8 years',
    assignedPrograms: ['Pre-Medical', 'Pre-Engineering'],
  });

  const teacher2 = await Teacher.create({
    user: teacherUser2._id,
    subject: 'Biology',
    qualification: 'M.Sc Biology',
    experience: '6 years',
    assignedPrograms: ['Pre-Medical'],
  });

  const studentUsers = [];
  for (const s of [
    { name: 'Ayesha Jamil', email: 'ayesha@scholar.edu', password: 'student123', role: 'student', phone: '+92 333 9998877' },
    { name: 'Hassan Ali', email: 'hassan@scholar.edu', password: 'student123', role: 'student', phone: '+92 334 8887766' },
    { name: 'Fariha Siddiqui', email: 'fariha@scholar.edu', password: 'student123', role: 'student', phone: '+92 335 7776655' },
    { name: 'Bilal Ahmed', email: 'bilal@scholar.edu', password: 'student123', role: 'student', phone: '+92 336 6665544' },
  ]) {
    studentUsers.push(await User.create(s));
  }

  const students = await Student.insertMany([
    { user: studentUsers[0]._id, rollNumber: 'SC-2025-001', program: 'Pre-Medical', batch: '2025-26', section: 'A', guardianName: 'Mr. Jamil', guardianPhone: '+92 333 1110000', attendancePercent: 96 },
    { user: studentUsers[1]._id, rollNumber: 'SC-2025-002', program: 'Pre-Engineering', batch: '2025-26', section: 'A', guardianName: 'Mr. Ali', guardianPhone: '+92 333 2220000', attendancePercent: 91 },
    { user: studentUsers[2]._id, rollNumber: 'SC-2025-003', program: 'Pre-Medical', batch: '2025-26', section: 'A', guardianName: 'Mr. Siddiqui', guardianPhone: '+92 333 3330000', attendancePercent: 88 },
    { user: studentUsers[3]._id, rollNumber: 'SC-2025-004', program: 'Computer Science', batch: '2025-26', section: 'A', guardianName: 'Mr. Ahmed', guardianPhone: '+92 333 4440000', attendancePercent: 94 },
  ]);

  await Notice.insertMany([
    { title: 'Midterm Exam Schedule', content: 'Midterm exams begin from 15th of this month. All students must bring their admit cards.', targetRole: 'student', createdBy: admin._id, isPinned: true },
    { title: 'Staff Meeting', content: 'Monthly staff meeting on Friday at 4:00 PM in the main office.', targetRole: 'teacher', createdBy: admin._id },
    { title: 'Fee Reminder', content: 'Please clear pending fees before the 10th to avoid late charges.', targetRole: 'all', createdBy: admin._id },
  ]);

  await Timetable.insertMany([
    { day: 'Monday', startTime: '09:00', endTime: '10:00', subject: 'Physics', teacher: teacher1._id, classroom: 'Room 3', program: 'Pre-Medical', section: 'A' },
    { day: 'Monday', startTime: '10:30', endTime: '11:30', subject: 'Biology', teacher: teacher2._id, classroom: 'Room 2', program: 'Pre-Medical', section: 'A' },
    { day: 'Tuesday', startTime: '09:00', endTime: '10:00', subject: 'Mathematics', classroom: 'Room 1', program: 'Pre-Engineering', section: 'A' },
    { day: 'Wednesday', startTime: '11:00', endTime: '12:00', subject: 'Physics', teacher: teacher1._id, classroom: 'Room 3', program: 'Pre-Engineering', section: 'A' },
  ]);

  await Assignment.insertMany([
    { title: 'Physics Chapter 5 Problems', subject: 'Physics', description: 'Solve all numerical problems from chapter 5.', dueDate: new Date(Date.now() + 5 * 86400000), program: 'Pre-Medical', teacher: teacher1._id },
    { title: 'Biology Diagram Assignment', subject: 'Biology', description: 'Draw and label the human digestive system.', dueDate: new Date(Date.now() + 3 * 86400000), program: 'Pre-Medical', teacher: teacher2._id },
    { title: 'Math Integration Practice', subject: 'Mathematics', description: 'Complete exercise 3.2 from textbook.', dueDate: new Date(Date.now() + 7 * 86400000), program: 'Pre-Engineering' },
  ]);

  await Result.insertMany([
    { student: students[0]._id, subject: 'Physics', examType: 'Weekly Test', score: 90, uploadedBy: teacherUser1._id },
    { student: students[0]._id, subject: 'Biology', examType: 'Weekly Test', score: 88, uploadedBy: teacherUser2._id },
    { student: students[0]._id, subject: 'Chemistry', examType: 'Midterm', score: 84, uploadedBy: admin._id },
    { student: students[1]._id, subject: 'Physics', examType: 'Weekly Test', score: 91, uploadedBy: teacherUser1._id },
    { student: students[1]._id, subject: 'Mathematics', examType: 'Weekly Test', score: 86, uploadedBy: admin._id },
    { student: students[2]._id, subject: 'Biology', examType: 'Weekly Test', score: 74, uploadedBy: teacherUser2._id },
  ]);

  await Fee.insertMany([
    { student: students[0]._id, amount: 5000, dueDate: new Date(Date.now() + 10 * 86400000), status: 'paid', paidDate: new Date(), month: 'July 2026' },
    { student: students[1]._id, amount: 5000, dueDate: new Date(Date.now() + 5 * 86400000), status: 'pending', month: 'July 2026' },
    { student: students[2]._id, amount: 5000, dueDate: new Date(Date.now() - 2 * 86400000), status: 'overdue', month: 'June 2026' },
    { student: students[3]._id, amount: 5000, dueDate: new Date(Date.now() + 15 * 86400000), status: 'pending', month: 'July 2026' },
  ]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  await Attendance.insertMany([
    { student: students[0]._id, date: today, status: 'present', subject: 'Physics', markedBy: teacherUser1._id },
    { student: students[1]._id, date: today, status: 'present', subject: 'Physics', markedBy: teacherUser1._id },
    { student: students[2]._id, date: today, status: 'late', subject: 'Biology', markedBy: teacherUser2._id },
    { student: students[3]._id, date: today, status: 'absent', subject: 'Physics', markedBy: teacherUser1._id },
  ]);

  await Admission.insertMany([
    { name: 'Zainab Khan', phone: '+92 300 5556677', email: 'zainab@email.com', program: 'Pre-Medical', message: 'Interested in admission for 2025-26 batch.', status: 'pending' },
    { name: 'Usman Malik', phone: '+92 301 6667788', program: 'Pre-Engineering', status: 'pending' },
  ]);

  console.log('\n✅ Database seeded successfully!\n');
  console.log('Login credentials:');
  console.log('  Admin:   admin@scholar.edu / admin123');
  console.log('  Teacher: ahmed@scholar.edu / teacher123');
  console.log('  Student: ayesha@scholar.edu / student123\n');

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
