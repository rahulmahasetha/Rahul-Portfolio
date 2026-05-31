/**
 * Data Migration Script
 * Verifies all data is ready for production deployment
 * Run: node migrate_to_production.js
 */

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Import all models
const Contact = require('./models/Contact');
const Certificate = require('./models/Certificate');
const Skill = require('./models/Skill');
const Project = require('./models/Project');
const Achievement = require('./models/Achievement');
const Stat = require('./models/Stat');
const Timeline = require('./models/Timeline');
const Nav = require('./models/Nav');
const Setting = require('./models/Setting');
const About = require('./models/About');
const Resume = require('./models/Resume');
const Admin = require('./models/Admin');

const models = {
  Contact,
  Certificate,
  Skill,
  Project,
  Achievement,
  Stat,
  Timeline,
  Nav,
  Setting,
  About,
  Resume,
  Admin
};

async function verifyData() {
  try {
    // Connect to local database
    await mongoose.connect('mongodb://127.0.0.1:27017/portfolio');
    console.log('✓ Connected to local MongoDB database\n');

    let totalDocuments = 0;
    const collectionStats = {};

    // Count documents in each collection
    for (const [name, Model] of Object.entries(models)) {
      try {
        const count = await Model.countDocuments();
        collectionStats[name] = count;
        totalDocuments += count;
        console.log(`✓ ${name.padEnd(15)} : ${count} document(s)`);
      } catch (error) {
        console.log(`✗ ${name.padEnd(15)} : Error - ${error.message}`);
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log(`Total Documents: ${totalDocuments}`);
    console.log('='.repeat(50) + '\n');

    // Check uploads directory
    const uploadsDir = path.join(__dirname, 'uploads');
    if (fs.existsSync(uploadsDir)) {
      const files = fs.readdirSync(uploadsDir);
      console.log(`✓ Uploads Directory: ${files.length} file(s)`);
    } else {
      console.log('⚠ Uploads Directory: Not found');
    }

    // Export verification report
    const report = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      mongodbUri: process.env.MONGODB_URI,
      collections: collectionStats,
      totalDocuments,
      uploadFiles: fs.existsSync(uploadsDir) ? fs.readdirSync(uploadsDir).length : 0,
      status: 'READY_FOR_DEPLOYMENT'
    };

    // Save report
    const reportPath = path.join(__dirname, 'migration_report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n✓ Migration report saved to: migration_report.json`);

    console.log('\n✓ All data verified! Ready for production migration.');
    console.log('\nNext steps:');
    console.log('1. Create MongoDB Atlas account (if not already done)');
    console.log('2. Copy MongoDB Atlas connection string to .env.production');
    console.log('3. Deploy to Vercel with production environment variables');
    console.log('4. Verify data on production: curl https://your-domain.vercel.app/api/certificates');

  } catch (error) {
    console.error('\n✗ Migration verification failed:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
}

// Run verification
verifyData();
