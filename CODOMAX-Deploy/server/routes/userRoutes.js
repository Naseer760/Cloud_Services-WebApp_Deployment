const express = require('express');
const router = express.Router();
const { getMyReports, getMyProfile, updateMyProfile } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.get('/me/reports', protect, getMyReports);
router.get('/me/profile', protect, getMyProfile);
router.patch('/me/profile', protect, updateMyProfile);

module.exports = router;
