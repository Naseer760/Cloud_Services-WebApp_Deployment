const express = require('express');
const router = express.Router();
const {
  createItem,
  getItems,
  getItemById,
  updateItem,
  markAsRecovered,
  deleteItem,
  reportSuspectedMatch,
  contactReporter,
} = require('../controllers/itemController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.route('/')
  .get(getItems)
  .post(protect, upload.single('image'), createItem);

router.route('/:id')
  .get(optionalAuth, getItemById)
  .patch(protect, upload.single('image'), updateItem)
  .delete(protect, deleteItem);

router.patch('/:id/recover', protect, markAsRecovered);
router.post('/:id/suspect-match', protect, reportSuspectedMatch);
router.post('/:id/contact', protect, contactReporter);

module.exports = router;
