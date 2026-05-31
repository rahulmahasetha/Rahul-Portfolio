# 🚨 CRITICAL: Security & Data Preservation Checklist

**STATUS:** ⚠️ URGENT - Complete before deployment

---

## PART 1: Secure Your Database (DO THIS FIRST!)

### Step 1: Rotate MongoDB Password ⏱️ 5 minutes
- [ ] Go to: https://cloud.mongodb.com
- [ ] Select Project → Database Access
- [ ] Find user: `rahulmahaseth700_db_user`
- [ ] Click "Edit" → "Generate New Password"
- [ ] Copy and save password securely (password manager)
- [ ] Click "Update User"

### Step 2: Update Local Development .env ⏱️ 2 minutes
Create/update `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb+srv://rahulmahaseth700_db_user:YOUR_NEW_PASSWORD@cluster0.viz4lim.mongodb.net/portfolio?retryWrites=true&w=majority
ADMIN_EMAIL=mahasethrahul7@gmail.com
NODE_ENV=development
JWT_SECRET=your_dev_secret_here
```

- [ ] Replace `YOUR_NEW_PASSWORD` with the new password
- [ ] Keep this file local (NOT in Git)

### Step 3: Configure MongoDB Network Access ⏱️ 3 minutes
- [ ] Go to: https://cloud.mongodb.com
- [ ] Click "Network Access" (left sidebar)
- [ ] Click "Add IP Address"
- [ ] Add Entry: `0.0.0.0/0`
- [ ] Click "Confirm"

---

## PART 2: Setup Vercel Environment Variables ⏱️ 5 minutes

### Step 4: Add Secrets to Vercel Dashboard
- [ ] Go to: https://vercel.com/dashboard
- [ ] Select your portfolio project
- [ ] Settings → Environment Variables
- [ ] Add these variables one by one:

| Name | Value | Secret? |
|------|-------|---------|
| `MONGODB_URI` | `mongodb+srv://rahulmahaseth700_db_user:YOUR_NEW_PASSWORD@cluster0.viz4lim.mongodb.net/portfolio?retryWrites=true&w=majority` | YES |
| `NODE_ENV` | `production` | NO |
| `JWT_SECRET` | (generated below) | YES |
| `ADMIN_EMAIL` | `mahasethrahul7@gmail.com` | NO |
| `VITE_API_URL` | (will add after first deploy) | NO |

### Step 5: Generate JWT_SECRET ⏱️ 1 minute
Run in PowerShell:
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Copy the output and use as `JWT_SECRET` value in Vercel

- [ ] JWT_SECRET added to Vercel

---

## PART 3: Handle File Uploads ⏱️ 15 minutes

### Step 6: Implement MongoDB GridFS for File Storage
Files uploaded to local `/uploads` folder **WILL BE LOST** on Vercel.

**Option A: MongoDB GridFS (Recommended)** ⏱️ 15 min
- [ ] Read: [GRIDFS_MIGRATION.md](./GRIDFS_MIGRATION.md)
- [ ] Install: `npm install multer-gridfs-storage`
- [ ] Create: `backend/config/gridfs.js`
- [ ] Update upload routes
- [ ] Test locally
- [ ] Deploy

**Option B: Cloudinary (Better for Images)** ⏱️ 20 min
- [ ] Create Cloudinary account (free)
- [ ] Install: `npm install cloudinary multer-storage-cloudinary`
- [ ] Update routes
- [ ] Test locally

**Option C: AWS S3** ⏱️ 30 min
- [ ] Create AWS account
- [ ] Setup S3 bucket
- [ ] Install: `npm install aws-sdk`
- [ ] Update routes

- [ ] File upload solution implemented and tested

---

## PART 4: Data Backup & Verification ⏱️ 10 minutes

### Step 7: Backup All Data
```bash
cd backend
node export_data.js
```
- [ ] Check `backups/` folder created
- [ ] Verify backup contains all collections

### Step 8: Verify Data is Ready
```bash
cd backend
node migrate_to_production.js
```
- [ ] Check `migration_report.json` generated
- [ ] Verify all collections listed
- [ ] Total document count noted

---

## PART 5: Pre-Deployment Testing ⏱️ 10 minutes

### Step 9: Test with Production MongoDB URI Locally
```bash
# In backend/.env, use PRODUCTION MongoDB URI temporarily
# Run your app locally
npm run dev

# Test endpoints
curl http://localhost:5000/api/certificates
curl http://localhost:5000/api/contact

# Test admin login
# Access http://localhost:3000/admin

# Test file uploads (if GridFS ready)
```

- [ ] API responds correctly
- [ ] Database connection works
- [ ] Admin authentication works
- [ ] All collections accessible

---

## PART 6: Deploy to Vercel ⏱️ 5 minutes

### Step 10: Deploy to Production
- [ ] All environment variables set in Vercel
- [ ] GridFS (or alternative) implemented
- [ ] Backup completed
- [ ] Local testing passed
- [ ] Push code to GitHub
- [ ] Vercel auto-deploys (check dashboard)

---

## PART 7: Post-Deployment Verification ⏱️ 10 minutes

### Step 11: Verify Production Deployment
Get your Vercel URL from the deployment success page.

```bash
# Test API (replace with your domain)
curl https://your-domain.vercel.app/api/certificates

# Test contact form
curl -X POST https://your-domain.vercel.app/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","subject":"Test","message":"Test"}'

# Check logs
# Open: https://vercel.com/dashboard → Deployments → [Your deployment] → Logs
```

- [ ] Frontend loads correctly
- [ ] API endpoints respond
- [ ] Data appears from MongoDB
- [ ] Contact form works
- [ ] File uploads work (if configured)
- [ ] Admin panel accessible
- [ ] No errors in Vercel logs

---

## 🎯 Summary: Time Required

| Task | Time | Status |
|------|------|--------|
| 1. Rotate MongoDB Password | 5 min | ⏳ |
| 2. Update .env | 2 min | ⏳ |
| 3. MongoDB Network Setup | 3 min | ⏳ |
| 4. Vercel Environment Vars | 5 min | ⏳ |
| 5. JWT_SECRET | 1 min | ⏳ |
| 6. File Uploads (GridFS) | 15 min | ⏳ |
| 7. Data Backup | 5 min | ⏳ |
| 8. Data Verification | 5 min | ⏳ |
| 9. Local Testing | 10 min | ⏳ |
| 10. Deploy to Vercel | 5 min | ⏳ |
| 11. Production Verification | 10 min | ⏳ |
| **TOTAL** | **~65 minutes** | ⏳ |

---

## 📋 Final Checklist Before Going Live

- [ ] MongoDB password rotated
- [ ] All environment variables in Vercel
- [ ] GridFS implemented and tested
- [ ] Data backed up
- [ ] Backup verified (migration_report.json)
- [ ] Local testing passed
- [ ] Deployed to Vercel successfully
- [ ] API responses correct in production
- [ ] All data appears correctly
- [ ] Admin panel works
- [ ] File uploads work
- [ ] No errors in Vercel logs
- [ ] Database access whitelist configured

---

## 🚀 READY FOR PRODUCTION! ✅

Once all items are checked, your app is:
- ✓ Secure (rotated credentials)
- ✓ Backed up (local backups saved)
- ✓ Data-safe (GridFS or cloud storage)
- ✓ Deployed (live on Vercel)
- ✓ Verified (tests passed)

---

## 🆘 If Something Goes Wrong

**Database Connection Failed?**
1. Verify MongoDB password is correct
2. Check IP whitelist includes `0.0.0.0/0`
3. Verify connection string format
4. Check Vercel logs for error details

**Uploads Not Working?**
1. Verify GridFS configured correctly
2. Check multer routes updated
3. Review backend logs
4. See [GRIDFS_MIGRATION.md](./GRIDFS_MIGRATION.md)

**Need to Rollback?**
1. Go to Vercel → Deployments
2. Find previous working version
3. Click "Promote to Production"
4. Restore data from backup if needed

---

**Let's make your portfolio live! 🚀**

Start with PART 1 and work through systematically.
