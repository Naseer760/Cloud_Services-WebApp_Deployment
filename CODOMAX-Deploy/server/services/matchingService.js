const ItemReport = require('../models/ItemReport');
const MatchSuggestion = require('../models/MatchSuggestion');
const Notification = require('../models/Notification');
const socketService = require('./socketService');
const emailService = require('./emailService');

const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
  'by', 'from', 'my', 'is', 'was', 'i', 'it', 'item', 'lost', 'found', 'near',
  'campus', 'around', 'about', 'some', 'please', 'help', 'contact', 'me'
]);

const tokenize = (text) => {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word));
};

const calculateKeywordOverlap = (tokensA, tokensB) => {
  if (!tokensA.length || !tokensB.length) return { score: 0, matchedWords: [] };
  const setB = new Set(tokensB);
  const matched = tokensA.filter((w) => setB.has(w));
  const uniqueMatched = [...new Set(matched)];
  const union = new Set([...tokensA, ...tokensB]);
  const jaccard = union.size > 0 ? uniqueMatched.length / union.size : 0;
  return { score: Math.min(1, jaccard * 2.5), matchedWords: uniqueMatched };
};

const checkLocationMatch = (locA, locB) => {
  if (!locA || !locB) return false;
  const a = locA.toLowerCase();
  const b = locB.toLowerCase();
  
  // Exact or contains
  if (a.includes(b) || b.includes(a)) return true;

  // Key campus landmarks
  const landmarks = [
    'library', 'cafeteria', 'canteen', 'gym', 'sports', 'stadium', 'hostel',
    'auditorium', 'lab', 'workshop', 'ground', 'gate', 'parking', 'admin',
    'block a', 'block b', 'block c', 'science', 'engineering', 'foyer', 'bus'
  ];

  for (const mark of landmarks) {
    if (a.includes(mark) && b.includes(mark)) return true;
  }
  return false;
};

const calculateMatchScore = (newItem, existingItem) => {
  let score = 0;
  const reasons = [];

  // 1. Category Matching (35 points)
  if (newItem.category === existingItem.category) {
    score += 35;
    reasons.push(`Exact category match: "${newItem.category}" (+35%)`);
  }

  // 2. Keyword Similarity (up to 25 points)
  const tokensNew = [
    ...tokenize(newItem.title),
    ...tokenize(newItem.description),
    ...tokenize(newItem.distinctiveMarks),
  ];
  const tokensExist = [
    ...tokenize(existingItem.title),
    ...tokenize(existingItem.description),
    ...tokenize(existingItem.distinctiveMarks),
  ];
  const { score: kwScore, matchedWords } = calculateKeywordOverlap(tokensNew, tokensExist);
  const kwPoints = Math.round(kwScore * 25);
  if (kwPoints > 0) {
    score += kwPoints;
    reasons.push(`Key terms match [${matchedWords.slice(0, 4).join(', ')}] (+${kwPoints}%)`);
  }

  // 3. Location Proximity (20 points)
  if (checkLocationMatch(newItem.location, existingItem.location)) {
    score += 20;
    reasons.push(`Correlated campus location: "${newItem.location}" vs "${existingItem.location}" (+20%)`);
  }

  // 4. Date Proximity (up to 15 points)
  const dateA = new Date(newItem.dateOccurred).getTime();
  const dateB = new Date(existingItem.dateOccurred).getTime();
  const diffDays = Math.abs(dateA - dateB) / (1000 * 60 * 60 * 24);

  if (diffDays <= 1.5) {
    score += 15;
    reasons.push(`Dates within 24-36 hours of each other (+15%)`);
  } else if (diffDays <= 4) {
    score += 10;
    reasons.push(`Dates within 4 days of each other (+10%)`);
  } else if (diffDays <= 8) {
    score += 5;
    reasons.push(`Dates within 8 days of each other (+5%)`);
  }

  // 5. Color & Distinctive features (5 points)
  if (
    newItem.color &&
    existingItem.color &&
    newItem.color.toLowerCase().trim() === existingItem.color.toLowerCase().trim()
  ) {
    score += 5;
    reasons.push(`Matching color: "${newItem.color}" (+5%)`);
  }

  return {
    score: Math.min(100, score),
    reasons,
  };
};

const runMatchingEngine = async (newItem) => {
  try {
    const targetType = newItem.type === 'LOST' ? 'FOUND' : 'LOST';

    // Find candidate opposite reports that are active, not deleted, and not created by the same user
    const candidates = await ItemReport.find({
      type: targetType,
      status: 'ACTIVE',
      isDeleted: false,
      ownerId: { $ne: newItem.ownerId },
    }).populate('ownerId', 'name collegeEmail studentId');

    const createdSuggestions = [];

    for (const candidate of candidates) {
      const { score, reasons } = calculateMatchScore(newItem, candidate);

      // Only record matches with score >= 45%
      if (score >= 45) {
        const lostItemId = newItem.type === 'LOST' ? newItem._id : candidate._id;
        const foundItemId = newItem.type === 'FOUND' ? newItem._id : candidate._id;

        // Upsert MatchSuggestion
        const suggestion = await MatchSuggestion.findOneAndUpdate(
          { lostItemId, foundItemId },
          {
            lostItemId,
            foundItemId,
            matchingScore: score,
            matchingReasons: reasons,
            status: 'PENDING',
            $addToSet: { notifiedUsers: { $each: [newItem.ownerId, candidate.ownerId._id] } },
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        createdSuggestions.push(suggestion);

        // Populate new item owner
        const newItemOwner = await newItem.populate('ownerId', 'name collegeEmail studentId');

        // Create Notifications for BOTH users
        const notifyTargetUser = async (recipient, myItem, counterpartItem) => {
          const notif = await Notification.create({
            recipientId: recipient._id,
            type: 'MATCH_SUGGESTION',
            title: `Potential Match Detected (${score}%): ${myItem.title}`,
            message: `A report titled "${counterpartItem.title}" matches your ${myItem.type.toLowerCase()} item report based on category, keywords, and location.`,
            relatedItemId: counterpartItem._id,
            relatedMatchId: suggestion._id,
            metadata: {
              score,
              matchingReasons: reasons,
              counterpartType: counterpartItem.type,
              counterpartItemId: counterpartItem._id,
              counterpartTitle: counterpartItem.title,
            },
          });

          // Dispatch real-time live alert via Socket.IO
          socketService.emitToUser(recipient._id, 'new_notification', {
            notification: notif,
            score,
            item: counterpartItem,
            reasons,
          });

          socketService.emitToUser(recipient._id, 'item_match_alert', {
            matchId: suggestion._id,
            score,
            counterpartItem,
            reasons,
          });

          // Dispatch optional email
          const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
          await emailService.sendMatchAlertEmail({
            toEmail: recipient.collegeEmail,
            recipientName: recipient.name,
            itemTitle: myItem.title,
            matchTitle: counterpartItem.title,
            score,
            reasons,
            matchUrl: `${clientUrl}/items/${counterpartItem._id}`,
          });
        };

        // Notify new item owner
        await notifyTargetUser(newItemOwner.ownerId, newItem, candidate);

        // Notify counterpart owner
        await notifyTargetUser(candidate.ownerId, candidate, newItem);
      }
    }

    return createdSuggestions;
  } catch (error) {
    console.error('[MatchingEngine] Error running matching engine:', error);
    return [];
  }
};

module.exports = {
  runMatchingEngine,
  calculateMatchScore,
};
