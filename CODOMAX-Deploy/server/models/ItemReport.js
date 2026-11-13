const mongoose = require('mongoose');

const CATEGORIES = [
  'ID Card',
  'Mobile Phone',
  'Wallet',
  'Books',
  'Calculator',
  'Bag',
  'Electronics',
  'Keys',
  'Accessories',
  'Documents',
  'Other',
];

const itemReportSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Item title/name is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
      index: true,
    },
    type: {
      type: String,
      enum: ['LOST', 'FOUND'],
      required: [true, 'Report type is required (LOST or FOUND)'],
      index: true,
    },
    category: {
      type: String,
      enum: CATEGORIES,
      required: [true, 'Category is required'],
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Detailed description is required'],
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    location: {
      type: String,
      required: [true, 'Campus location is required'],
      trim: true,
      maxlength: [150, 'Location cannot exceed 150 characters'],
      index: true,
    },
    dateOccurred: {
      type: Date,
      required: [true, 'Date lost or found is required'],
      index: true,
    },
    approximateTime: {
      type: String,
      trim: true,
      default: '',
    },
    color: {
      type: String,
      trim: true,
      default: '',
    },
    distinctiveMarks: {
      type: String,
      trim: true,
      default: '',
    },
    imageUrl: {
      type: String,
      default: '',
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'RECOVERED', 'CLOSED'],
      default: 'ACTIVE',
      index: true,
    },
    verificationStatus: {
      type: String,
      enum: ['PENDING', 'VERIFIED', 'REJECTED'],
      default: 'PENDING',
      index: true,
    },
    rejectionReason: {
      type: String,
      default: '',
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    verifiedAt: {
      type: Date,
    },
    recoveredAt: {
      type: Date,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedReason: {
      type: String,
      default: '',
    },
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    contactPreference: {
      type: String,
      enum: ['EMAIL', 'PHONE', 'IN_APP', 'SECURITY_OFFICE'],
      default: 'IN_APP',
    },
    contactDetails: {
      type: String,
      default: '',
    },
    securityHandover: {
      type: Boolean,
      default: false,
    },
    securityOfficeLocation: {
      type: String,
      default: 'Campus Security Office (Admin Block Ground Floor)',
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound and text indexes for fast search and filtering
itemReportSchema.index({ title: 'text', description: 'text', location: 'text', distinctiveMarks: 'text' });
itemReportSchema.index({ type: 1, status: 1, category: 1, isDeleted: 1 });
itemReportSchema.index({ dateOccurred: -1 });

module.exports = mongoose.model('ItemReport', itemReportSchema);
module.exports.CATEGORIES = CATEGORIES;
