// src/middleware/upload.js
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}
function randomName(originalName) {
  const ext = path.extname(originalName).toLowerCase();
  return crypto.randomBytes(16).toString('hex') + ext;
}

const uploadsRoot = path.join('uploads');
const coversDir   = path.join(uploadsRoot, 'covers');
const audioDir    = path.join(uploadsRoot, 'audio');
[uploadsRoot, coversDir, audioDir].forEach(ensureDir);

const imageFilter = (_req, file, cb) => {
  const allowed = new Set(['.jpg', '.jpeg', '.png', '.webp']);
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.has(ext)) return cb(null, true);
  cb(new Error('Invalid image type'), false);
};
const audioFilter = (_req, file, cb) => {
  const allowed = new Set(['.mp3', '.wav', '.ogg', '.flac', '.aac', '.m4a', '.webm']);
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.has(ext)) return cb(null, true);
  cb(new Error('Invalid audio type'), false);
};

function makeStorage(subdir) {
  const dest = path.join(uploadsRoot, subdir);
  ensureDir(dest);
  return multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, dest),
    filename: (_req, file, cb) => cb(null, randomName(file.originalname))
  });
}

export const uploadCoverMulter = multer({
  storage: makeStorage('covers'),
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

export const uploadAudioMulter = multer({
  storage: makeStorage('audio'),
  fileFilter: audioFilter,
  limits: { fileSize: 100 * 1024 * 1024 }
});

const albumStorage = multer.diskStorage({
  destination: (_req, file, cb) => {
    if (file.fieldname === 'cover') return cb(null, coversDir);
    if (file.fieldname === 'audios') return cb(null, audioDir);
    return cb(null, uploadsRoot);
  },
  filename: (_req, file, cb) => cb(null, randomName(file.originalname))
});

export const uploadAlbumMulter = multer({
  storage: albumStorage,
  limits: { fileSize: 100 * 1024 * 1024, files: 100 },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'cover') return imageFilter(req, file, cb);
    if (file.fieldname === 'audios') return audioFilter(req, file, cb);
    return cb(new Error('Invalid field name'), false);
  }
});
