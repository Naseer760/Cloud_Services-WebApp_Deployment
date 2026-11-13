require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const bcrypt = require('bcryptjs');
const { connectDB, closeDB } = require('../config/db');
const User = require('../models/User');
const ItemReport = require('../models/ItemReport');
const MatchSuggestion = require('../models/MatchSuggestion');
const Notification = require('../models/Notification');
const mongoose = require('mongoose');
const { calculateMatchScore } = require('../services/matchingService');

const seedData = async (isStandalone = false) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }
    console.log('[Seed] Clearing existing demo data...');

    await Promise.all([
      User.deleteMany({}),
      ItemReport.deleteMany({}),
      MatchSuggestion.deleteMany({}),
      Notification.deleteMany({}),
    ]);

    console.log('[Seed] Creating demo accounts...');
    const salt = await bcrypt.genSalt(10);
    const defaultPasswordHash = await bcrypt.hash('Student@123', salt);
    const adminPasswordHash = await bcrypt.hash('AdminPassword@2026', salt);

    // 1. Admin
    const admin = await User.create({
      name: 'Campus Chief Security',
      collegeEmail: 'admin@campus.edu',
      studentId: 'ADM-001',
      passwordHash: adminPasswordHash,
      role: 'admin',
      department: 'Campus Security & Administration',
      phoneNumber: '+1-555-0100',
      contactPreference: 'EMAIL',
    });

    // 2. Student 1: Alex Johnson
    const student1 = await User.create({
      name: 'Alex Johnson',
      collegeEmail: 'alex.j@campus.edu',
      studentId: 'STU-2024-042',
      passwordHash: defaultPasswordHash,
      role: 'student',
      department: 'Computer Science & Engineering',
      phoneNumber: '+1-555-0142',
      contactPreference: 'IN_APP',
    });

    // 3. Student 2: Sarah Connor
    const student2 = await User.create({
      name: 'Sarah Connor',
      collegeEmail: 'sarah.c@campus.edu',
      studentId: 'STU-2024-118',
      passwordHash: defaultPasswordHash,
      role: 'student',
      department: 'Electrical Engineering',
      phoneNumber: '+1-555-0118',
      contactPreference: 'IN_APP',
    });

    // 4. Student 3: Liam Smith
    const student3 = await User.create({
      name: 'Liam Smith',
      collegeEmail: 'liam.s@campus.edu',
      studentId: 'STU-2023-095',
      passwordHash: defaultPasswordHash,
      role: 'student',
      department: 'Mechanical Engineering',
      phoneNumber: '+1-555-0195',
      contactPreference: 'EMAIL',
    });

    console.log('[Seed] Seeding realistic campus reports...');

    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);
    const threeDaysAgo = new Date(now.getTime() - 72 * 60 * 60 * 1000);
    const fourDaysAgo = new Date(now.getTime() - 96 * 60 * 60 * 1000);

    // Lost Item 1: Student ID Card (Alex Johnson)
    const lostIdCard = await ItemReport.create({
      title: 'Lost Campus RFID Student ID Card',
      type: 'LOST',
      category: 'ID Card',
      description: 'Misplaced my official university plastic ID card with blue lanyard. Has photo, CSE department badge, and cardholder.',
      location: 'Central Library - 2nd Floor Study Room',
      dateOccurred: oneDayAgo,
      approximateTime: 'Afternoon around 3:30 PM',
      color: 'Blue & White',
      distinctiveMarks: 'Navy blue campus lanyard with NASA space shuttle sticker on sleeve',
      ownerId: student1._id,
      status: 'ACTIVE',
      verificationStatus: 'VERIFIED',
      verifiedBy: admin._id,
      verifiedAt: oneDayAgo,
      contactPreference: 'IN_APP',
      views: 18,
    });

    // Found Item 1: Student ID Card (Sarah Connor) -> Near exact match with Alex's lost ID!
    const foundIdCard = await ItemReport.create({
      title: 'Found Student ID Card on Study Desk',
      type: 'FOUND',
      category: 'ID Card',
      description: 'Found an engineering student university ID card left behind on desk #14. Handed temporarily to librarian desk.',
      location: 'Central Library - 2nd Floor Silent Zone',
      dateOccurred: oneDayAgo,
      approximateTime: 'Late afternoon around 4:15 PM',
      color: 'Blue & White',
      distinctiveMarks: 'Attached to blue lanyard with space sticker',
      ownerId: student2._id,
      status: 'ACTIVE',
      verificationStatus: 'VERIFIED',
      verifiedBy: admin._id,
      verifiedAt: oneDayAgo,
      contactPreference: 'IN_APP',
      securityHandover: true,
      securityOfficeLocation: 'Library Front Circulation Counter',
      views: 24,
    });

    // Calculate match & create MatchSuggestion
    const match1 = calculateMatchScore(lostIdCard, foundIdCard);
    const matchSuggestion1 = await MatchSuggestion.create({
      lostItemId: lostIdCard._id,
      foundItemId: foundIdCard._id,
      matchingScore: match1.score,
      matchingReasons: match1.reasons,
      notifiedUsers: [student1._id, student2._id],
      status: 'PENDING',
    });

    // Create notifications for Student 1 & Student 2
    await Notification.create({
      recipientId: student1._id,
      type: 'MATCH_SUGGESTION',
      title: `Potential Match Detected (${match1.score}%): ${lostIdCard.title}`,
      message: `Sarah Connor posted "${foundIdCard.title}" which closely matches your lost ID card.`,
      relatedItemId: foundIdCard._id,
      relatedMatchId: matchSuggestion1._id,
      metadata: {
        score: match1.score,
        matchingReasons: match1.reasons,
        counterpartType: 'FOUND',
        counterpartItemId: foundIdCard._id,
        counterpartTitle: foundIdCard.title,
      },
      isRead: false,
    });

    await Notification.create({
      recipientId: student2._id,
      type: 'MATCH_SUGGESTION',
      title: `Potential Match Detected (${match1.score}%): ${foundIdCard.title}`,
      message: `Alex Johnson posted "${lostIdCard.title}" which matches the found ID card you registered.`,
      relatedItemId: lostIdCard._id,
      relatedMatchId: matchSuggestion1._id,
      metadata: {
        score: match1.score,
        matchingReasons: match1.reasons,
        counterpartType: 'LOST',
        counterpartItemId: lostIdCard._id,
        counterpartTitle: lostIdCard.title,
      },
      isRead: true,
    });

    // Lost Item 2: Casio Scientific Calculator (Sarah Connor)
    const lostCalc = await ItemReport.create({
      title: 'Casio fx-991EX Scientific Calculator',
      type: 'LOST',
      category: 'Calculator',
      description: 'Lost my Casio fx-991EX ClassWiz calculator during the afternoon calculus tutorial.',
      location: 'Engineering Block B - Room 204',
      dateOccurred: twoDaysAgo,
      approximateTime: 'Around 11:30 AM',
      color: 'Black with carbon pattern lid',
      distinctiveMarks: 'Initials "S.C." engraved lightly with marker on back cover',
      ownerId: student2._id,
      status: 'ACTIVE',
      verificationStatus: 'VERIFIED',
      verifiedBy: admin._id,
      verifiedAt: twoDaysAgo,
      contactPreference: 'IN_APP',
      views: 12,
    });

    // Found Item 2: Casio Calculator (Liam Smith)
    const foundCalc = await ItemReport.create({
      title: 'Black Casio Scientific Calculator',
      type: 'FOUND',
      category: 'Calculator',
      description: 'Discovered a black Casio calculator left beneath chair in Block B after class.',
      location: 'Engineering Block B - 2nd Floor Hallway',
      dateOccurred: twoDaysAgo,
      approximateTime: '1:00 PM',
      color: 'Black',
      distinctiveMarks: 'Has initials marking on back cover',
      ownerId: student3._id,
      status: 'ACTIVE',
      verificationStatus: 'PENDING',
      contactPreference: 'EMAIL',
      views: 8,
    });

    const match2 = calculateMatchScore(lostCalc, foundCalc);
    await MatchSuggestion.create({
      lostItemId: lostCalc._id,
      foundItemId: foundCalc._id,
      matchingScore: match2.score,
      matchingReasons: match2.reasons,
      notifiedUsers: [student2._id, student3._id],
      status: 'PENDING',
    });

    // Item 3: Lost Apple AirPods Pro (Liam Smith)
    await ItemReport.create({
      title: 'Apple AirPods Pro (2nd Gen) in Case',
      type: 'LOST',
      category: 'Electronics',
      description: 'Left my AirPods Pro in white wireless charging case near the treadmill or locker area.',
      location: 'Campus Sports Complex Gym',
      dateOccurred: threeDaysAgo,
      approximateTime: 'Evening 6:00 PM - 7:30 PM',
      color: 'White',
      distinctiveMarks: 'Translucent silicone protective sleeve with small metal carabiner clip',
      ownerId: student3._id,
      status: 'ACTIVE',
      verificationStatus: 'VERIFIED',
      verifiedBy: admin._id,
      verifiedAt: threeDaysAgo,
      contactPreference: 'EMAIL',
      views: 45,
    });

    // Item 4: Found Car / Bike Keys with Keychain (Alex Johnson)
    await ItemReport.create({
      title: 'Set of 3 Keys with Yamaha Keychain',
      type: 'FOUND',
      category: 'Keys',
      description: 'Found a bunch of 3 silver keys on a black and silver Yamaha motorcycle keyring near the parking lot entrance.',
      location: 'Student Vehicle Parking Lot A',
      dateOccurred: now,
      approximateTime: 'This morning at 8:45 AM',
      color: 'Silver and Black',
      distinctiveMarks: 'Yamaha tuning fork logo keyring and a small blue bottle opener',
      ownerId: student1._id,
      status: 'ACTIVE',
      verificationStatus: 'PENDING',
      contactPreference: 'IN_APP',
      securityHandover: true,
      securityOfficeLocation: 'Main Gate Security Post #1',
      views: 5,
    });

    // Item 5: Recovered Leather Wallet (Sarah Connor)
    await ItemReport.create({
      title: 'Brown Fossil Leather Wallet',
      type: 'LOST',
      category: 'Wallet',
      description: 'Misplaced brown leather bifold wallet in the cafeteria. Successfully returned by security desk.',
      location: 'Campus Main Cafeteria',
      dateOccurred: fourDaysAgo,
      approximateTime: 'Lunch hour 1:15 PM',
      color: 'Brown',
      distinctiveMarks: 'Stitched edges',
      ownerId: student2._id,
      status: 'RECOVERED',
      recoveredAt: twoDaysAgo,
      verificationStatus: 'VERIFIED',
      verifiedBy: admin._id,
      verifiedAt: fourDaysAgo,
      contactPreference: 'IN_APP',
      views: 31,
    });

    console.log('=======================================================');
    console.log('✅ Database Seeded Successfully with Realistic Records:');
    console.log('👤 Admin: admin@campus.edu (Pass: AdminPassword@2026)');
    console.log('🎓 Student 1: alex.j@campus.edu (Pass: Student@123)');
    console.log('🎓 Student 2: sarah.c@campus.edu (Pass: Student@123)');
    console.log('🎓 Student 3: liam.s@campus.edu (Pass: Student@123)');
    console.log('📦 5 Realistic Item Reports + Match Suggestions Generated');
    console.log('=======================================================');
  } catch (err) {
    console.error('[Seed] Error seeding data:', err);
    throw err;
  } finally {
    if (isStandalone) {
      await closeDB();
      process.exit(0);
    }
  }
};

if (require.main === module) {
  seedData(true);
}

module.exports = { seedData };
