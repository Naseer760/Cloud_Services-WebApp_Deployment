const User = require('../models/User');
const ItemReport = require('../models/ItemReport');
const bcrypt = require('bcryptjs');

// @desc    Get all reports submitted by the current user with status aggregations
// @route   GET /api/users/me/reports
// @access  Private
const getMyReports = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const reports = await ItemReport.find({ ownerId: userId, isDeleted: false })
      .sort({ createdAt: -1 })
      .populate('verifiedBy', 'name');

    const total = reports.length;
    const lostCount = reports.filter((r) => r.type === 'LOST').length;
    const foundCount = reports.filter((r) => r.type === 'FOUND').length;
    const activeCount = reports.filter((r) => r.status === 'ACTIVE').length;
    const recoveredCount = reports.filter((r) => r.status === 'RECOVERED').length;
    const pendingCount = reports.filter((r) => r.verificationStatus === 'PENDING').length;
    const verifiedCount = reports.filter((r) => r.verificationStatus === 'VERIFIED').length;
    const rejectedCount = reports.filter((r) => r.verificationStatus === 'REJECTED').length;

    res.status(200).json({
      success: true,
      reports,
      counts: {
        total,
        lostCount,
        foundCount,
        activeCount,
        recoveredCount,
        pendingCount,
        verifiedCount,
        rejectedCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user profile with report metrics
// @route   GET /api/users/me/profile
// @access  Private
const getMyProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const reportCount = await ItemReport.countDocuments({ ownerId: req.user._id, isDeleted: false });
    const recoveredCount = await ItemReport.countDocuments({
      ownerId: req.user._id,
      status: 'RECOVERED',
      isDeleted: false,
    });

    res.status(200).json({
      success: true,
      user: user.toSafeJSON(),
      metrics: {
        totalReports: reportCount,
        recoveredReports: recoveredCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile & preferences
// @route   PATCH /api/users/me/profile
// @access  Private
const updateMyProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('+passwordHash');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { name, phoneNumber, department, contactPreference, currentPassword, newPassword } = req.body;

    if (name) user.name = name.trim();
    if (phoneNumber !== undefined) user.phoneNumber = phoneNumber.trim();
    if (department) user.department = department.trim();
    if (contactPreference) user.contactPreference = contactPreference;

    // Optional password change
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: 'Please provide your current password to set a new password.',
        });
      }
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: 'Current password is incorrect.',
        });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'New password must be at least 6 characters.',
        });
      }
      const salt = await bcrypt.genSalt(10);
      user.passwordHash = await bcrypt.hash(newPassword, salt);
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: user.toSafeJSON(),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyReports,
  getMyProfile,
  updateMyProfile,
};
