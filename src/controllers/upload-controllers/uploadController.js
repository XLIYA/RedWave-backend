// src/controllers/uploadController.js
import path from 'path';
import fs from 'fs';
import { promises as fsp } from 'fs';
import crypto from 'crypto';
import multer from 'multer';

const __root = process.cwd();
const UPLOAD_ROOT = process.env.UPLOADS_DIR
  ? path.resolve(process.env.UPLOADS_DIR)
  : path.resolve(__root, 'uploads');

const AUDIO_DIR = path.join(UPLOAD_ROOT, 'audio');
const COVER_DIR = path.join(UPLOAD_ROOT, 'covers');

const ALLOWED_IMAGE_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp']);
const ALLOWED_AUDIO_EXT = new Set(['.mp3', '.wav', '.ogg', '.flac', '.aac', '.m4a', '.webm']);

// ---- helpers ---------------------------------------------------------------

async function ensureDir(dir) {
  await fsp.mkdir(dir, { recursive: true });
}

let _dirsReady = false;
async function ensureUploadDirsOnce() {
  if (_dirsReady) return;
  await Promise.all([ensureDir(UPLOAD_ROOT), ensureDir(AUDIO_DIR), ensureDir(COVER_DIR)]);
  _dirsReady = true;
}

function slugifyBase(name = 'file') {
  const base = name.toString().toLowerCase()
    .replace(/\s+/g, '-')                // spaces -> dashes
    .replace(/[^a-z0-9_-]+/g, '-')       // keep ascii safe set
    .replace(/-+/g, '-')                 // collapse dashes
    .replace(/^-|-$/g, '');              // trim dashes
  return base || 'file';
}

function randomId(n = 6) {
  return crypto.randomBytes(n).toString('hex');
}

function makeFilename(originalname) {
  const ext = (path.extname(originalname) || '').toLowerCase();
  const base = slugifyBase(path.basename(originalname, ext)).slice(0, 50);
  const ts = Date.now();
  return `${ts}_${base || 'file'}_${randomId(4)}${ext}`;
}

function resolvePublicBase(req) {
  const envBase = process.env.PUBLIC_BASE_URL && process.env.PUBLIC_BASE_URL.trim();
  if (envBase) return envBase.replace(/\/$/, '');
  const proto = (req.headers['x-forwarded-proto'] || req.protocol || 'http').toString();
  const host = req.get('host');
  return `${proto}://${host}`;
}

function buildPublicUrl(req, kind, filename) {
  // kind: 'audio' | 'covers'
  const base = resolvePublicBase(req);
  return `${base}/uploads/${kind}/${filename}`;
}

// ---- filters ---------------------------------------------------------------

const imageFilter = (req, file, cb) => {
  try {
    const ext = (path.extname(file.originalname) || '').toLowerCase();
    const ok = file.mimetype?.startsWith('image/') && ALLOWED_IMAGE_EXT.has(ext);
    return ok ? cb(null, true) : cb(new Error('Invalid image type'), false);
  } catch (e) {
    cb(e, false);
  }
};

const audioFilter = (req, file, cb) => {
  try {
    const ext = (path.extname(file.originalname) || '').toLowerCase();
    const ok = file.mimetype?.startsWith('audio/') && ALLOWED_AUDIO_EXT.has(ext);
    return ok ? cb(null, true) : cb(new Error('Invalid audio type'), false);
  } catch (e) {
    cb(e, false);
  }
};

// ---- storage engines -------------------------------------------------------

function makeStorage(dir) {
  return multer.diskStorage({
    destination: async (req, file, cb) => {
      try {
        await ensureUploadDirsOnce();
        cb(null, dir);
      } catch (e) {
        cb(e);
      }
    },
    filename: (req, file, cb) => {
      try {
        const fname = makeFilename(file.originalname);
        cb(null, fname);
      } catch (e) {
        cb(e);
      }
    },
  });
}

// ---- uploaders -------------------------------------------------------------

const coverUpload = multer({
  storage: makeStorage(COVER_DIR),
  fileFilter: imageFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
    files: 1,
  },
});

const audioUpload = multer({
  storage: makeStorage(AUDIO_DIR),
  fileFilter: audioFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100 MB
    files: 1,
  },
});

// ---- controllers (middlewares chain) --------------------------------------

// POST /api/upload/cover  (field: "cover")
export const uploadCover = [
  async (req, res, next) => {
    try { await ensureUploadDirsOnce(); next(); } catch (e) { next(e); }
  },
  coverUpload.single('cover'),
  (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No cover file provided' });

    const url = buildPublicUrl(req, 'covers', req.file.filename);
    res.status(201).json({
      ok: true,
      field: 'cover',
      filename: req.file.filename,
      url,
      path: `/uploads/covers/${req.file.filename}`,
      mimetype: req.file.mimetype,
      size: req.file.size,
    });
  },
];

// POST /api/upload/audio  (field: "audio")
export const uploadAudio = [
  async (req, res, next) => {
    try { await ensureUploadDirsOnce(); next(); } catch (e) { next(e); }
  },
  audioUpload.single('audio'),
  (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No audio file provided' });

    const url = buildPublicUrl(req, 'audio', req.file.filename);
    res.status(201).json({
      ok: true,
      field: 'audio',
      filename: req.file.filename,
      url,
      path: `/uploads/audio/${req.file.filename}`,
      mimetype: req.file.mimetype,
      size: req.file.size,
      // duration: ...  // در صورت نیاز می‌تونی با ffprobe/music-metadata محاسبه کنی
    });
  },
];

// ---- optional: Multer error handler ---------------------------------------

export function uploadErrorHandler(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ ok: false, code: err.code, message: err.message });
  }
  if (err && (err.message?.startsWith('Invalid image type') || err.message?.startsWith('Invalid audio type'))) {
    return res.status(400).json({ ok: false, message: err.message });
  }
  next(err);
}
