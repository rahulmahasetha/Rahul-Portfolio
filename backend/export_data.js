/**
 * Data Export Script
 * Exports all database collections to JSON files for backup
 * Run: node export_data.js
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

async function exportData() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/portfolio');
    console.log('✓ Connected to MongoDB\n');

    // Create backup directory
    const timestamp = new Date().toISOString().split('T')[0];
    const backupDir = path.join(__dirname, `../backups/data_export_${timestamp}`);
    
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    console.log(`Exporting data to: ${backupDir}\n`);

    let totalRecords = 0;

    // Export each collection
    for (const [name, Model] of Object.entries(models)) {
      try {
        const data = await Model.find().lean();
        const filePath = path.join(backupDir, `${name}.json`);
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        
        console.log(`✓ ${name.padEnd(15)} : ${data.length} record(s) exported`);
        totalRecords += data.length;
      } catch (error) {
        console.log(`✗ ${name.padEnd(15)} : Error - ${error.message}`);
      }
    }

    // Create metadata file
    const metadata = {
      exportDate: new Date().toISOString(),
      mongodbUri: process.env.MONGODB_URI,
      totalCollections: Object.keys(models).length,
      totalRecords,
      backupDirectory: backupDir
    };

    fs.writeFileSync(
      path.join(backupDir, 'metadata.json'),
      JSON.stringify(metadata, null, 2)
    );

    console.log('\n' + '='.repeat(50));
    console.log(`✓ Export Complete`);
    console.log(`✓ Total Records: ${totalRecords}`);
    console.log(`✓ Backup Location: ${backupDir}`);
    console.log('='.repeat(50));

  } catch (error) {
    console.error('✗ Export failed:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
}

exportData();
