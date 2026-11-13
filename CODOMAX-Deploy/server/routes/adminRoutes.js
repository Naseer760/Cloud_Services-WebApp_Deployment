const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllReports,
  verifyReport,
  rejectReport,
  updateReportStatus,
  adminDeleteReport,
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Enforce both JWT authentication and Administrator role check
router.use(protect, adminOnly);

router.get('/dashboard', getDashboardStats);
router.get('/reports', getAllReports);
router.patch('/reports/:id/verify', verifyReport);
router.patch('/reports/:id/reject', rejectReport);
router.patch('/reports/:id/status', updateReportStatus);
router.delete('/reports/:id', adminDeleteReport);

module.exports = router;
