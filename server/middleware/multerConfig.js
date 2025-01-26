// Import required dependencies
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Create a storage configuration for multer
// @param {string} uploadDir - Directory name for uploads
const createStorage = (uploadDir) => multer.diskStorage({
  // Set the destination directory for file uploads
  destination: (req, file, cb) => {
    // Create upload directory if it doesn't exist
    fs.mkdirSync(`public/uploads/${uploadDir}`, { recursive: true });
    cb(null, `public/uploads/${uploadDir}`);
  },
  // Generate unique filename with timestamp
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    cb(null, `${timestamp}-${file.originalname.replace(ext, '')}${ext}`);
  }
});

// Filter to only allow image file uploads
// @param {Object} file - File object from multer
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload an image.'), false);
  }
};

// Create multer uploader instance with specific configuration
// @param {string} dir - Directory name for specific upload type
const createUploader = (dir) => multer({
  storage: createStorage(dir),
  limits: { fileSize: 1024 * 1024 * 5 }, // 5MB file size limit
  fileFilter
});

// Export configured uploaders for different purposes
module.exports = {
  breederUpload: createUploader('breeder-profiles'), // For breeder profile images
  littersUpload: createUploader('litter-images'),    // For litter images
  puppyUpload: createUploader('puppy-images'),       // For individual puppy images
  grumbleUpload: createUploader('grumble-images')    // For grumble (group) images
};
