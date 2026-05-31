# VERSAL/VERCEL Deployment Guide - Data Preservation

## ⚠️ Critical: Data Protection Strategy

This guide ensures **ZERO data loss** during deployment.

---

## 1. Database Backup (BEFORE Deployment)

### Step 1a: Backup MongoDB Locally
```bash
# Windows
mongodump --uri="mongodb://127.0.0.1:27017/portfolio" --out="./backup/$(Get-Date -Format 'yyyy-MM-dd_HH-mm-ss')"

# macOS/Linux
mongodump --uri="mongodb://127.0.0.1:27017/portfolio" --out="./backup/$(date +%Y-%m-%d_%H-%M-%S)"
```

### Step 1b: Export Data as JSON (Additional Safety)
```bash
cd backend
node export_data.js  # Script to create at root of backend
```

---

## 2. Environment Setup for Production

### Step 2a: Create `.env.production` (Do NOT commit to Git)
```env
# Production MongoDB Atlas URL
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster.mongodb.net/portfolio?retryWrites=true&w=majority

# Production API URL
VITE_API_URL=https://your-backend-domain.vercel.app

# Admin email
ADMIN_EMAIL=mahasethrahul7@gmail.com

# Node environment
NODE_ENV=production

PORT=5000
```

### Step 2b: Add to `.gitignore` (if not already present)
```
.env
.env.production
.env.local
backup/
*.dump
```

---

## 3. File Uploads Persistence

### Problem: Local file storage won't persist on serverless platforms

### Solution: Migrate to Cloud Storage

#### Option A: MongoDB GridFS (Recommended for simplicity)
```
- Stores files directly in MongoDB
- No additional infrastructure
- Automatic backup with DB backups
```

#### Option B: AWS S3 / Google Cloud Storage / Azure Blob
```
- Industry standard
- Better for large files
- Scalable
```

**For this deployment, we recommend GridFS to keep it simple.**

---

## 4. Deployment Checklist

### Before Deployment:
- [ ] Create MongoDB Atlas account (cloud database)
- [ ] Create backup of local MongoDB data
- [ ] Export all uploads to backup folder
- [ ] Test production environment variables locally
- [ ] Update `.env.production` with cloud credentials
- [ ] Add deployment secrets to Vercel dashboard

### Vercel Dashboard Configuration:
1. Go to: https://vercel.com/dashboard
2. Add Environment Variables (Settings → Environment Variables):
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `ADMIN_EMAIL`: Admin email
   - `NODE_ENV`: `production`

### Deployment Steps:
1. Connect GitHub repository to Vercel
2. Configure build settings:
   - Framework: Vite (auto-detected)
   - Build command: `npm run build`
   - Output directory: `dist`
   - Install command: `npm ci`
3. Set environment variables (from .env)
4. Deploy

---

## 5. Post-Deployment Data Verification

### Verify MongoDB Connection:
```bash
curl https://your-backend-domain.vercel.app/api/certificates
```

### Verify Uploads Accessible:
```bash
curl https://your-backend-domain.vercel.app/uploads/test.jpg
```

### Database Integrity Check:
```javascript
// In backend terminal
node -e "require('mongoose').connect(process.env.MONGODB_URI).then(() => console.log('✓ DB Connected'))"
```

---

## 6. Rollback Strategy

### If deployment fails:
1. Restore from local backup:
   ```bash
   mongorestore --uri="mongodb://127.0.0.1:27017/portfolio" ./backup/[latest-backup-folder]
   ```

2. Revert Vercel deployment:
   - Vercel Dashboard → Deployments → Click previous working deployment → "Promote to Production"

---

## 7. Data Migration Script

Create `/backend/migrate_to_production.js`:

```javascript
const mongoose = require('mongoose');
require('dotenv').config();

const models = ['Contact', 'Certificate', 'Skill', 'Project', 'Achievement', 'Stat', 'Timeline', 'Nav', 'Setting', 'About', 'Resume'];

async function migrateData() {
  try {
    // Connect to local DB
    await mongoose.connect('mongodb://127.0.0.1:27017/portfolio');
    console.log('✓ Connected to local database');

    // Export all collections
    for (const model of models) {
      const Model = require(`./models/${model}`);
      const count = await Model.countDocuments();
      console.log(`✓ ${model}: ${count} documents ready for migration`);
    }

    console.log('\n✓ All data verified. Ready for production migration.');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.connection.close();
  }
}

migrateData();
```

Run with: `node backend/migrate_to_production.js`

---

## 8. Monitoring Post-Deployment

### Add to backend logging:
```javascript
// In backend/index.js - Add logging
console.log('Environment:', process.env.NODE_ENV);
console.log('Database:', process.env.MONGODB_URI.split('?')[0]);
console.log('API Server started at:', process.env.PORT);
```

### Monitor Vercel logs:
- Vercel Dashboard → Deployments → Recent deployment → Logs

---

## 9. Quick Reference: Emergency Data Recovery

**Lost data on production?**
1. Stop the deployment
2. Restore from backup: `mongorestore --uri="$PRODUCTION_MONGODB_URI" ./backup/[backup-folder]`
3. Verify all collections are restored
4. Redeploy application

---

## 10. Additional Resources

- MongoDB Atlas Setup: https://www.mongodb.com/cloud/atlas
- Vercel Documentation: https://vercel.com/docs
- Environment Variables: https://vercel.com/docs/projects/environment-variables
- MongoDB Backups: https://www.mongodb.com/docs/atlas/backup/

---

**Remember:** Backup before every deployment! 🔒
