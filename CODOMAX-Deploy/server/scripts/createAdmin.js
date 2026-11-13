require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const bcrypt = require('bcryptjs');
const { connectDB, closeDB } = require('../config/db');
const User = require('../models/User');

const createAdmin = async () => {
  try {
    await connectDB();

    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@campus.edu').toLowerCase().trim();
    const adminPassword = process.env.ADMIN_PASSWORD || 'AdminPassword@2026';
    const adminName = process.env.ADMIN_NAME || 'Campus Administrator';
    const adminId = process.env.ADMIN_STUDENT_ID || 'ADM-001';

    const existingAdmin = await User.findOne({
      $or: [{ collegeEmail: adminEmail }, { studentId: adminId }],
    });

    if (existingAdmin) {
      if (existingAdmin.role !== 'admin') {
        existingAdmin.role = 'admin';
        await existingAdmin.save();
        console.log(`[AdminBootstrap] Existing user ${existingAdmin.collegeEmail} elevated to administrator.`);
      } else {
        console.log(`[AdminBootstrap] Administrator already exists: ${existingAdmin.collegeEmail} (${existingAdmin.studentId})`);
      }
    } else {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(adminPassword, salt);

      const admin = await User.create({
        name: adminName,
        collegeEmail: adminEmail,
        studentId: adminId,
        passwordHash,
        role: 'admin',
        department: 'Campus Security & Administration',
        phoneNumber: '+1-555-0199',
        contactPreference: 'EMAIL',
      });

      console.log('=======================================================');
      console.log('🎉 First Campus Administrator Bootstrapped Successfully:');
      console.log(`👤 Name: ${admin.name}`);
      console.log(`📧 Email: ${admin.collegeEmail}`);
      console.log(`🆔 ID: ${admin.studentId}`);
      console.log(`🔑 Password: ${adminPassword}`);
      console.log(`🛡️ Role: ${admin.role}`);
      console.log('=======================================================');
    }
  } catch (err) {
    console.error('[AdminBootstrap] Error bootstrapping administrator:', err.message);
  } finally {
    await closeDB();
    process.exit(0);
  }
};

createAdmin();
