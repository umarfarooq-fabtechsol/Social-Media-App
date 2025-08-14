const express = require('express');
const authController = require('../controllers/authController');
const {
  initiateUpload,
  generatePresignedUrl,
  completeUpload
} = require('../controllers/uploadController');


const router = express.Router();

router.post('/initiate-upload', authController.protect, initiateUpload);
router.post('/generate-presigned-url', authController.protect, generatePresignedUrl);
router.post('/complete-upload', authController.protect, completeUpload);

module.exports = router;
