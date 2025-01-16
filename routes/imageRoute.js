const express = require('express');
const multer = require('multer');
const { uploadImage, getImage } = require('../controllers/imageController');
const { auth } =require('../middleware/authMiddleware');
const uploadMiddleware = require('../middleware/uploadMiddleware');
const router = express.Router();

// const storage = multer.memoryStorage();
// const upload = multer({ storage });
const upload = uploadMiddleware("ImageAsserts")
router.post('/upload', auth,upload.single('image') ,uploadImage);
router.get('/:id', getImage);

module.exports = router;
