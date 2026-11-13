const ItemReport = require('../models/ItemReport');
const User = require('../models/User');
const MatchSuggestion = require('../models/MatchSuggestion');
const Notification = require('../models/Notification');
const socketService = require('../services/socketService');

// @desc    Get Admin Overview Metrics & Recent Activity
// @route   GET /api/admin/dashboard
// @access  Private (Admin only)
const getDashboardStats = async (req, res, next) => {
  try {
    const totalReports = await ItemReport.countDocuments({ isDeleted: false });
    const activeLost = await ItemReport.countDocuments({ type: 'LOST', status: 'ACTIVE', isDeleted: false });
    const activeFound = await ItemReport.countDocuments({ type: 'FOUND', status: 'ACTIVE', isDeleted: false });
    const recoveredItems = await ItemReport.countDocuments({ status: 'RECOVERED', isDeleted: false });
    const pendingVerification = await ItemReport.countDocuments({ verificationStatus: 'PENDING', isDeleted: false });
    const rejectedReports = await ItemReport.countDocuments({ verificationStatus: 'REJECTED', isDeleted: false });
    const removedReports = await ItemReport.countDocuments({ isDeleted: true });
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalMatches = await MatchSuggestion.countDocuments();

    // Recent activity (latest 8 submitted reports)
    const recentReports = await ItemReport.find({ isDeleted: false })
      .sort({ createdAt: -1 })
      .limit(8)
      .populate('ownerId', 'name studentId collegeEmail department')
      .populate('verifiedBy', 'name');

    // Recent match suggestions
    const recentMatches = await MatchSuggestion.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('lostItemId', 'title category location')
      .populate('foundItemId', 'title category location');

    res.status(200).json({
      success: true,
      metrics: {
        totalReports,
        activeLost,
        activeFound,
        recoveredItems,
        pendingVerification,
        rejectedReports,
        removedReports,
        totalStudents,
        totalMatches,
      },
      recentReports,
      recentMatches,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all reports with comprehensive administrative filters
// @route   GET /api/admin/reports
// @access  Private (Admin only)
const getAllReports = async (req, res, next) => {
  try {
    const {
      type,
      category,
      status,
      verificationStatus,
      search,
      includeDeleted = 'false',
      page = 1,
      limit = 15,
      sort = 'newest',
    } = req.query;

    const query = {};

    if (includeDeleted !== 'true') {
      query.isDeleted = false;
    }

    if (type && type !== 'ALL') {
      query.type = type.toUpperCase();
    }

    if (category && category !== 'ALL') {
      query.category = category;
    }

    if (status && status !== 'ALL') {
      query.status = status.toUpperCase();
    }

    if (verificationStatus && verificationStatus !== 'ALL') {
      query.verificationStatus = verificationStatus.toUpperCase();
    }

    if (search && search.trim() !== '') {
      const term = search.trim();
      query.$or = [
        { title: { $regex: term, $options: 'i' } },
        { description: { $regex: term, $options: 'i' } },
        { location: { $regex: term, $options: 'i' } },
      ];
    }

    let sortCriteria = { createdAt: -1 };
    if (sort === 'oldest') sortCriteria = { createdAt: 1 };
    if (sort === 'pendingFirst') sortCriteria = { verificationStatus: 1, createdAt: -1 };

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 15;
    const skip = (pageNum - 1) * limitNum;

    const total = await ItemReport.countDocuments(query);
    const reports = await ItemReport.find(query)
      .sort(sortCriteria)
      .skip(skip)
      .limit(limitNum)
      .populate('ownerId', 'name studentId collegeEmail department phoneNumber')
      .populate('verifiedBy', 'name')
      .populate('deletedBy', 'name');

    res.status(200).json({
      success: true,
      reports,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum) || 1,
        limit: limitNum,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify legitimate report
// @route   PATCH /api/admin/reports/:id/verify
// @access  Private (Admin only)
const verifyReport = async (req, res, next) => {
  try {
    const item = await ItemReport.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    item.verificationStatus = 'VERIFIED';
    item.verifiedBy = req.user._id;
    item.verifiedAt = new Date();
    item.rejectionReason = '';
    await item.save();

    // Notify student owner
    const notif = await Notification.create({
      recipientId: item.ownerId,
      type: 'REPORT_VERIFIED',
      title: 'Report Verified by Campus Staff',
      message: `Your report for "${item.title}" has been reviewed and verified by campus administration.`,
      relatedItemId: item._id,
    });

    socketService.emitToUser(item.ownerId, 'new_notification', { notification: notif });

    res.status(200).json({
      success: true,
      message: 'Report verified successfully.',
      item,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject fraudulent or inappropriate report
// @route   PATCH /api/admin/reports/:id/reject
// @access  Private (Admin only)
const rejectReport = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const item = await ItemReport.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    item.verificationStatus = 'REJECTED';
    item.rejectionReason = reason || 'Does not adhere to campus lost & found posting guidelines.';
    item.verifiedBy = req.user._id;
    item.verifiedAt = new Date();
    await item.save();

    // Notify student owner
    const notif = await Notification.create({
      recipientId: item.ownerId,
      type: 'REPORT_REJECTED',
      title: 'Report Posting Rejected',
      message: `Your report for "${item.title}" could not be verified. Reason: ${item.rejectionReason}`,
      relatedItemId: item._id,
    });

    socketService.emitToUser(item.ownerId, 'new_notification', { notification: notif });

    res.status(200).json({
      success: true,
      message: 'Report has been rejected.',
      item,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update report status directly by admin
// @route   PATCH /api/admin/reports/:id/status
// @access  Private (Admin only)
const updateReportStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['ACTIVE', 'RECOVERED', 'CLOSED'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value.' });
    }

    const item = await ItemReport.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    item.status = status;
    if (status === 'RECOVERED') {
      item.recoveredAt = new Date();
    }
    await item.save();

    res.status(200).json({
      success: true,
      message: `Report status updated to ${status}.`,
      item,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Soft delete report by admin with reason
// @route   DELETE /api/admin/reports/:id
// @access  Private (Admin only)
const adminDeleteReport = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const item = await ItemReport.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    item.isDeleted = true;
    item.deletedReason = reason || 'Removed by campus administrator for content moderation.';
    item.deletedBy = req.user._id;
    await item.save();

    res.status(200).json({
      success: true,
      message: 'Report soft-deleted. Moderation record preserved.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getAllReports,
  verifyReport,
  rejectReport,
  updateReportStatus,
  adminDeleteReport,
};
