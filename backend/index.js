const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

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
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Multer config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/portfolio';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('Successfully connected to MongoDB.'))
  .catch((error) => console.error('MongoDB connection error:', error));

// Routes
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Basic validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    // Create new contact message
    const newContact = new Contact({
      name,
      email,
      subject,
      message
    });

    await newContact.save();

    res.status(201).json({ message: 'Message sent successfully!' });
  } catch (error) {
    console.error('Error saving contact message:', error);
    res.status(500).json({ error: 'An error occurred while sending the message. Please try again later.' });
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
app.post('/api/certificates', upload.fields([{ name: 'image', maxCount: 1 }, { name: 'pdf', maxCount: 1 }]), async (req, res) => {
  try {
    const { title, category, certificateType, organization, issueDate, certificateId, description } = req.body;
    
    let imageUrl = '';
    let pdfUrl = '';

    if (req.files && req.files['image'] && req.files['image'][0]) {
      imageUrl = `/uploads/${req.files['image'][0].filename}`;
    }
    if (req.files && req.files['pdf'] && req.files['pdf'][0]) {
      pdfUrl = `/uploads/${req.files['pdf'][0].filename}`;
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
    res.status(201).json({ message: 'Certificate added successfully', certificate: newCertificate });
  } catch (error) {
    console.error('Error adding certificate:', error);
    res.status(500).json({ error: 'Failed to add certificate' });
  }
});

// Update certificate
app.put('/api/certificates/:id', upload.fields([{ name: 'image', maxCount: 1 }, { name: 'pdf', maxCount: 1 }]), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, category, certificateType, organization, issueDate, certificateId, description } = req.body;

    const certificate = await Certificate.findById(id);
    if (!certificate) {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    if (req.files && req.files['image'] && req.files['image'][0]) {
      certificate.imageUrl = `/uploads/${req.files['image'][0].filename}`;
    } else if (req.body.imageUrl) {
      certificate.imageUrl = req.body.imageUrl;
    }

    if (req.files && req.files['pdf'] && req.files['pdf'][0]) {
      certificate.pdfUrl = `/uploads/${req.files['pdf'][0].filename}`;
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
    res.json({ message: 'Certificate deleted successfully' });
  } catch (error) {
    console.error('Error deleting certificate:', error);
    res.status(500).json({ error: 'Failed to delete certificate' });
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

app.post('/api/skills', upload.single('icon'), async (req, res) => {
  try {
    const { name, category, level, description, displayOrder, iconUrl } = req.body;
    if (!name || !category || level == null) {
      return res.status(400).json({ error: 'Name, category and level are required.' });
    }

    let finalIconUrl = iconUrl || '';
    if (req.file) {
      finalIconUrl = `/uploads/${req.file.filename}`;
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
    res.status(201).json({ message: 'Skill added successfully', skill: newSkill });
  } catch (error) {
    console.error('Error adding skill:', error);
    res.status(500).json({ error: 'Failed to add skill' });
  }
});

app.put('/api/skills/:id', upload.single('icon'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, level, description, displayOrder, iconUrl } = req.body;

    const skill = await Skill.findById(id);
    if (!skill) {
      return res.status(404).json({ error: 'Skill not found' });
    }

    if (req.file) {
      skill.iconUrl = `/uploads/${req.file.filename}`;
    } else if (iconUrl) {
      skill.iconUrl = iconUrl;
    }

    skill.name = name || skill.name;
    skill.category = category || skill.category;
    skill.level = level != null ? Number(level) : skill.level;
    skill.displayOrder = displayOrder != null ? Number(displayOrder) : skill.displayOrder;
    skill.description = description || skill.description;

    await skill.save();
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
    res.json({ message: 'Skill restored successfully', skill });
  } catch (error) {
    console.error('Error restoring skill:', error);
    res.status(500).json({ error: 'Failed to restore skill' });
  }
});

// Project routes
app.get('/api/projects', async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

app.post('/api/projects', upload.single('image'), async (req, res) => {
  try {
    const { title, problem, features, tech, github, demo, description } = req.body;
    let imageUrl = req.body.imageUrl || '';

    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
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
      problem: problem || '',
      features: parsedFeatures,
      tech: tech ? tech.split(',').map((item) => item.trim()).filter(Boolean) : [],
      github: github || '',
      demo: demo || '',
      description: description || ''
    });

    await newProject.save();
    res.status(201).json({ message: 'Project added successfully', project: newProject });
  } catch (error) {
    console.error('Error adding project:', error);
    res.status(500).json({ error: 'Failed to add project' });
  }
});

app.put('/api/projects/:id', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, problem, features, tech, github, demo, description } = req.body;

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (req.file) {
      project.imageUrl = `/uploads/${req.file.filename}`;
    } else if (req.body.imageUrl) {
      project.imageUrl = req.body.imageUrl;
    }

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

    await project.save();
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
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'Failed to delete project' });
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

app.post('/api/achievements', async (req, res) => {
  try {
    const { title, description, icon, color } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'Title is required.' });
    }

    const newAchievement = new Achievement({
      title,
      description: description || '',
      icon: icon || 'Star',
      color: color || 'from-blue-500 to-indigo-600'
    });

    await newAchievement.save();
    res.status(201).json({ message: 'Achievement added successfully', achievement: newAchievement });
  } catch (error) {
    console.error('Error adding achievement:', error);
    res.status(500).json({ error: 'Failed to add achievement' });
  }
});

app.put('/api/achievements/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, icon, color } = req.body;

    const achievement = await Achievement.findById(id);
    if (!achievement) {
      return res.status(404).json({ error: 'Achievement not found' });
    }

    achievement.title = title || achievement.title;
    achievement.description = description || achievement.description;
    achievement.icon = icon || achievement.icon;
    achievement.color = color || achievement.color;

    await achievement.save();
    res.json({ message: 'Achievement updated successfully', achievement });
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

app.post('/api/resume', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    
    // Check if a resume already exists and optionally delete old file
    const oldResume = await Resume.findOne();
    if (oldResume) {
      await Resume.findByIdAndDelete(oldResume._id);
      // optionally delete the old file from fs here
    }

    const newResume = new Resume({
      filename: req.file.filename,
      originalName: req.file.originalname,
      url: `/uploads/${req.file.filename}`
    });

    await newResume.save();
    res.status(201).json(newResume);
  } catch (error) {
    console.error('Error uploading resume:', error);
    res.status(500).json({ error: 'Failed to upload resume' });
  }
});

app.delete('/api/resume/:id', async (req, res) => {
  try {
    const resume = await Resume.findByIdAndDelete(req.params.id);
    if (!resume) return res.status(404).json({ error: 'Resume not found' });
    res.status(200).json({ message: 'Resume deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete resume' });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
