const multer = require('multer');
const path = require('path');

// Storage configuration for breeder profile pictures
const breederStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/breeder-profiles/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

// Storage configuration for dog images
const dogStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const type = req.params.type || 'grown'; // 'grown' or 'puppy'
    const uploadDir = `uploads/${type}-dogs/`;
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload an image.'), false);
  }
};

// Create separate multer instances
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