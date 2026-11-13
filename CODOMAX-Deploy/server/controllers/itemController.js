const ItemReport = require('../models/ItemReport');
const MatchSuggestion = require('../models/MatchSuggestion');
const Notification = require('../models/Notification');
const { runMatchingEngine } = require('../services/matchingService');
const socketService = require('../services/socketService');

// @desc    Create a new Lost or Found item report
// @route   POST /api/items
// @access  Private (Student or Admin)
const createItem = async (req, res, next) => {
  try {
    const {
      title,
      type,
      category,
      description,
      location,
      dateOccurred,
      approximateTime,
      color,
      distinctiveMarks,
      contactPreference,
      contactDetails,
      securityHandover,
      securityOfficeLocation,
    } = req.body;

    if (!title || !type || !category || !description || !location || !dateOccurred) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: title, type, category, description, location, and date.',
      });
    }

    if (!['LOST', 'FOUND'].includes(type.toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: 'Item report type must be either LOST or FOUND.',
      });
    }

    let imageUrl = '';
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    } else if (req.body.imageUrl) {
      imageUrl = req.body.imageUrl;
    }

    // Admins can auto-verify, students start as PENDING
    const verificationStatus = req.user.role === 'admin' ? 'VERIFIED' : 'PENDING';

    const newItem = await ItemReport.create({
      title: title.trim(),
      type: type.toUpperCase(),
      category,
      description: description.trim(),
      location: location.trim(),
      dateOccurred: new Date(dateOccurred),
      approximateTime: approximateTime ? approximateTime.trim() : '',
      color: color ? color.trim() : '',
      distinctiveMarks: distinctiveMarks ? distinctiveMarks.trim() : '',
      imageUrl,
      ownerId: req.user._id,
      status: 'ACTIVE',
      verificationStatus,
      verifiedBy: req.user.role === 'admin' ? req.user._id : undefined,
      verifiedAt: req.user.role === 'admin' ? new Date() : undefined,
      contactPreference: contactPreference || req.user.contactPreference || 'IN_APP',
      contactDetails: contactDetails ? contactDetails.trim() : '',
      securityHandover: securityHandover === 'true' || securityHandover === true,
      securityOfficeLocation: securityOfficeLocation || 'Campus Security Main Gate Office',
    });

    const populatedItem = await newItem.populate('ownerId', 'name studentId department contactPreference');

    // Asynchronously trigger AI/heuristic matching engine and live alerts
    runMatchingEngine(populatedItem).catch((err) => {
      console.error('[ItemController] Background matching engine error:', err);
    });

    // Notify admins of new report submission
    socketService.emitToAdmin('new_report_submitted', {
      reportId: populatedItem._id,
      title: populatedItem.title,
      type: populatedItem.type,
      category: populatedItem.category,
      ownerName: req.user.name,
      createdAt: populatedItem.createdAt,
    });

    res.status(201).json({
      success: true,
      message: `${type === 'LOST' ? 'Lost' : 'Found'} item report submitted successfully.`,
      item: populatedItem,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all public items with multi-faceted filtering & search
// @route   GET /api/items
// @access  Public
const getItems = async (req, res, next) => {
  try {
    const {
      type,
      category,
      location,
      status = 'ACTIVE',
      search,
      startDate,
      endDate,
      sort = 'newest',
      page = 1,
      limit = 9,
    } = req.query;

    const query = { isDeleted: false };

    // Filter by type (LOST / FOUND)
    if (type && ['LOST', 'FOUND'].includes(type.toUpperCase())) {
      query.type = type.toUpperCase();
    }

    // Filter by category
    if (category && category !== 'All') {
      query.category = category;
    }

    // Filter by location
    if (location && location.trim() !== '') {
      query.location = { $regex: location.trim(), $options: 'i' };
    }

    // Filter by status (default ACTIVE, or ALL / RECOVERED)
    if (status && status !== 'ALL') {
      query.status = status;
    }

    // In student/public view, do not show rejected items
    query.verificationStatus = { $ne: 'REJECTED' };

    // Keyword search
    if (search && search.trim() !== '') {
      const term = search.trim();
      query.$or = [
        { title: { $regex: term, $options: 'i' } },
        { description: { $regex: term, $options: 'i' } },
        { location: { $regex: term, $options: 'i' } },
        { color: { $regex: term, $options: 'i' } },
        { distinctiveMarks: { $regex: term, $options: 'i' } },
      ];
    }

    // Date range
    if (startDate || endDate) {
      query.dateOccurred = {};
      if (startDate) query.dateOccurred.$gte = new Date(startDate);
      if (endDate) query.dateOccurred.$lte = new Date(endDate);
    }

    // Sorting
    let sortCriteria = { createdAt: -1 };
    if (sort === 'oldest') {
      sortCriteria = { createdAt: 1 };
    } else if (sort === 'dateOccurred') {
      sortCriteria = { dateOccurred: -1 };
    } else if (sort === 'views') {
      sortCriteria = { views: -1 };
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 9;
    const skip = (pageNum - 1) * limitNum;

    const total = await ItemReport.countDocuments(query);
    const items = await ItemReport.find(query)
      .sort(sortCriteria)
      .skip(skip)
      .limit(limitNum)
      .populate('ownerId', 'name studentId department contactPreference');

    res.status(200).json({
      success: true,
      items,
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

// @desc    Get single item details by ID
// @route   GET /api/items/:id
// @access  Public (Enhanced if authenticated)
const getItemById = async (req, res, next) => {
  try {
    const item = await ItemReport.findOne({ _id: req.params.id, isDeleted: false })
      .populate('ownerId', 'name studentId department contactPreference collegeEmail phoneNumber')
      .populate('verifiedBy', 'name');

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item report not found or has been removed.',
      });
    }

    // Increment views count safely
    item.views = (item.views || 0) + 1;
    await item.save();

    // Check if the current user is the owner or admin
    const currentUserId = req.user ? req.user._id.toString() : null;
    const isOwner = currentUserId && item.ownerId._id.toString() === currentUserId;
    const isAdmin = req.user && req.user.role === 'admin';

    // Fetch related match suggestions if owner or admin
    let matches = [];
    if (isOwner || isAdmin) {
      const matchQuery = item.type === 'LOST' ? { lostItemId: item._id } : { foundItemId: item._id };
      matches = await MatchSuggestion.find(matchQuery)
        .populate('lostItemId')
        .populate('foundItemId')
        .sort({ matchingScore: -1 });
    }

    // Privacy protection: sanitize owner info for general users
    const safeItem = item.toObject();
    if (!isOwner && !isAdmin) {
      // Hide full email & phone unless preference specifically permits
      if (safeItem.ownerId.contactPreference !== 'EMAIL') {
        delete safeItem.ownerId.collegeEmail;
      }
      if (safeItem.ownerId.contactPreference !== 'PHONE') {
        delete safeItem.ownerId.phoneNumber;
      }
      // Never expose student ID in public listing
      delete safeItem.ownerId.studentId;
    }

    res.status(200).json({
      success: true,
      item: safeItem,
      matches,
      isOwner,
      isAdmin,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update item report
// @route   PATCH /api/items/:id
// @access  Private (Owner or Admin only)
const updateItem = async (req, res, next) => {
  try {
    const item = await ItemReport.findOne({ _id: req.params.id, isDeleted: false });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item report not found.',
      });
    }

    const isOwner = item.ownerId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized. You can only edit your own reports.',
      });
    }

    const fieldsToUpdate = [
      'title',
      'category',
      'description',
      'location',
      'dateOccurred',
      'approximateTime',
      'color',
      'distinctiveMarks',
      'contactPreference',
      'contactDetails',
      'securityHandover',
      'securityOfficeLocation',
    ];

    fieldsToUpdate.forEach((field) => {
      if (req.body[field] !== undefined) {
        item[field] = req.body[field];
      }
    });

    if (req.file) {
      item.imageUrl = `/uploads/${req.file.filename}`;
    }

    await item.save();

    res.status(200).json({
      success: true,
      message: 'Item report updated successfully.',
      item,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark item report as recovered
// @route   PATCH /api/items/:id/recover
// @access  Private (Owner or Admin only)
const markAsRecovered = async (req, res, next) => {
  try {
    const item = await ItemReport.findOne({ _id: req.params.id, isDeleted: false });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item report not found.',
      });
    }

    const isOwner = item.ownerId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized. Only the report owner or an administrator can resolve this item.',
      });
    }

    item.status = 'RECOVERED';
    item.recoveredAt = new Date();
    await item.save();

    // Mark associated matches as ACCEPTED
    await MatchSuggestion.updateMany(
      { $or: [{ lostItemId: item._id }, { foundItemId: item._id }] },
      { status: 'ACCEPTED' }
    );

    // Notify owner
    const notif = await Notification.create({
      recipientId: item.ownerId,
      type: 'REPORT_RECOVERED',
      title: `Item Resolved: ${item.title}`,
      message: `Your ${item.type.toLowerCase()} item report for "${item.title}" has been successfully marked as recovered! It is now archived in your personal history.`,
      relatedItemId: item._id,
    });

    socketService.emitToUser(item.ownerId, 'new_notification', { notification: notif });

    res.status(200).json({
      success: true,
      message: 'Item marked as recovered successfully.',
      item,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Soft delete / remove item report
// @route   DELETE /api/items/:id
// @access  Private (Owner or Admin)
const deleteItem = async (req, res, next) => {
  try {
    const item = await ItemReport.findOne({ _id: req.params.id, isDeleted: false });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item report not found.',
      });
    }

    const isOwner = item.ownerId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to remove this report.',
      });
    }

    // Soft delete to retain moderation audit history
    item.isDeleted = true;
    item.deletedBy = req.user._id;
    item.deletedReason = req.body.reason || (isOwner ? 'Cancelled by owner' : 'Removed by administrator');
    await item.save();

    res.status(200).json({
      success: true,
      message: 'Item report removed successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Report suspected match manually by student
// @route   POST /api/items/:id/suspect-match
// @access  Private
const reportSuspectedMatch = async (req, res, next) => {
  try {
    const { counterpartItemId, notes } = req.body;
    const targetItem = await ItemReport.findById(req.params.id);
    const counterpart = await ItemReport.findById(counterpartItemId);

    if (!targetItem || !counterpart) {
      return res.status(404).json({
        success: false,
        message: 'One or both item reports were not found.',
      });
    }

    // Create notification for counterpart owner
    const notif = await Notification.create({
      recipientId: counterpart.ownerId,
      type: 'MATCH_SUGGESTION',
      title: `Potential Match Flagged: ${counterpart.title}`,
      message: `${req.user.name} reported that their item "${targetItem.title}" might match your report "${counterpart.title}". Note: "${notes || 'No extra notes provided.'}"`,
      relatedItemId: targetItem._id,
      metadata: {
        score: 75,
        matchingReasons: ['User-submitted suspected match', notes || 'Manual match correlation'],
        counterpartType: targetItem.type,
        counterpartItemId: targetItem._id,
        counterpartTitle: targetItem.title,
        senderName: req.user.name,
      },
    });

    socketService.emitToUser(counterpart.ownerId, 'new_notification', { notification: notif });

    res.status(200).json({
      success: true,
      message: 'Suspected match reported. The report owner has been notified.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Safely contact item reporter via in-app notification
// @route   POST /api/items/:id/contact
// @access  Private
const contactReporter = async (req, res, next) => {
  try {
    const { message, contactInfo } = req.body;
    const item = await ItemReport.findById(req.params.id).populate('ownerId');

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item report not found.',
      });
    }

    if (item.ownerId._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot send a contact inquiry to yourself.',
      });
    }

    const notif = await Notification.create({
      recipientId: item.ownerId._id,
      type: 'CONTACT_INQUIRY',
      title: `Message regarding your item: ${item.title}`,
      message: `${req.user.name} says: "${message}"`,
      relatedItemId: item._id,
      metadata: {
        senderName: req.user.name,
        senderContact: contactInfo || req.user.collegeEmail,
        counterpartTitle: item.title,
      },
    });

    socketService.emitToUser(item.ownerId._id, 'new_notification', { notification: notif });

    res.status(200).json({
      success: true,
      message: 'Your inquiry has been delivered safely to the reporter.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createItem,
  getItems,
  getItemById,
  updateItem,
  markAsRecovered,
  deleteItem,
  reportSuspectedMatch,
  contactReporter,
};
