const express = require('express');
const mongoose = require('mongoose');
const { authenticate, signToken, getFallbackUserByEmail, verifyPassword } = require('../middleware/auth');
const User = require('../models/User');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    let user = null;
    let fallbackUser = null;

    if (mongoose.connection.readyState !== 1) {
      fallbackUser = getFallbackUserByEmail(normalizedEmail);
      user = fallbackUser;
    } else {
      try {
        user = await User.findOne({ email: normalizedEmail });
      } catch (err) {
        fallbackUser = getFallbackUserByEmail(normalizedEmail);
        user = fallbackUser;
      }
    }

    if (!user) {
      fallbackUser = getFallbackUserByEmail(normalizedEmail);
      user = fallbackUser;
    }

    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const valid = await verifyPassword(user, password);
    if (!valid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (role && user.role !== role) {
      return res.status(403).json({ message: `This account is registered as ${user.role}, not ${role}` });
    }

    let profile = null;
    if (mongoose.connection.readyState === 1 && user.role === 'student') {
      profile = await Student.findOne({ user: user._id }).populate('user', '-password');
    } else if (mongoose.connection.readyState === 1 && user.role === 'teacher') {
      profile = await Teacher.findOne({ user: user._id }).populate('user', '-password');
    }

    const token = signToken(user);
    res.json({
      token,
      user: user.toJSON ? user.toJSON() : { ...user, password: undefined },
      profile,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/me', authenticate, async (req, res) => {
  try {
    let profile = null;
    if (req.user.role === 'student') {
      profile = await Student.findOne({ user: req.user._id }).populate('user', '-password');
    } else if (req.user.role === 'teacher') {
      profile = await Teacher.findOne({ user: req.user._id }).populate('user', '-password');
    }
    res.json({ user: req.user.toJSON ? req.user.toJSON() : req.user, profile });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
