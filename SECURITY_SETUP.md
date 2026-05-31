# 🔐 SECURITY: Database Credentials & Setup

## ⚠️ IMMEDIATE ACTION REQUIRED

If your MongoDB credentials were exposed, **rotate them immediately**:

### Step 1: Change MongoDB Password
1. Go to: https://cloud.mongodb.com
2. Select your project → Database Access
3. Find user `rahulmahaseth700_db_user`
4. Click "Edit" → Generate New Password
5. Copy new password (save it securely)
6. Click "Update User"

### Step 2: Update Vercel Environment Variables
1. Go to: https://vercel.com/dashboard
2. Select your project
3. Settings → Environment Variables
4. Update `MONGODB_URI` with new password:
   ```
   mongodb+srv://rahulmahaseth700_db_user:YOUR_NEW_PASSWORD@cluster0.viz4lim.mongodb.net/portfolio?retryWrites=true&w=majority
   ```
5. Click "Save" → Redeploy

---

## ✅ Correct Environment Setup

### Backend `.env` (LOCAL - NEVER COMMIT)
```env
PORT=5000
MONGODB_URI=mongodb+srv://rahulmahaseth700_db_user:YOUR_NEW_PASSWORD@cluster0.viz4lim.mongodb.net/portfolio?retryWrites=true&w=majority
ADMIN_EMAIL=mahasethrahul7@gmail.com
NODE_ENV=development
JWT_SECRET=your_random_dev_secret_here
```

### Vercel Environment Variables (PRODUCTION)
Set these in Vercel Dashboard → Settings → Environment Variables:

| Variable | Value |
|----------|-------|
| `MONGODB_URI` | `mongodb+srv://rahulmahaseth700_db_user:YOUR_NEW_PASSWORD@cluster0.viz4lim.mongodb.net/portfolio?retryWrites=true&w=majority` |
| `NODE_ENV` | `production` |
| `JWT_SECRET` | (Generate a random strong secret) |
| `ADMIN_EMAIL` | `mahasethrahul7@gmail.com` |
| `VITE_API_URL` | `https://your-vercel-domain.vercel.app` |

---

## 🌍 MongoDB Network Access

Allow Vercel to connect:

1. Go to: https://cloud.mongodb.com
2. Network Access (left sidebar)
3. Add IP Address
4. Add Entry: `0.0.0.0/0` (allows all IPs)
   - **Note:** For production, restrict to Vercel's specific IPs only
5. Click Confirm

---

## 📁 Critical: File Upload Migration

Your uploaded files (certificates, resume, images) **WILL BE LOST** on Vercel because it's serverless.

### Recommended: MongoDB GridFS

Store files directly in MongoDB - no extra service needed.

```javascript
// Example: Save file to GridFS
const mongoose = require('mongoose');
const GridFSBucket = require('mongodb').GridFSBucket;

const bucket = new GridFSBucket(mongoose.connection.db);
const uploadStream = bucket.openUploadStream('filename');

// In your route:
app.post('/api/upload', upload.single('file'), async (req, res) => {
  const bucket = new GridFSBucket(mongoose.connection.db);
  
  fs.createReadStream(req.file.path)
    .pipe(bucket.openUploadStream(req.file.originalname))
    .on('finish', () => {
      res.json({ success: true, filename: req.file.originalname });
    });
});
```

### Alternative: Cloudinary (for images)

```bash
npm install cloudinary multer-storage-cloudinary
```

Better for images/certificates - automatic optimization & CDN.

### Alternative: AWS S3

Industry standard but requires AWS account setup.

---

## 🔑 How to Generate JWT_SECRET

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and use as `JWT_SECRET` in environment variables.

---

## ✅ Security Checklist

- [ ] Changed MongoDB password in MongoDB Atlas
- [ ] Updated MONGODB_URI in Vercel with new password
- [ ] Generated JWT_SECRET
- [ ] Added JWT_SECRET to Vercel environment variables
- [ ] Added IP whitelist (0.0.0.0/0) to MongoDB Network Access
- [ ] `.env` files are in `.gitignore` (NOT committed to Git)
- [ ] Never paste credentials in chat/GitHub/emails
- [ ] Review who has access to Vercel project
- [ ] Review who has access to MongoDB cluster

---

## 🚨 If Credentials Were Already Leaked

**Immediate steps:**
1. ✓ Rotate MongoDB password (done above)
2. ✓ Regenerate JWT_SECRET
3. Consider if any unauthorized access occurred
4. Review MongoDB activity logs: https://cloud.mongodb.com → Activity Feed
5. Monitor database for suspicious queries

---

## 🔗 Helpful Resources

- MongoDB Security: https://docs.mongodb.com/manual/security/
- Vercel Secrets: https://vercel.com/docs/projects/environment-variables/securing-environment-variables
- GridFS: https://www.mongodb.com/docs/manual/core/gridfs/
- Cloudinary: https://cloudinary.com/
- JWT: https://jwt.io/

---

**Your application is secure once these steps are completed! 🔒**
