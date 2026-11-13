const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_SECRET } = require('../middleware/authMiddleware');

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      name: user.name,
      email: user.collegeEmail,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// @desc    Register a new student
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, collegeEmail, studentId, password, phoneNumber, department, contactPreference } = req.body;

    if (!name || !collegeEmail || !studentId || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide full name, college email, student ID, and password.',
      });
    }

    // Email format validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(collegeEmail.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid college email address.',
      });
    }

    // Password strength check (min 6 characters, includes letter and number)
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    // Check if email already registered
    const existingEmail = await User.findOne({ collegeEmail: collegeEmail.toLowerCase().trim() });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: 'A student account with this college email already exists.',
      });
    }

    // Check if student ID already registered
    const existingStudentId = await User.findOne({ studentId: studentId.toUpperCase().trim() });
    if (existingStudentId) {
      return res.status(400).json({
        success: false,
        message: 'A student account with this Student ID already exists.',
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create student account (Role is strictly 'student' for public registration)
    const newUser = await User.create({
      name: name.trim(),
      collegeEmail: collegeEmail.toLowerCase().trim(),
      studentId: studentId.toUpperCase().trim(),
      passwordHash,
      role: 'student',
      phoneNumber: phoneNumber ? phoneNumber.trim() : '',
      department: department ? department.trim() : 'General Studies',
      contactPreference: contactPreference || 'IN_APP',
    });

    const token = generateToken(newUser);

    res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      token,
      user: newUser.toSafeJSON(),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { loginIdentifier, password } = req.body;

    if (!loginIdentifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please enter your college email or Student ID, and your password.',
      });
    }

    const cleanIdentifier = loginIdentifier.trim();

    // Allow login by email or student ID
    const user = await User.findOne({
      $or: [
        { collegeEmail: cleanIdentifier.toLowerCase() },
        { studentId: cleanIdentifier.toUpperCase() },
      ],
    }).select('+passwordHash');

    // Generic error message to prevent user enumeration
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify your email/ID and password.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact campus administration.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify your email/ID and password.',
      });
    }

    const token = generateToken(user);

    res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: user.toSafeJSON(),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found.',
      });
    }

    res.status(200).json({
      success: true,
      user: user.toSafeJSON(),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user (clears client session)
// @route   POST /api/auth/logout
// @access  Public
const logout = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully. Token invalidated on client.',
  });
};

module.exports = {
  register,
  login,
  getMe,
  logout,
};
