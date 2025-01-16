const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinaryConfig");
const path = require("path");

function uploadMiddleware(folderName) {
  const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: (req, file) => {
      const folderPath = `${folderName.trim()}`; // Update the folder path here
      const fileExtension = path.extname(file.originalname).substring(1);
      const publicId = `${file.fieldname}-${Date.now()}`;
     
      return {
        folder: folderPath,
        public_id: publicId,
        format: fileExtension,
      };
    },
  });

  return multer({
    storage: storage,
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
    },
  }).single('image'); 
}


module.exports = uploadMiddleware;