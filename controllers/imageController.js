const Image = require('../models/imageModel');

exports.uploadImage = async (req, res) => {
    console.log("path",req.file.path);
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const { originalname, mimetype } = req.file;
    const fileUrl = req.file.path; // Cloudinary URL

    // Save the file URL and metadata to the database
    const image = new Image({
      name: originalname,
      fileUrl: fileUrl,
      contentType: mimetype,
    });

    await image.save();

    res.status(201).json({
      success: true,
      message: "Image uploaded successfully",
      image: { id: image._id, fileUrl: image.fileUrl },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getImage = async (req, res) => {
    try {
      const image = await Image.findById(req.params.id);
  
      if (!image) {
        return res.status(404).json({ error: "Image not found" });
      }
  
      res.status(200).json({
        success: true,
        image: {
          id: image._id,
          name: image.name,
          fileUrl: image.fileUrl,
          contentType: image.contentType,
        },
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  