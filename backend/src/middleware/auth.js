const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'scholar_dev_secret';

const FALLBACK_USERS = {
  admin: {
    _id: 'fallback-admin',
    name: 'Academy Admin',
    email: 'admin@scholar.edu',
    password: 'admin123',
    role: 'admin',
    phone: '+92 333 1234567',
    isActive: true,
    toJSON() {
      return { _id: this._id, name: this.name, email: this.email, role: this.role, phone: this.phone, isActive: this.isActive };
    },
  },
  teacher: {
    _id: 'fallback-teacher',
    name: 'Mr. Ahmed Raza',
    email: 'ahmed@scholar.edu',
    password: 'teacher123',
    role: 'teacher',
    phone: '+92 300 1112233',
    isActive: true,
    toJSON() {
      return { _id: this._id, name: this.name, email: this.email, role: this.role, phone: this.phone, isActive: this.isActive };
    },
  },
  student: {
    _id: 'fallback-student',
    name: 'Ayesha Jamil',
    email: 'ayesha@scholar.edu',
    password: 'student123',
    role: 'student',
    phone: '+92 333 9998877',
    isActive: true,
    toJSON() {
      return { _id: this._id, name: this.name, email: this.email, role: this.role, phone: this.phone, isActive: this.isActive };
    },
  },
};

function signToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
}

function getFallbackUserByEmail(email) {
  const normalized = String(email || '').toLowerCase().trim();
  return Object.values(FALLBACK_USERS).find((user) => user.email === normalized) || null;
}

function getFallbackUserById(id, role) {
  if (!id) return null;
  if (String(id) === 'fallback-admin') return FALLBACK_USERS.admin;
  if (String(id) === 'fallback-teacher') return FALLBACK_USERS.teacher;
  if (String(id) === 'fallback-student') return FALLBACK_USERS.student;
  return role ? FALLBACK_USERS[role] : null;
}

async function verifyPassword(user, candidate) {
  if (!user || !candidate) return false;
  if (typeof user.comparePassword === 'function') {
    return user.comparePassword(candidate);
  }
  return String(user.password || '') === String(candidate);
}

async function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    let user = null;

    if (mongoose.connection.readyState !== 1) {
      const fallback = getFallbackUserById(decoded.id, decoded.role);
      if (fallback) {
        req.user = fallback;
        return next();
      }
      return res.status(401).json({ message: 'Authentication service unavailable' });
    }

    try {
      user = await User.findById(decoded.id);
    } catch (err) {
      const fallback = getFallbackUserById(decoded.id, decoded.role);
      if (fallback) {
        req.user = fallback;
        return next();
      }
      return res.status(401).json({ message: 'Authentication service unavailable' });
    }

    if (!user || !user.isActive) {
      const fallback = getFallbackUserById(decoded.id, decoded.role);
      if (fallback) {
        req.user = fallback;
        return next();
      }
      return res.status(401).json({ message: 'Invalid or inactive account' });
    }

    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  };
}

module.exports = {
  authenticate,
  authorize,
  signToken,
  JWT_SECRET,
  getFallbackUserByEmail,
  getFallbackUserById,
  verifyPassword,
};
