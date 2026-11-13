const mongoose = require('mongoose');

const matchSuggestionSchema = new mongoose.Schema(
  {
    lostItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ItemReport',
      required: true,
      index: true,
    },
    foundItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ItemReport',
      required: true,
      index: true,
    },
    matchingScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    matchingReasons: [
      {
        type: String,
        trim: true,
      },
    ],
    notifiedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    status: {
      type: String,
      enum: ['PENDING', 'ACCEPTED', 'DISMISSED'],
      default: 'PENDING',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate match suggestion pairs
matchSuggestionSchema.index({ lostItemId: 1, foundItemId: 1 }, { unique: true });

module.exports = mongoose.model('MatchSuggestion', matchSuggestionSchema);
