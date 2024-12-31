const multer = require('multer');
const fs = require('fs');

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

// Storage configuration for dog profile pictures
const dogStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'public/uploads/profile-pictures';
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const timestamp = Date.now();
    cb(null, `${timestamp}-${file.originalname}`);
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

module.exports = {
  breederUpload,
  dogUpload
};