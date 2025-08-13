// src/middleware/upload.js
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function makeStorage(subdir) {
  const dest = path.join('uploads', subdir);
  ensureDir(dest);
  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, dest),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const base = path.basename(file.originalname, ext).replace(/\s+/g, '_');
      const rand = crypto.randomBytes(3).toString('hex');
      cb(null, `${Date.now()}_${rand}_${base}${ext}`);
    },
  });
}

const imageFilter = (req, file, cb) => {
  if (file.mimetype?.startsWith('image/')) return cb(null, true);
  cb(new Error('Invalid image type'), false);
};

const audioFilter = (req, file, cb) => {
  if (file.mimetype?.startsWith('audio/')) return cb(null, true);
  cb(new Error('Invalid audio type'), false);
};

export const uploadCoverMulter = multer({
  storage: makeStorage('covers'),
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

export const uploadAudioMulter = multer({
  storage: makeStorage('audio'),
  fileFilter: audioFilter,
  limits: { fileSize: 30 * 1024 * 1024 },
});
