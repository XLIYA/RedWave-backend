// src/middleware/upload.js
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

/* -------------------------- Helpers & Constants -------------------------- */

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function randomName(originalName) {
  const ext = path.extname(originalName).toLowerCase();
  return crypto.randomBytes(16).toString('hex') + ext;
}

const MB = 1024 * 1024;

// از ENV بخوان؛ اگر ست نشده بود، مقادیر پیش‌فرض منطقی استفاده می‌شود
const MAX_IMAGE_SIZE_MB = Number(process.env.MAX_IMAGE_SIZE_MB || process.env.MAX_FILE_SIZE_MB || 5);    // پیش‌فرض 5MB
const MAX_AUDIO_SIZE_MB = Number(process.env.MAX_AUDIO_SIZE_MB || process.env.MAX_FILE_SIZE_MB || 100);  // پیش‌فرض 100MB
const MAX_ALBUM_FILES   = Number(process.env.MAX_ALBUM_FILES || 100); // حداکثر تعداد فایل در آپلود آلبوم

function parseListEnv(value, fallback) {
  if (!value || typeof value !== 'string') return fallback;
  return value.split(',').map(s => s.trim()).filter(Boolean);
}

// انواع مجاز MIME و اکستنشن‌ها از ENV یا پیش‌فرض
const allowedImageMimes = new Set(
  parseListEnv(
    process.env.UPLOAD_ALLOWED_IMAGE_TYPES,
    ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  )
);
const allowedImageExts = new Set(
  parseListEnv(
    process.env.UPLOAD_ALLOWED_IMAGE_EXTS,
    ['.jpg', '.jpeg', '.png', '.webp', '.gif']
  ).map(e => e.toLowerCase())
);

const allowedAudioMimes = new Set(
  parseListEnv(
    process.env.UPLOAD_ALLOWED_AUDIO_TYPES,
    ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/flac', 'audio/aac', 'audio/x-m4a', 'audio/webm']
  )
);
const allowedAudioExts = new Set(
  parseListEnv(
    process.env.UPLOAD_ALLOWED_AUDIO_EXTS,
    ['.mp3', '.wav', '.ogg', '.flac', '.aac', '.m4a', '.webm']
  ).map(e => e.toLowerCase())
);

/* ------------------------------- Directories ------------------------------ */

const uploadsRoot = path.join('uploads');
const coversDir   = path.join(uploadsRoot, 'covers');
const audioDir    = path.join(uploadsRoot, 'audio');

ensureDir(uploadsRoot);
ensureDir(coversDir);
ensureDir(audioDir);

/* --------------------------------- Filters -------------------------------- */

function byMimeAndExt(file, allowedMimes, allowedExts) {
  const mimeOk = file.mimetype && allowedMimes.has(file.mimetype.toLowerCase());
  const extOk  = allowedExts.has(path.extname(file.originalname).toLowerCase());
  return mimeOk && extOk;
}

const imageFilter = (_req, file, cb) => {
  if (byMimeAndExt(file, allowedImageMimes, allowedImageExts)) return cb(null, true);
  cb(new Error('Invalid image type'), false);
};

const audioFilter = (_req, file, cb) => {
  if (byMimeAndExt(file, allowedAudioMimes, allowedAudioExts)) return cb(null, true);
  cb(new Error('Invalid audio type'), false);
};

/* --------------------------------- Storage -------------------------------- */

function makeStorage(subdir) {
  const dest = path.join(uploadsRoot, subdir);
  ensureDir(dest);
  return multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, dest),
    filename: (_req, file, cb) => cb(null, randomName(file.originalname))
  });
}

// برای آپلود آلبوم با دو فیلد متفاوت (cover, audios)
const albumStorage = multer.diskStorage({
  destination: (_req, file, cb) => {
    if (file.fieldname === 'cover') {
      ensureDir(coversDir);
      return cb(null, coversDir);
    }
    if (file.fieldname === 'audios') {
      ensureDir(audioDir);
      return cb(null, audioDir);
    }
    ensureDir(uploadsRoot);
    return cb(null, uploadsRoot);
  },
  filename: (_req, file, cb) => cb(null, randomName(file.originalname))
});

/* --------------------------------- Multers -------------------------------- */

export const uploadCoverMulter = multer({
  storage: makeStorage('covers'),
  fileFilter: imageFilter,
  limits: {
    fileSize: MAX_IMAGE_SIZE_MB * MB,
    files: 1,
    fields: 20,
    parts: 25
  }
});

export const uploadAudioMulter = multer({
  storage: makeStorage('audio'),
  fileFilter: audioFilter,
  limits: {
    fileSize: MAX_AUDIO_SIZE_MB * MB,
    files: 10,    // در صورت نیاز تغییر بده
    fields: 20,
    parts: 30
  }
});

export const uploadAlbumMulter = multer({
  storage: albumStorage,
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'cover') return imageFilter(req, file, cb);
    if (file.fieldname === 'audios') return audioFilter(req, file, cb);
    return cb(new Error('Invalid field name'), false);
  },
  limits: {
    fileSize: MAX_AUDIO_SIZE_MB * MB,  // سقف برای هر فایل؛ کاور معمولاً کوچکتر است اما ساده نگه می‌داریم
    files: MAX_ALBUM_FILES,
    fields: 50,
    parts: 120
  }
});

