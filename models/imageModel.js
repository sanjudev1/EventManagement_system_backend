const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Original file name
  fileUrl: { type: String, required: true }, // Cloudinary file URL
  contentType: { type: String, required: true }, // MIME type
}, { timestamps: true }); // Adds createdAt and updatedAt timestamps automatically

module.exports = mongoose.model('Image', imageSchema);
