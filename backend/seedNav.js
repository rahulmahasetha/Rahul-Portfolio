const mongoose = require('mongoose');
require('dotenv').config();
const Nav = require('./models/Nav');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/portfolio';

const navLinks = [
  { name: 'Home', href: '#home', order: 10, visible: true },
  { name: 'About', href: '#about', order: 20, visible: true },
  { name: 'Skills', href: '#skills', order: 30, visible: true },
  { name: 'Projects', href: '#projects', order: 40, visible: true },
  { name: 'Experience', href: '#experience', order: 50, visible: true },
  { name: 'Certificates', href: '#certificates', order: 60, visible: true },
  { name: 'Contact', href: '#contact', order: 70, visible: true }
];

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB.');
    await Nav.deleteMany({});
    console.log('Cleared existing Nav links.');
    await Nav.insertMany(navLinks);
    console.log('Inserted default Nav links.');
    mongoose.connection.close();
  })
  .catch((error) => console.error('MongoDB connection error:', error));
