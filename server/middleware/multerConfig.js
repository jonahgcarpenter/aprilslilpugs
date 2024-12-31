const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Storage configuration for breeder profile pictures
const breederStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'public/uploads/breeder-profiles';
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const timestamp = Date.now();
    cb(null, `${timestamp}-${file.originalname}`);
  }
});

// Update dog storage configuration to match breeder pattern
const dogStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'public/uploads/profile-pictures';
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    cb(null, `${timestamp}-${file.originalname.replace(ext, '')}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload an image.'), false);
  }
};

const breederUpload = multer({
  storage: breederStorage,
  limits: { fileSize: 1024 * 1024 * 5 },
  fileFilter: fileFilter
});

const dogUpload = multer({
  storage: dogStorage,
  limits: { fileSize: 1024 * 1024 * 5 },
  fileFilter: fileFilter
});

// Remove the separate puppy storage and use the same dogStorage for puppies
const puppyUpload = multer({
  storage: dogStorage,  // Use the same storage as dogs
  limits: { fileSize: 1024 * 1024 * 5 },
  fileFilter: fileFilter
});

module.exports = {
  breederUpload,
  dogUpload,
  puppyUpload
};