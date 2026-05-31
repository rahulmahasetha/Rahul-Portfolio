# File Upload Migration to GridFS

## ⚠️ Problem
Files stored in `/uploads` folder will disappear on Vercel after redeployment.

## ✅ Solution: MongoDB GridFS
Store files directly in MongoDB database. Automatic backup, no extra infrastructure.

---

## Step 1: Install Required Packages

```bash
cd backend
npm install multer-gridfs-storage
```

---

## Step 2: Create GridFS Configuration

Create `backend/config/gridfs.js`:

```javascript
const mongoose = require('mongoose');
const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
const path = require('path');

// Initialize GridFS Storage
const storage = new GridFsStorage({
  url: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/portfolio',
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      const filename = `${Date.now()}_${file.originalname}`;
      const fileInfo = {
        filename: filename,
        bucketName: 'uploads',
        metadata: {
          uploadedAt: new Date(),
          originalName: file.originalname,
          mimetype: file.mimetype
        }
      };
      resolve(fileInfo);
    });
  }
});

const upload = multer({ storage });

module.exports = { upload };
```

---

## Step 3: Update Backend Routes

Replace the old multer storage in `backend/index.js`:

### OLD CODE (Remove):
```javascript
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });
```

### NEW CODE (Add):
```javascript
const { upload } = require('./config/gridfs');
const { ObjectId } = require('mongodb');
```

---

## Step 4: Update Upload Routes

### Example: Certificate Upload

**OLD:**
```javascript
app.post('/api/certificates/upload', upload.single('image'), async (req, res) => {
  try {
    const { title, issuer } = req.body;
    const imageUrl = `/uploads/${req.file.filename}`;
    
    const certificate = new Certificate({
      title,
      issuer,
      imageUrl
    });
    
    await certificate.save();
    res.json(certificate);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

**NEW:**
```javascript
app.post('/api/certificates/upload', upload.single('image'), async (req, res) => {
  try {
    const { title, issuer } = req.body;
    
    // File is stored in GridFS with ID in req.file.id
    const imageUrl = `/api/uploads/${req.file.id}`;
    
    const certificate = new Certificate({
      title,
      issuer,
      imageUrl,
      fileId: req.file.id  // Store GridFS file ID
    });
    
    await certificate.save();
    res.json(certificate);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

---

## Step 5: Create Download/Retrieve Route

Add this to `backend/index.js`:

```javascript
app.get('/api/uploads/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    
    // Connect to GridFS
    const bucket = new (require('mongodb')).GridFSBucket(mongoose.connection.db, {
      bucketName: 'uploads'
    });
    
    // Check if file exists
    const files = await bucket.find({ _id: new ObjectId(fileId) }).toArray();
    
    if (!files || files.length === 0) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    const file = files[0];
    
    // Set response headers
    res.set('Content-Type', file.metadata?.mimetype || 'application/octet-stream');
    res.set('Content-Disposition', `inline; filename="${file.filename}"`);
    
    // Stream file from GridFS
    bucket.openDownloadStream(new ObjectId(fileId)).pipe(res);
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

---

## Step 6: Update Certificate Model

Add `fileId` field to `backend/models/Certificate.js`:

```javascript
const certificateSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  issuer: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  fileId: {
    type: Schema.Types.ObjectId,  // GridFS File ID
    ref: 'uploads.files'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});
```

---

## Step 7: Migration Script

Create `backend/migrate_uploads_to_gridfs.js`:

```javascript
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const { ObjectId } = require('mongodb');
require('dotenv').config();

const Certificate = require('./models/Certificate');
const Project = require('./models/Project');
const Resume = require('./models/Resume');

async function migrateUploads() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/portfolio');
    console.log('✓ Connected to MongoDB\n');

    const bucket = new (require('mongodb')).GridFSBucket(mongoose.connection.db, {
      bucketName: 'uploads'
    });

    const uploadsDir = path.join(__dirname, 'uploads');
    
    if (!fs.existsSync(uploadsDir)) {
      console.log('✓ No local uploads folder - migration not needed');
      return;
    }

    const files = fs.readdirSync(uploadsDir);
    console.log(`Found ${files.length} files to migrate\n`);

    for (const file of files) {
      const filePath = path.join(uploadsDir, file);
      const fileStream = fs.createReadStream(filePath);
      
      const uploadStream = bucket.openUploadStream(file, {
        metadata: {
          migratedAt: new Date(),
          originalPath: filePath
        }
      });

      fileStream.pipe(uploadStream)
        .on('finish', async () => {
          console.log(`✓ Migrated: ${file}`);
        })
        .on('error', (error) => {
          console.error(`✗ Error migrating ${file}:`, error);
        });
    }

    console.log('\n✓ Migration complete! Old files can be deleted from /uploads folder');
    
  } catch (error) {
    console.error('✗ Migration failed:', error);
  } finally {
    await mongoose.connection.close();
  }
}

migrateUploads();
```

**Run:**
```bash
node backend/migrate_uploads_to_gridfs.js
```

---

## Step 8: Update Frontend Image URLs

If your React components reference images:

**OLD:**
```jsx
<img src="/uploads/image.jpg" alt="Certificate" />
```

**NEW:**
```jsx
<img src={`/api/uploads/${fileId}`} alt="Certificate" />
```

---

## Step 9: Delete Local Uploads (After Migration)

Once migration is complete and tested:

```bash
rm -r backend/uploads
```

---

## ✅ Testing Locally

1. Test upload:
```bash
curl -F "image=@test.jpg" http://localhost:5000/api/certificates/upload
```

2. Verify file stored in GridFS:
```javascript
// In MongoDB:
db.uploads.files.find()
```

3. Download file:
```bash
curl http://localhost:5000/api/uploads/[fileId] --output test_download.jpg
```

---

## ✅ Deployment Checklist

- [ ] Installed `multer-gridfs-storage`
- [ ] Created `config/gridfs.js`
- [ ] Updated upload routes to use GridFS
- [ ] Created download route `/api/uploads/:fileId`
- [ ] Updated models with `fileId` field
- [ ] Created migration script
- [ ] Tested locally
- [ ] Migrated existing files (if any)
- [ ] Deleted local `/uploads` folder
- [ ] Deployed to Vercel

---

## Benefits of GridFS

✓ Files persist across Vercel redeployments  
✓ Automatic MongoDB backup  
✓ No additional infrastructure cost  
✓ Works with MongoDB free tier  
✓ Simple implementation  

---

## If You Prefer Cloudinary (Alternative)

For better image optimization and CDN:

```bash
npm install cloudinary multer-storage-cloudinary
```

See Cloudinary docs: https://cloudinary.com/documentation

---

**Your files are now cloud-safe! ☁️**
