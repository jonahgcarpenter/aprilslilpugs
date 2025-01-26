const multer = require('multer');
const fs = require('fs');
const path = require('path');

const createStorage = (uploadDir) => multer.diskStorage({
  destination: (req, file, cb) => {
    fs.mkdirSync(`public/uploads/${uploadDir}`, { recursive: true });
    cb(null, `public/uploads/${uploadDir}`);
  },
  filename: (req, file, cb) => {
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

const createUploader = (dir) => multer({
  storage: createStorage(dir),
  limits: { fileSize: 1024 * 1024 * 5 },
  fileFilter
});

module.exports = {
  breederUpload: createUploader('breeder-profiles'),
  littersUpload: createUploader('litter-images'),
  puppyUpload: createUploader('puppy-images'),
  grumbleUpload: createUploader('grumble-images')
};
