# Quick Start: Vercel Deployment

## ⏱️ 5-Minute Setup

### Step 1: Backup Your Data (2 min)
```bash
cd backend
node export_data.js
```
✓ Your data is now backed up in `backups/` folder

---

### Step 2: Setup MongoDB Atlas (2 min)
1. Go to https://www.mongodb.com/cloud/atlas
2. Create account (or login)
3. Create FREE cluster
4. Create database user
5. Whitelist your IP address
6. Get connection string (looks like: `mongodb+srv://user:pass@cluster.mongodb.net/portfolio?retryWrites=true&w=majority`)

---

### Step 3: Deploy to Vercel (1 min)
1. Go to https://vercel.com
2. Click "New Project"
3. Select your GitHub repository
4. Vercel auto-detects your setup
5. Click "Environment Variables" and add:

```
Name: MONGODB_URI
Value: mongodb+srv://user:password@cluster.mongodb.net/portfolio?retryWrites=true&w=majority

Name: ADMIN_EMAIL
Value: mahasethrahul7@gmail.com

Name: NODE_ENV
Value: production
```

6. Click "Deploy"

✓ Your app is deploying!

---

### Step 4: Verify Deployment (1 min)
After deployment completes:

```bash
# Get your Vercel URL from the deployment success page
curl https://your-domain.vercel.app/api/certificates

# Should return your data from MongoDB
```

---

## ⚠️ Important: File Uploads

**Your uploads will NOT persist** on Vercel because it's serverless.

### Migration Plan:
1. **Option A: MongoDB GridFS** (Recommended)
   - Store files in database
   - Automatic backups
   - No configuration needed

2. **Option B: AWS S3 / Cloud Storage**
   - Better for large files
   - Requires additional setup

**For now**: Ask admin to re-upload files after deployment, or implement GridFS migration.

---

## 🔍 Troubleshooting

### "MongoDB connection failed"
- [ ] Check MongoDB URI in environment variables
- [ ] Check IP whitelist includes Vercel IP (add `0.0.0.0/0` for testing)
- [ ] Verify username/password are correct
- [ ] Test connection locally first

### "Uploads not showing"
- [ ] This is expected with serverless
- [ ] Follow file upload migration plan above
- [ ] Store files in MongoDB instead

### "Build failed"
- [ ] Check build logs in Vercel dashboard
- [ ] Run `npm run build` locally to debug
- [ ] Ensure all dependencies are in package.json

### "Data disappeared"
- [ ] Don't panic! Restore from backup:
  ```bash
  mongorestore --uri="YOUR_MONGODB_URI" ./backups/[backup-folder]
  ```

---

## 📊 Monitoring

After deployment:
1. Check Vercel logs: Dashboard → Deployments → [Your deployment] → Logs
2. Monitor MongoDB: Atlas Dashboard → Metrics
3. Set up alerts for errors

---

## 🚀 Next Steps

1. ✓ Backup complete
2. ✓ MongoDB Atlas setup complete
3. ✓ Deployed to Vercel
4. ⏳ Test all features thoroughly
5. ⏳ Setup file upload solution (GridFS or S3)
6. ⏳ Configure custom domain (optional)
7. ⏳ Setup monitoring alerts

---

## 📞 Emergency Contacts

- Vercel Issues: https://vercel.com/support
- MongoDB Issues: https://www.mongodb.com/community/forums
- Check logs first for error details!

---

**Congratulations! Your app is deployed with zero data loss! 🎉**
