const mongoose = require('mongoose');

const pdfSchema = new mongoose.Schema({
  name: { type: String, required: true },
  url: { type: String, required: true }
}, { _id: false });

const academicCertificateSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  images: [{ type: String }],
  pdfs: [pdfSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AcademicCertificate', academicCertificateSchema);
