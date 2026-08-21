const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const nodemailer = require('nodemailer');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const NodeCache = require('node-cache');

const portfolioCache = new NodeCache({ stdTTL: 600 });
const invalidatePortfolioCache = () => portfolioCache.del('portfolioData');

const Contact = require('./models/Contact');
const Certificate = require('./models/Certificate');
const AcademicCertificate = require('./models/AcademicCertificate');
const Skill = require('./models/Skill');
const Project = require('./models/Project');
const Achievement = require('./models/Achievement');
const Stat = require('./models/Stat');
const Timeline = require('./models/Timeline');
const Experience = require('./models/Experience');
const Education = require('./models/Education');
const Nav = require('./models/Nav');
const Setting = require('./models/Setting');
const About = require('./models/About');
const Resume = require('./models/Resume');
const Visitor = require('./models/Visitor');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const xss = require('xss');
const crypto = require('crypto');
const app = express();

// Lightweight health check endpoint for Render / UptimeRobot
// Placed before all middlewares to ensure it responds as fast as possible.
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Trust one hop of reverse proxy (nginx, Cloudflare, etc.) so req.ip is populated correctly
app.set('trust proxy', 1);

/**
 * getClientIp — returns the real client IP.
 * Handles comma-separated X-Forwarded-For lists and strips port / IPv6 prefix.
 */
const getClientIp = (req) => {
  const forwarded = req.headers['x-forwarded-for'];
  let ip;
  if (forwarded) {
    // x-forwarded-for can be "client, proxy1, proxy2" — take the leftmost (real client)
    ip = forwarded.split(',')[0].trim();
  } else {
    ip = req.ip || req.socket.remoteAddress || '';
  }
  // Strip IPv6-mapped IPv4 prefix (::ffff:1.2.3.4 → 1.2.3.4)
  if (ip.startsWith('::ffff:')) ip = ip.slice(7);
  // Convert IPv6 localhost to IPv4
  if (ip === '::1') ip = '127.0.0.1';
  return ip || 'unknown';
};

app.disable('x-powered-by');

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "blob:", "http://localhost:5001", process.env.FRONTEND_URL].filter(Boolean),
      connectSrc: ["'self'", "http://localhost:5001", process.env.FRONTEND_URL].filter(Boolean),
      fontSrc: ["'self'", "data:"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));

// Security: Additional headers
app.use((req, res, next) => {
  res.setHeader('Permissions-Policy', 'camera=(self), geolocation=(self), microphone=()');
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    if (req.headers['x-forwarded-proto'] !== 'https' && req.hostname !== 'localhost') {
      return res.redirect(`https://${req.hostname}${req.url}`);
    }
  }
  next();
});

app.use(cookieParser());
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  process.env.FRONTEND_URL
].filter(Boolean);

// CORS
app.use(cors({
  origin: function (origin, callback) {
    const cleanOrigin = origin ? origin.replace(/\/$/, '') : '';
    const cleanAllowed = allowedOrigins.map(url => url ? url.replace(/\/$/, '') : '');
    
    // Strict regex for vercel.app and custom domain to prevent subdomain takeovers
    const isVercel = /^https:\/\/.*\.vercel\.app$/.test(cleanOrigin);
    const isCustomDomain = /^https:\/\/(.*\.)?rahulmahaseth\.com\.np$/.test(cleanOrigin);

    if (
      !origin || 
      cleanAllowed.indexOf(cleanOrigin) !== -1 || 
      isVercel ||
      isCustomDomain
    ) {
      callback(null, true);
    } else {
      console.warn('Blocked by CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Body parser
app.use(express.json({ limit: '10kb' }));
app.use(compression());

// Custom Injection (NoSQL + XSS) & HPP Guard for Express 5
// Express 5 makes req.query read-only, so we MUST mutate properties in-place.
const sanitizeObj = (obj) => {
  if (typeof obj !== 'object' || obj === null) return;
  const keys = Object.keys(obj);
  for (const key of keys) {
    let newKey = key;
    
    // 1. NoSQL Injection Protection: strip '$' and '.' from object keys
    if (key.includes('$') || key.includes('.')) {
      newKey = key.replace(/[\$\.]/g, '');
      obj[newKey] = obj[key];
      delete obj[key];
    }
    
    // 2. Recursion for nested objects or strings
    if (typeof obj[newKey] === 'object' && obj[newKey] !== null) {
      sanitizeObj(obj[newKey]);
    } else if (typeof obj[newKey] === 'string') {
      obj[newKey] = xss(obj[newKey]); // XSS protection
    }
  }
};

app.use((req, res, next) => {
  if (req.body) sanitizeObj(req.body);
  if (req.params) sanitizeObj(req.params);
  if (req.query) {
    // We cannot reassign req.query in Express 5, so we mutate it in-place
    const keys = Object.keys(req.query);
    for (let key of keys) {
      // HPP protection: take the last array element if query param is duplicated
      if (Array.isArray(req.query[key])) {
        req.query[key] = req.query[key][req.query[key].length - 1]; 
      }
    }
    sanitizeObj(req.query);
  }
  next();
});

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const { v4: uuidv4 } = require('uuid');
const fileType = require('file-type');

// Multer config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, uuidv4() + ext);
  }
});
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

const validateUpload = async (req, res, next) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];
  
  const validateFile = async (file) => {
    const buffer = fs.readFileSync(file.path);
    const type = await fileType.fromBuffer(buffer);
    if (!type || !allowedMimeTypes.includes(type.mime)) {
      fs.unlinkSync(file.path);
      throw new Error('Invalid file type detected by magic bytes.');
    }
  };

  try {
    if (req.file) {
      await validateFile(req.file);
    }
    if (req.files) {
      for (const key in req.files) {
        for (const file of req.files[key]) {
          await validateFile(file);
        }
      }
    }
    next();
  } catch (err) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    if (req.files) {
      for (const key in req.files) {
        for (const file of req.files[key]) {
          if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
        }
      }
    }
    res.status(400).json({ error: err.message || 'Invalid file upload' });
  }
};


const sharp = require('sharp');
const { uploadToCloudinary, deleteFromCloudinary } = require('./utils/cloudinary');

const cloudinaryUploadMiddleware = async (req, res, next) => {
  try {
    const processUpload = async (file) => {
      let folder = 'portfolio_uploads';
      if (req.path.includes('/api/projects')) folder = 'projects';
      else if (req.path.includes('/api/certificates')) folder = 'certificates';
      else if (req.path.includes('/api/academic-certificates')) folder = 'academic-certificates';
      else if (req.path.includes('/api/experience')) folder = 'experience';
      else if (req.path.includes('/api/resume')) folder = 'resume';
      else if (req.path.includes('/api/about')) folder = 'about';
      else if (req.path.includes('/api/auth/login')) folder = 'security';
      else if (req.path.includes('/api/skills')) folder = 'skills';
      else if (req.path.includes('/api/achievements')) folder = 'achievements';
      if (file.path && fs.existsSync(file.path)) {
        let resourceType = 'auto';
        if (file.mimetype && file.mimetype.startsWith('video/')) {
          resourceType = 'video';
        }
        const result = await uploadToCloudinary(file.path, folder, resourceType);
        file.cloudinaryUrl = result.secure_url;
        file.cloudinaryId = result.public_id;
      }
    };
    if (req.file) await processUpload(req.file);
    if (req.files) {
      for (const key in req.files) {
        for (const file of req.files[key]) {
          await processUpload(file);
        }
      }
    }
    next();
  } catch (err) {
    console.error('Cloudinary upload failed:', err);
    next(err);
  }
};

const optimizeUploads = async (req, res, next) => {
  try {
    const processFile = async (file) => {
      if (!file.mimetype.startsWith('image/')) return;
      if (file.mimetype === 'image/gif') return; // Skip gifs
      const originalPath = file.path;
      const ext = require('path').extname(originalPath);
      // Replace the last occurrence of the extension with _original+extension
      const newOriginalPath = originalPath.substring(0, originalPath.lastIndexOf(ext)) + '_original' + ext;
      
      fs.renameSync(originalPath, newOriginalPath);
      
      await sharp(newOriginalPath)
        .resize({ width: 1920, withoutEnlargement: true })
        .jpeg({ quality: 80, force: false })
        .png({ quality: 80, force: false })
        .webp({ quality: 80, force: false })
        .toFile(originalPath);
    };

    if (req.file) await processFile(req.file);
    if (req.files) {
      for (const key in req.files) {
        for (const file of req.files[key]) {
          await processFile(file);
        }
      }
    }
    next();
  } catch (err) {
    console.error('Image optimization failed:', err);
    next(err);
  }
};

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/portfolio';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('Successfully connected to MongoDB.'))
  .catch((error) => console.error('MongoDB connection error:', error));

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const useragent = require('express-useragent');
const geoip = require('geoip-lite');
const Admin = require('./models/Admin');
const SecurityLog = require('./models/SecurityLog');
const AuditLog = require('./models/AuditLog');

app.use(useragent.express());

const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex');
if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
  console.warn('WARNING: JWT_SECRET is not defined. Sessions will invalidate on server restart.');
}

const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per window
  message: { error: 'Too many login attempts, please try again after 15 minutes' }
});

// /api/auth/login
app.post('/api/auth/login', loginRateLimiter, upload.single('snapshot'), validateUpload, optimizeUploads, cloudinaryUploadMiddleware, async (req, res) => {
  try {
    const { password } = req.body;
    const ip = getClientIp(req);
    const geo = geoip.lookup(ip);
    
    let admin = await Admin.findOne();
    if (!admin) {
      // If no admin exists, create one with default password
      const initialPassword = process.env.INITIAL_ADMIN_PASSWORD || crypto.randomBytes(16).toString('hex');
      const hashed = await bcrypt.hash(initialPassword, 10);
      admin = new Admin({ email: process.env.ADMIN_EMAIL || 'admin@example.com', password: hashed });
      await admin.save();
      if (!process.env.INITIAL_ADMIN_PASSWORD) {
        console.log(`\n=== ADMIN CREATED. Password: ${initialPassword} ===\n`);
      }
    }

    const logEntry = new SecurityLog({
      email: admin.email,
      ip,
      browser: req.useragent?.browser,
      os: req.useragent?.os,
      device: req.useragent?.isMobile ? 'Mobile' : 'Desktop',
      location: geo ? { country: geo.country, region: geo.region, city: geo.city, ll: geo.ll } : undefined,
    });

    if (req.file) {
      logEntry.snapshotUrl = req.file.cloudinaryUrl;
    }

    if (admin.lockUntil && admin.lockUntil > Date.now()) {
      logEntry.status = 'failure';
      await logEntry.save();
      return res.status(403).json({ error: 'Account locked. Try again later.' });
    }

    const isMatch = await bcrypt.compare(password || '', admin.password);
    if (!isMatch) {
      admin.loginAttempts += 1;
      if (admin.loginAttempts >= 5) {
        admin.lockUntil = Date.now() + 15 * 60 * 1000; // 15 mins
      }
      await admin.save();
      
      logEntry.status = 'failure';
      await logEntry.save();
      
      return res.status(401).json({ error: 'Invalid password' });
    }

    // Success
    admin.loginAttempts = 0;
    admin.lockUntil = undefined;
    await admin.save();

    // Check if new device
    const pastLogins = await SecurityLog.find({ 
      ip, browser: logEntry.browser, status: 'success' 
    });
    logEntry.isNewDevice = pastLogins.length === 0;
    logEntry.status = 'success';
    await logEntry.save();

    const token = jwt.sign({ email: admin.email }, JWT_SECRET, { expiresIn: '1h' });
    
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 3600000,
      path: '/'
    });

    res.json({ message: 'Logged in successfully', isNewDevice: logEntry.isNewDevice });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token', { 
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  });
  res.json({ message: 'Logged out' });
});

app.get('/api/auth/check', (req, res) => {
  const token = req.cookies?.token;
  if (!token) return res.json({ authenticated: false });
  try {
    jwt.verify(token, JWT_SECRET);
    res.json({ authenticated: true });
  } catch (err) {
    res.json({ authenticated: false });
  }
});

// CSRF Token Route
app.get('/api/auth/csrf-token', (req, res) => {
  const token = crypto.randomBytes(32).toString('hex');
  res.cookie('csrfToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 3600000,
    path: '/'
  });
  res.json({ csrfToken: token });
});

// Middleware for Auth
const verifyAdmin = (req, res, next) => {
  const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.adminEmail = decoded.email;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Middleware for Audit
const auditLog = async (req, res, next) => {
  res.on('finish', async () => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      let action = 'UNKNOWN';
      if (req.method === 'POST') action = 'CREATE';
      else if (req.method === 'PUT') action = 'UPDATE';
      else if (req.method === 'DELETE') action = 'DELETE';
      
      const parts = req.path.split('/');
      const entityType = parts[2] || 'UNKNOWN';
      const entityId = parts[3];

      try {
        await AuditLog.create({
          action,
          entityType,
          entityId,
          adminEmail: req.adminEmail,
          ip: getClientIp(req)
        });
      } catch (err) {
        console.error('Failed to create audit log:', err);
      }
    }
  });
  next();
};

// Apply auth and audit globally to modifying routes, EXCEPT auth and public POST routes
app.use((req, res, next) => {
  if (
    req.path.startsWith('/api/auth') || 
    (req.method === 'POST' && req.path === '/api/contact') || 
    (req.method === 'POST' && req.path === '/api/visitor/increment')
  ) {
    return next();
  }
  if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
    // CSRF Protection
    const tokenFromCookie = req.cookies?.csrfToken;
    const tokenFromHeader = req.headers['x-csrf-token'];
    if (!tokenFromCookie || !tokenFromHeader || tokenFromCookie !== tokenFromHeader) {
      return res.status(403).json({ error: 'CSRF token validation failed' });
    }
    return verifyAdmin(req, res, () => {
      return auditLog(req, res, next);
    });
  }
  next();
});

// Routes

app.get('/api/portfolio', async (req, res) => {
  try {
    const cachedData = portfolioCache.get('portfolioData');
    if (cachedData) {
      return res.json(cachedData);
    }

    const [
      skills,
      projects,
      certificates,
      achievements,
      experience,
      education,
      about,
      resume
    ] = await Promise.all([
      Skill.find({ isDeleted: false }).sort({ displayOrder: 1, category: 1, name: 1 }).lean(),
      Project.find().sort({ order: 1, createdAt: -1 }).lean(),
      Certificate.find().sort({ issueDate: -1 }).lean(),
      Achievement.find().sort({ createdAt: -1 }).lean(),
      Experience.find().sort({ startDate: -1 }).lean(),
      Education.find().sort({ startYear: -1 }).lean(),
      About.find().sort({ order: 1, createdAt: 1 }).lean(),
      Resume.findOne().sort({ createdAt: -1 }).lean()
    ]);

    const portfolioData = {
      skills,
      projects,
      certificates,
      achievements,
      experience,
      education,
      about,
      resume
    };

    portfolioCache.set('portfolioData', portfolioData);
    res.json(portfolioData);
  } catch (error) {
    console.error('Error fetching portfolio data:', error);
    res.status(500).json({ error: 'Failed to fetch portfolio data' });
  }
});

// Rate Limiter for contact form
const contactRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per `window` (here, per 15 minutes)
  message: { error: 'Too many messages sent from this IP, please try again after 15 minutes' }
});

// Nodemailer Transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.APP_PASSWORD
  }
});

app.post('/api/contact', contactRateLimiter, async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Basic validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    // Create new contact message in DB
    const newContact = new Contact({
      name,
      email,
      subject,
      message
    });
    await newContact.save();

    // Send email via Nodemailer
    if (process.env.EMAIL && process.env.APP_PASSWORD) {
      const mailOptions = {
        from: process.env.EMAIL,
        to: process.env.EMAIL,
        subject: `New Portfolio Contact: ${subject}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px;">
            <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">New Contact Message</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <h3 style="margin-top: 20px;">Message:</h3>
            <p style="background: #f9f9f9; padding: 15px; border-left: 4px solid #007bff; white-space: pre-wrap;">${message}</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="color: #666; font-size: 12px;"><strong>Received:</strong> ${new Date().toLocaleString()}</p>
          </div>
        `
      };
      await transporter.sendMail(mailOptions);
    }

    res.status(201).json({ message: 'Message sent successfully!' });
  } catch (error) {
    console.error('Error saving or sending contact message:', error);
    res.status(500).json({ error: 'An error occurred while sending the message. Please try again later.' });
  }
});

// Get all contact messages
app.get('/api/contact', async (req, res) => {
  try {
    const messages = await Contact.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    console.error('Error fetching contact messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Delete a contact message
app.delete('/api/contact/:id', async (req, res) => {
  try {
    await Contact.findByIdAndDelete(req.params.id);
    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Error deleting contact message:', error);
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

// Get all certificates
app.get('/api/certificates', async (req, res) => {
  try {
    const certificates = await Certificate.find().sort({ issueDate: -1 });
    res.json(certificates);
  } catch (error) {
    console.error('Error fetching certificates:', error);
    res.status(500).json({ error: 'Failed to fetch certificates' });
  }
});

// Add new certificate (Admin)
app.post('/api/certificates', upload.fields([{ name: 'image', maxCount: 1 }, { name: 'pdf', maxCount: 1 }]), optimizeUploads, cloudinaryUploadMiddleware, async (req, res) => {
  try {
    const { title, category, certificateType, organization, issueDate, certificateId, description } = req.body;
    
    let imageUrl = '';
    let pdfUrl = '';

    if (req.files && req.files['image'] && req.files['image'][0]) {
      imageUrl = req.files['image'][0].cloudinaryUrl;
    }
    if (req.files && req.files['pdf'] && req.files['pdf'][0]) {
      pdfUrl = req.files['pdf'][0].cloudinaryUrl;
    }

    if (!imageUrl && req.body.imageUrl) {
        imageUrl = req.body.imageUrl;
    }
    if (!pdfUrl && req.body.pdfUrl) {
        pdfUrl = req.body.pdfUrl;
    }

    const newCertificate = new Certificate({
      title,
      category,
      certificateType,
      organization,
      issueDate,
      certificateId,
      imageUrl,
      pdfUrl,
      description
    });

    await newCertificate.save();
    invalidatePortfolioCache();
    res.status(201).json({ message: 'Certificate added successfully', certificate: newCertificate });
  } catch (error) {
    console.error('Error adding certificate:', error);
    res.status(500).json({ error: 'Failed to add certificate' });
  }
});

// Update certificate
app.put('/api/certificates/:id', upload.fields([{ name: 'image', maxCount: 1 }, { name: 'pdf', maxCount: 1 }]), optimizeUploads, cloudinaryUploadMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, category, certificateType, organization, issueDate, certificateId, description } = req.body;

    const certificate = await Certificate.findById(id);
    if (!certificate) {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    if (req.files && req.files['image'] && req.files['image'][0]) {
      certificate.imageUrl = req.files['image'][0].cloudinaryUrl;
    } else if (req.body.imageUrl) {
      certificate.imageUrl = req.body.imageUrl;
    }

    if (req.files && req.files['pdf'] && req.files['pdf'][0]) {
      certificate.pdfUrl = req.files['pdf'][0].cloudinaryUrl;
    } else if (req.body.pdfUrl) {
      certificate.pdfUrl = req.body.pdfUrl;
    }

    certificate.title = title;
    certificate.category = category;
    certificate.certificateType = certificateType;
    certificate.organization = organization;
    certificate.issueDate = issueDate;
    certificate.certificateId = certificateId;
    certificate.description = description;

    await certificate.save();
    invalidatePortfolioCache();
    res.json({ message: 'Certificate updated successfully', certificate });
  } catch (error) {
    console.error('Error updating certificate:', error);
    res.status(500).json({ error: 'Failed to update certificate' });
  }
});

// Delete certificate
app.delete('/api/certificates/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const certificate = await Certificate.findByIdAndDelete(id);
    if (!certificate) {
      return res.status(404).json({ error: 'Certificate not found' });
    }
    invalidatePortfolioCache();
    res.json({ message: 'Certificate deleted successfully' });
  } catch (error) {
    console.error('Error deleting certificate:', error);
    res.status(500).json({ error: 'Failed to delete certificate' });
  }
});

// --- Vault Verification ---
app.post('/api/vault/verify', verifyAdmin, async (req, res) => {
  try {
    const { password } = req.body;
    const admin = await Admin.findOne();
    if (!admin) return res.status(401).json({ error: 'Unauthorized' });

    if (!admin.vaultPassword) {
      const initialVault = process.env.INITIAL_VAULT_PASSWORD;
      if (initialVault && password === initialVault) return res.json({ success: true });
      return res.status(401).json({ error: 'Incorrect vault password. Please set INITIAL_VAULT_PASSWORD in env.' });
    }

    const match = await bcrypt.compare(password, admin.vaultPassword);
    if (match) return res.json({ success: true });
    return res.status(401).json({ error: 'Incorrect vault password' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/vault/change', verifyAdmin, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const admin = await Admin.findOne();
    if (!admin) return res.status(401).json({ error: 'Unauthorized' });

    if (!admin.vaultPassword) {
      const initialVault = process.env.INITIAL_VAULT_PASSWORD;
      if (!initialVault || oldPassword !== initialVault) return res.status(401).json({ error: 'Incorrect old password' });
    } else {
      const match = await bcrypt.compare(oldPassword, admin.vaultPassword);
      if (!match) return res.status(401).json({ error: 'Incorrect old password' });
    }

    const salt = await bcrypt.genSalt(10);
    admin.vaultPassword = await bcrypt.hash(newPassword, salt);
    await admin.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// --- Academic Certificates API ---
app.get('/api/academic-certificates', verifyAdmin, async (req, res) => {
  try {
    const certs = await AcademicCertificate.find().sort({ createdAt: -1 });
    res.json(certs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch academic certificates' });
  }
});

app.post('/api/academic-certificates', upload.fields([{ name: 'images', maxCount: 10 }, { name: 'pdfs', maxCount: 10 }]), validateUpload, optimizeUploads, cloudinaryUploadMiddleware, async (req, res) => {
  try {
    const { title, category } = req.body;
    const images = [];
    if (req.files && req.files.images) {
      for (const file of req.files.images) {
        images.push(file.cloudinaryUrl);
      }
    }
    const pdfs = [];
    if (req.files && req.files.pdfs) {
      for (const file of req.files.pdfs) {
        pdfs.push({ name: file.originalname, url: file.cloudinaryUrl });
      }
    }

    const cert = new AcademicCertificate({ title, category, images, pdfs });
    await cert.save();
    res.json({ message: 'Created successfully', cert });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create academic certificate' });
  }
});

app.put('/api/academic-certificates/:id', upload.fields([{ name: 'images', maxCount: 10 }, { name: 'pdfs', maxCount: 10 }]), validateUpload, optimizeUploads, cloudinaryUploadMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, category, retainedImages, retainedPdfs } = req.body;
    
    let images = [];
    if (retainedImages) {
      images = Array.isArray(retainedImages) ? retainedImages : [retainedImages];
    }
    if (req.files && req.files.images) {
      for (const file of req.files.images) {
        images.push(file.cloudinaryUrl);
      }
    }

    let pdfs = [];
    if (retainedPdfs) {
      try {
        const parsed = JSON.parse(retainedPdfs);
        pdfs = Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        // Fallback if not valid JSON
      }
    }
    if (req.files && req.files.pdfs) {
      for (const file of req.files.pdfs) {
        pdfs.push({ name: file.originalname, url: file.cloudinaryUrl });
      }
    }

    const cert = await AcademicCertificate.findByIdAndUpdate(
      id, 
      { title, category, images, pdfs, updatedAt: Date.now() },
      { new: true }
    );
    res.json({ message: 'Updated successfully', cert });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update academic certificate' });
  }
});

app.delete('/api/academic-certificates/:id', async (req, res) => {
  try {
    await AcademicCertificate.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete' });
  }
});

// Skill routes
app.get('/api/skills', async (req, res) => {
  try {
    const includeDeleted = req.query.includeDeleted === 'true';
    const filter = includeDeleted ? {} : { isDeleted: false };
    const skills = await Skill.find(filter).sort({ displayOrder: 1, category: 1, name: 1 });
    res.json(skills);
  } catch (error) {
    console.error('Error fetching skills:', error);
    res.status(500).json({ error: 'Failed to fetch skills' });
  }
});

app.post('/api/skills', upload.single('icon'), validateUpload, optimizeUploads, cloudinaryUploadMiddleware, async (req, res) => {
  try {
    const { name, category, level, description, displayOrder, iconUrl } = req.body;
    if (!name || !category || level == null) {
      return res.status(400).json({ error: 'Name, category and level are required.' });
    }

    let finalIconUrl = iconUrl || '';
    if (req.file) {
      finalIconUrl = req.file.cloudinaryUrl;
    }

    const newSkill = new Skill({
      name,
      category,
      level: Number(level),
      displayOrder: displayOrder != null ? Number(displayOrder) : 100,
      description: description || '',
      iconUrl: finalIconUrl
    });

    await newSkill.save();
    invalidatePortfolioCache();
    res.status(201).json({ message: 'Skill added successfully', skill: newSkill });
  } catch (error) {
    console.error('Error adding skill:', error);
    res.status(500).json({ error: 'Failed to add skill' });
  }
});

app.put('/api/skills/:id', upload.single('icon'), validateUpload, optimizeUploads, cloudinaryUploadMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, level, description, displayOrder, iconUrl } = req.body;

    const skill = await Skill.findById(id);
    if (!skill) {
      return res.status(404).json({ error: 'Skill not found' });
    }

    if (req.file) {
      skill.iconUrl = req.file.cloudinaryUrl;
    } else if (iconUrl) {
      skill.iconUrl = iconUrl;
    }

    skill.name = name || skill.name;
    skill.category = category || skill.category;
    skill.level = level != null ? Number(level) : skill.level;
    skill.displayOrder = displayOrder != null ? Number(displayOrder) : skill.displayOrder;
    skill.description = description || skill.description;

    await skill.save();
    invalidatePortfolioCache();
    res.json({ message: 'Skill updated successfully', skill });
  } catch (error) {
    console.error('Error updating skill:', error);
    res.status(500).json({ error: 'Failed to update skill' });
  }
});

app.delete('/api/skills/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const skill = await Skill.findById(id);
    if (!skill) {
      return res.status(404).json({ error: 'Skill not found' });
    }
    skill.isDeleted = true;
    skill.deletedAt = new Date();
    await skill.save();
    invalidatePortfolioCache();
    res.json({ message: 'Skill deleted successfully' });
  } catch (error) {
    console.error('Error deleting skill:', error);
    res.status(500).json({ error: 'Failed to delete skill' });
  }
});

app.post('/api/skills/:id/restore', async (req, res) => {
  try {
    const { id } = req.params;
    const skill = await Skill.findById(id);
    if (!skill) {
      return res.status(404).json({ error: 'Skill not found' });
    }
    skill.isDeleted = false;
    skill.deletedAt = undefined;
    await skill.save();
    invalidatePortfolioCache();
    res.json({ message: 'Skill restored successfully', skill });
  } catch (error) {
    console.error('Error restoring skill:', error);
    res.status(500).json({ error: 'Failed to restore skill' });
  }
});

// Project routes
app.get('/api/projects', async (req, res) => {
  try {
    const projects = await Project.find().sort({ order: 1, createdAt: -1 });
    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

app.post('/api/projects', upload.fields([{ name: 'image', maxCount: 1 }, { name: 'gallery', maxCount: 10 }]), validateUpload, optimizeUploads, cloudinaryUploadMiddleware, async (req, res) => {
  try {
    const { title, problem, features, tech, github, demo, description, order } = req.body;
    let imageUrl = req.body.imageUrl || '';
    let images = [];

    if (req.files && req.files.image && req.files.image.length > 0) {
      imageUrl = req.files.image[0].cloudinaryUrl;
    }
    
    if (req.files && req.files.gallery) {
      images = req.files.gallery.map(file => file.cloudinaryUrl);
    }

    let parsedFeatures = [];
    if (features) {
      try {
        parsedFeatures = JSON.parse(features);
        if (!Array.isArray(parsedFeatures)) throw new Error('Not array');
      } catch (e) {
        parsedFeatures = typeof features === 'string' ? features.split(',').map((item) => item.trim()).filter(Boolean) : [];
      }
    }

    const newProject = new Project({
      title,
      imageUrl,
      images,
      problem: problem || '',
      features: parsedFeatures,
      tech: tech ? tech.split(',').map((item) => item.trim()).filter(Boolean) : [],
      github: github || '',
      demo: demo || '',
      description: description || '',
      order: order ? parseInt(order, 10) : 0
    });

    await newProject.save();
    invalidatePortfolioCache();
    res.status(201).json({ message: 'Project added successfully', project: newProject });
  } catch (error) {
    console.error('Error adding project:', error);
    res.status(500).json({ error: 'Failed to add project' });
  }
});

app.put('/api/projects/:id', upload.fields([{ name: 'image', maxCount: 1 }, { name: 'gallery', maxCount: 10 }]), validateUpload, optimizeUploads, cloudinaryUploadMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, problem, features, tech, github, demo, description, order } = req.body;

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (req.files && req.files.image && req.files.image.length > 0) {
      project.imageUrl = req.files.image[0].cloudinaryUrl;
    } else if (req.body.imageUrl) {
      project.imageUrl = req.body.imageUrl;
    }
    
    // Existing images that the user wants to keep
    let existingImages = [];
    if (req.body.existingImages) {
      try {
        existingImages = JSON.parse(req.body.existingImages);
      } catch (e) {
        existingImages = typeof req.body.existingImages === 'string' ? [req.body.existingImages] : [];
      }
    } else if (req.body.existingImages === '[]') {
      existingImages = [];
    } else if (req.body.existingImages === undefined) {
      existingImages = project.images;
    }

    // New uploaded images
    let newGalleryImages = [];
    if (req.files && req.files.gallery) {
      newGalleryImages = req.files.gallery.map(file => file.cloudinaryUrl);
    }

    project.images = [...existingImages, ...newGalleryImages];

    let parsedFeatures = project.features;
    if (features) {
      try {
        parsedFeatures = JSON.parse(features);
        if (!Array.isArray(parsedFeatures)) throw new Error('Not array');
      } catch (e) {
        parsedFeatures = typeof features === 'string' ? features.split(',').map((item) => item.trim()).filter(Boolean) : project.features;
      }
    }

    project.title = title || project.title;
    project.problem = problem || project.problem;
    project.features = parsedFeatures;
    project.tech = tech ? tech.split(',').map((item) => item.trim()).filter(Boolean) : project.tech;
    project.github = github || project.github;
    project.demo = demo || project.demo;
    project.description = description || project.description;
    project.order = order !== undefined ? parseInt(order, 10) : project.order;

    await project.save();
    invalidatePortfolioCache();
    res.json({ message: 'Project updated successfully', project });
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

app.delete('/api/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findByIdAndDelete(id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    invalidatePortfolioCache();
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

const archiver = require('archiver');

app.get('/api/projects/:id/download-images', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const allImages = [];
    if (project.imageUrl) allImages.push(project.imageUrl);
    if (project.images && project.images.length > 0) {
      allImages.push(...project.images);
    }

    if (allImages.length === 0) {
      return res.status(404).json({ error: 'No images found for this project' });
    }

    res.attachment(`${project.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_images.zip`);
    const archive = archiver('zip', { zlib: { level: 0 } }); // No compression needed for JPEG/PNG
    archive.on('error', (err) => { throw err; });
    archive.pipe(res);

    for (let i = 0; i < allImages.length; i++) {
      let imageUrl = allImages[i];
      // get local path
      let localPath = path.join(__dirname, imageUrl.replace('/uploads', 'uploads'));
      let ext = path.extname(localPath);
      let originalPath = localPath.substring(0, localPath.lastIndexOf(ext)) + '_original' + ext;
      
      let fileToZip = fs.existsSync(originalPath) ? originalPath : (fs.existsSync(localPath) ? localPath : null);
      if (fileToZip) {
        archive.file(fileToZip, { name: `image_${i + 1}${path.extname(fileToZip)}` });
      }
    }

    await archive.finalize();
  } catch (error) {
    console.error('Error downloading images zip:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to generate zip file' });
    }
  }
});

// Achievement routes
app.get('/api/achievements', async (req, res) => {
  try {
    const achievements = await Achievement.find().sort({ createdAt: -1 });
    res.json(achievements);
  } catch (error) {
    console.error('Error fetching achievements:', error);
    res.status(500).json({ error: 'Failed to fetch achievements' });
  }
});

// Site stats
app.get('/api/site/stats', async (req, res) => {
  try {
    const stats = await Stat.find().sort({ order: 1 });
    res.json(stats);
  } catch (error) {
    console.error('Error fetching site stats:', error);
    res.status(500).json({ error: 'Failed to fetch site stats' });
  }
});

// Timeline entries (experience/education)
app.get('/api/timeline', async (req, res) => {
  try {
    const entries = await Timeline.find().sort({ order: 1 });
    res.json(entries);
  } catch (error) {
    console.error('Error fetching timeline:', error);
    res.status(500).json({ error: 'Failed to fetch timeline' });
  }
});

app.post('/api/timeline', async (req, res) => {
  try {
    const { date, title, location, description, type, iconUrl, order } = req.body;
    if (!date || !title) return res.status(400).json({ error: 'Date and title are required.' });

    const newTimeline = new Timeline({
      date, title, location, description, type, iconUrl, order: order || 100
    });
    await newTimeline.save();
    res.status(201).json({ message: 'Timeline entry added', timeline: newTimeline });
  } catch (error) {
    console.error('Error adding timeline:', error);
    res.status(500).json({ error: 'Failed to add timeline' });
  }
});

app.put('/api/timeline/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { date, title, location, description, type, iconUrl, order } = req.body;

    const timeline = await Timeline.findById(id);
    if (!timeline) return res.status(404).json({ error: 'Timeline not found' });

    timeline.date = date || timeline.date;
    timeline.title = title || timeline.title;
    timeline.location = location || timeline.location;
    timeline.description = description || timeline.description;
    timeline.type = type || timeline.type;
    timeline.iconUrl = iconUrl || timeline.iconUrl;
    timeline.order = order != null ? Number(order) : timeline.order;

    await timeline.save();
    res.json({ message: 'Timeline updated', timeline });
  } catch (error) {
    console.error('Error updating timeline:', error);
    res.status(500).json({ error: 'Failed to update timeline' });
  }
});

app.delete('/api/timeline/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const timeline = await Timeline.findByIdAndDelete(id);
    if (!timeline) return res.status(404).json({ error: 'Timeline not found' });
    res.json({ message: 'Timeline deleted successfully' });
  } catch (error) {
    console.error('Error deleting timeline:', error);
    res.status(500).json({ error: 'Failed to delete timeline' });
  }
});

// --- Experience routes ---
app.get('/api/experience', async (req, res) => {
  try {
    const entries = await Experience.find().sort({ startDate: -1 });
    res.json(entries);
  } catch (error) {
    console.error('Error fetching experience:', error);
    res.status(500).json({ error: 'Failed to fetch experience' });
  }
});

app.post('/api/experience', upload.single('image'), validateUpload, optimizeUploads, cloudinaryUploadMiddleware, async (req, res) => {
  try {
    const expData = { ...req.body };
    if (req.file) {
      expData.imageUrl = req.file.cloudinaryUrl;
    }
    const newExp = new Experience(expData);
    await newExp.save();
    invalidatePortfolioCache();
    res.status(201).json({ message: 'Experience added', experience: newExp });
  } catch (error) {
    console.error('Error adding experience:', error);
    res.status(500).json({ error: 'Failed to add experience' });
  }
});

app.put('/api/experience/:id', upload.single('image'), validateUpload, optimizeUploads, cloudinaryUploadMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const expData = { ...req.body };
    if (req.file) {
      expData.imageUrl = req.file.cloudinaryUrl;
    }
    const exp = await Experience.findByIdAndUpdate(id, expData, { new: true });
    if (!exp) return res.status(404).json({ error: 'Experience not found' });
    invalidatePortfolioCache();
    res.json({ message: 'Experience updated', experience: exp });
  } catch (error) {
    console.error('Error updating experience:', error);
    res.status(500).json({ error: 'Failed to update experience' });
  }
});

app.delete('/api/experience/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const exp = await Experience.findByIdAndDelete(id);
    if (!exp) return res.status(404).json({ error: 'Experience not found' });
    invalidatePortfolioCache();
    res.json({ message: 'Experience deleted' });
  } catch (error) {
    console.error('Error deleting experience:', error);
    res.status(500).json({ error: 'Failed to delete experience' });
  }
});

// --- Education routes ---
app.get('/api/education', async (req, res) => {
  try {
    const entries = await Education.find().sort({ startYear: -1 });
    res.json(entries);
  } catch (error) {
    console.error('Error fetching education:', error);
    res.status(500).json({ error: 'Failed to fetch education' });
  }
});

app.post('/api/education', async (req, res) => {
  try {
    const newEdu = new Education(req.body);
    await newEdu.save();
    invalidatePortfolioCache();
    res.status(201).json({ message: 'Education added', education: newEdu });
  } catch (error) {
    console.error('Error adding education:', error);
    res.status(500).json({ error: 'Failed to add education' });
  }
});

app.put('/api/education/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const edu = await Education.findByIdAndUpdate(id, req.body, { new: true });
    if (!edu) return res.status(404).json({ error: 'Education not found' });
    invalidatePortfolioCache();
    res.json({ message: 'Education updated', education: edu });
  } catch (error) {
    console.error('Error updating education:', error);
    res.status(500).json({ error: 'Failed to update education' });
  }
});

app.delete('/api/education/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const edu = await Education.findByIdAndDelete(id);
    if (!edu) return res.status(404).json({ error: 'Education not found' });
    invalidatePortfolioCache();
    res.json({ message: 'Education deleted' });
  } catch (error) {
    console.error('Error deleting education:', error);
    res.status(500).json({ error: 'Failed to delete education' });
  }
});

// Navigation links
app.get('/api/nav', async (req, res) => {
  try {
    const items = await Nav.find({ visible: true }).sort({ order: 1 });
    res.json(items);
  } catch (error) {
    console.error('Error fetching nav links:', error);
    res.status(500).json({ error: 'Failed to fetch nav links' });
  }
});

app.post('/api/nav', async (req, res) => {
  try {
    const { name, href, order, visible } = req.body;
    if (!name || !href) return res.status(400).json({ error: 'Name and href are required.' });

    const newNav = new Nav({
      name, href, order: order || 100, visible: visible !== undefined ? visible : true
    });
    await newNav.save();
    res.status(201).json({ message: 'Nav link added', nav: newNav });
  } catch (error) {
    console.error('Error adding nav link:', error);
    res.status(500).json({ error: 'Failed to add nav link' });
  }
});

app.put('/api/nav/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, href, order, visible } = req.body;

    const nav = await Nav.findById(id);
    if (!nav) return res.status(404).json({ error: 'Nav link not found' });

    nav.name = name || nav.name;
    nav.href = href || nav.href;
    nav.order = order != null ? Number(order) : nav.order;
    if (visible !== undefined) nav.visible = visible;

    await nav.save();
    res.json({ message: 'Nav link updated', nav });
  } catch (error) {
    console.error('Error updating nav link:', error);
    res.status(500).json({ error: 'Failed to update nav link' });
  }
});

app.delete('/api/nav/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const nav = await Nav.findByIdAndDelete(id);
    if (!nav) return res.status(404).json({ error: 'Nav link not found' });
    res.json({ message: 'Nav link deleted successfully' });
  } catch (error) {
    console.error('Error deleting nav link:', error);
    res.status(500).json({ error: 'Failed to delete nav link' });
  }
});

// Settings by key
app.get('/api/settings/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const setting = await Setting.findOne({ key });
    res.json(setting ? setting.value : null);
  } catch (error) {
    console.error('Error fetching setting:', error);
    res.status(500).json({ error: 'Failed to fetch setting' });
  }
});

// Create or update a setting (upsert)
app.post('/api/settings', async (req, res) => {
  try {
    const { key, value } = req.body;
    if (!key) return res.status(400).json({ error: 'Key is required' });

    const updated = await Setting.findOneAndUpdate(
      { key },
      { value },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({ message: 'Setting saved', setting: updated });
  } catch (error) {
    console.error('Error saving setting:', error);
    res.status(500).json({ error: 'Failed to save setting' });
  }
});

app.post('/api/achievements', upload.single('image'), validateUpload, optimizeUploads, cloudinaryUploadMiddleware, async (req, res) => {
  try {
    const { title, description, icon, color } = req.body;
    let imageUrl = req.body.imageUrl || '';
    if (req.file) {
      imageUrl = req.file.cloudinaryUrl;
    }
    
    if (!title) {
      return res.status(400).json({ error: 'Title is required.' });
    }

    const newAchievement = new Achievement({
      title,
      description: description || '',
      icon: icon || 'Star',
      color: color || 'from-blue-500 to-indigo-600',
      imageUrl
    });

    await newAchievement.save();
    invalidatePortfolioCache();
    res.status(201).json({ message: 'Achievement added successfully', achievement: newAchievement });
  } catch (error) {
    console.error('Error adding achievement:', error);
    res.status(500).json({ error: 'Failed to add achievement' });
  }
});
app.put('/api/achievements/:id', upload.single('image'), validateUpload, optimizeUploads, cloudinaryUploadMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    if (req.file) {
      updateData.imageUrl = req.file.cloudinaryUrl;
    }
    
    const updated = await Achievement.findByIdAndUpdate(id, updateData, { new: true });
    if (!updated) {
      return res.status(404).json({ error: 'Achievement not found' });
    }

    invalidatePortfolioCache();
    res.json({ message: 'Achievement updated successfully', achievement: updated });
  } catch (error) {
    console.error('Error updating achievement:', error);
    res.status(500).json({ error: 'Failed to update achievement' });
  }
});

app.delete('/api/achievements/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const achievement = await Achievement.findByIdAndDelete(id);
    if (!achievement) {
      return res.status(404).json({ error: 'Achievement not found' });
    }
    invalidatePortfolioCache();
    res.json({ message: 'Achievement deleted successfully' });
  } catch (error) {
    console.error('Error deleting achievement:', error);
    res.status(500).json({ error: 'Failed to delete achievement' });
  }
});

// About routes
app.get('/api/about', async (req, res) => {
  try {
    const aboutItems = await About.find().sort({ order: 1, createdAt: 1 });
    res.json(aboutItems);
  } catch (error) {
    console.error('Error fetching about items:', error);
    res.status(500).json({ error: 'Failed to fetch about items' });
  }
});

app.post('/api/about', async (req, res) => {
  try {
    const { title, content, order } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required.' });
    }

    const newAbout = new About({
      title,
      content,
      order: order != null ? Number(order) : 0
    });

    await newAbout.save();
    invalidatePortfolioCache();
    res.status(201).json({ message: 'About item added successfully', aboutItem: newAbout });
  } catch (error) {
    console.error('Error adding about item:', error);
    res.status(500).json({ error: 'Failed to add about item' });
  }
});

app.put('/api/about/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, order } = req.body;

    const aboutItem = await About.findById(id);
    if (!aboutItem) {
      return res.status(404).json({ error: 'About item not found' });
    }

    aboutItem.title = title || aboutItem.title;
    aboutItem.content = content || aboutItem.content;
    aboutItem.order = order != null ? Number(order) : aboutItem.order;

    await aboutItem.save();
    invalidatePortfolioCache();
    res.json({ message: 'About item updated successfully', aboutItem });
  } catch (error) {
    console.error('Error updating about item:', error);
    res.status(500).json({ error: 'Failed to update about item' });
  }
});

app.delete('/api/about/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const aboutItem = await About.findByIdAndDelete(id);
    if (!aboutItem) {
      return res.status(404).json({ error: 'About item not found' });
    }
    invalidatePortfolioCache();
    res.status(200).json({ message: 'About item deleted successfully' });
  } catch (error) {
    console.error('Error deleting about item:', error);
    res.status(500).json({ error: 'Failed to delete about item' });
  }
});

// Resume API routes
app.get('/api/resume', async (req, res) => {
  try {
    const resume = await Resume.findOne().sort({ createdAt: -1 });
    res.status(200).json(resume);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch resume' });
  }
});

app.post('/api/resume', upload.single('resume'), validateUpload, optimizeUploads, cloudinaryUploadMiddleware, async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    
    // Check if a resume already exists and optionally delete old file
    const oldResume = await Resume.findOne();
    if (oldResume) {
      await Resume.findByIdAndDelete(oldResume._id);
      
      // Delete old resume from Cloudinary
      const { deleteFromCloudinary } = require('./utils/cloudinary');
      if (oldResume.publicId) {
        await deleteFromCloudinary(oldResume.publicId, 'image');
        await deleteFromCloudinary(oldResume.publicId, 'raw'); // Fallback if it was raw
      } else if (oldResume.url) {
        // Fallback for old resumes without publicId
        const urlParts = oldResume.url.split('/');
        const filename = urlParts[urlParts.length - 1];
        const folderIndex = urlParts.indexOf('resume');
        if (folderIndex !== -1) {
          const publicId = urlParts.slice(folderIndex).join('/').split('.')[0];
          await deleteFromCloudinary(publicId, 'image');
          await deleteFromCloudinary(urlParts.slice(folderIndex).join('/'), 'raw');
        }
      }
    }

    const newResume = new Resume({
      filename: req.file.filename,
      originalName: req.file.originalname,
      url: req.file.cloudinaryUrl,
      publicId: req.file.cloudinaryId
    });

    await newResume.save();
    invalidatePortfolioCache();
    res.status(201).json(newResume);
  } catch (error) {
    console.error('Error uploading resume:', error);
    res.status(500).json({ error: 'Failed to upload resume' });
  }
});

app.delete('/api/resume/:id', async (req, res) => {
  try {
    const resume = await Resume.findByIdAndDelete(req.params.id);
    if (resume && resume.publicId) await deleteFromCloudinary(resume.publicId, 'raw');
    if (!resume) return res.status(404).json({ error: 'Resume not found' });
    invalidatePortfolioCache();
    res.status(200).json({ message: 'Resume deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete resume' });
  }
});

// Visitor API routes
app.get('/api/securityLogs', verifyAdmin, async (req, res) => {
  try {
    const logs = await SecurityLog.find().sort({ createdAt: -1 }).limit(100);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch security logs' });
  }
});

app.post('/api/securityLogs/bulk-action', verifyAdmin, async (req, res) => {
  try {
    const { action, ids } = req.body;
    if (!action || !ids || !Array.isArray(ids)) {
      return res.status(400).json({ error: 'Invalid request' });
    }

    if (action === 'archive') {
      await SecurityLog.updateMany({ _id: { $in: ids } }, { $set: { isPermanent: true } });
      res.json({ message: 'Logs archived permanently' });
    } else if (action === 'delete') {
      await SecurityLog.deleteMany({ _id: { $in: ids } });
      res.json({ message: 'Logs deleted successfully' });
    } else {
      res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to perform bulk action' });
  }
});

app.get('/api/auditLogs', verifyAdmin, async (req, res) => {
  try {
    const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(100);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

app.get('/api/visitor/count', async (req, res) => {
  try {
    let visitor = await Visitor.findOne();
    if (!visitor) {
      visitor = new Visitor({ count: 0 });
      await visitor.save();
    }
    res.json({ count: visitor.count });
  } catch (error) {
    console.error('Error fetching visitor count:', error);
    res.status(500).json({ error: 'Failed to fetch visitor count' });
  }
});

app.post('/api/visitor/increment', async (req, res) => {
  try {
    let visitor = await Visitor.findOne();
    if (!visitor) {
      visitor = new Visitor({ count: 1 });
    } else {
      visitor.count += 1;
    }
    await visitor.save();
    res.json({ count: visitor.count });
  } catch (error) {
    console.error('Error incrementing visitor count:', error);
    res.status(500).json({ error: 'Failed to increment visitor count' });
  }
});

// Since the frontend is hosted separately on Vercel, the backend acts strictly as an API.
// Catch all unhandled routes and return a clean 404 JSON response instead of crashing with ENOENT.
app.use((req, res) => {
  res.status(404).json({ error: 'API route not found or not supported.' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  const status = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal Server Error' 
    : err.message || 'Internal Server Error';
  res.status(status).json({ error: message });
});

// Start the server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Startup error handling
server.on('error', (err) => {
  console.error('Server failed to start:', err);
  process.exit(1);
});

// Process-level error handling
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});
