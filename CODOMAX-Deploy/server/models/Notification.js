const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        'MATCH_SUGGESTION',
        'REPORT_VERIFIED',
        'REPORT_REJECTED',
        'REPORT_RECOVERED',
        'CONTACT_INQUIRY',
        'SYSTEM_ALERT',
      ],
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    relatedItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ItemReport',
      index: true,
    },
    relatedMatchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MatchSuggestion',
    },
    metadata: {
      score: Number,
      matchingReasons: [String],
      counterpartType: String,
      counterpartItemId: mongoose.Schema.Types.ObjectId,
      counterpartTitle: String,
      senderName: String,
      senderContact: String,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ recipientId: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
