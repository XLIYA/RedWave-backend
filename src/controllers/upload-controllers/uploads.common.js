import path from 'path';
import { promises as fsp } from 'fs';
import crypto from 'crypto';
import multer from 'multer';

const __root = process.cwd();

export const UPLOAD_ROOT = process.env.UPLOADS_DIR
  ? path.resolve(process.env.UPLOADS_DIR)
  : path.resolve(__root, 'uploads');

export const AUDIO_DIR = path.join(UPLOAD_ROOT, 'audio');
export const COVER_DIR = path.join(UPLOAD_ROOT, 'covers');

const ALLOWED_IMAGE_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp']);
const ALLOWED_AUDIO_EXT = new Set(['.mp3', '.wav', '.ogg', '.flac', '.aac', '.m4a', '.webm']);

// ---------- helpers ----------
async function ensureDir(dir) {
  await fsp.mkdir(dir, { recursive: true });
}

let _dirsReady = false;
export async function ensureUploadDirsOnce() {
  if (_dirsReady) return;
  await Promise.all([ensureDir(UPLOAD_ROOT), ensureDir(AUDIO_DIR), ensureDir(COVER_DIR)]);
  _dirsReady = true;
}

function slugifyBase(name = 'file') {
  const base = name.toString().toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
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

export function buildPublicUrl(req, kind, filename) {
  // kind: 'audio' | 'covers'
  const base = resolvePublicBase(req);
  return `${base}/uploads/${kind}/${filename}`;
}

// ---------- filters ----------
export const imageFilter = (req, file, cb) => {
  try {
    const ext = (path.extname(file.originalname) || '').toLowerCase();
    const ok = file.mimetype?.startsWith('image/') && ALLOWED_IMAGE_EXT.has(ext);
    return ok ? cb(null, true) : cb(new Error('Invalid image type'), false);
  } catch (e) {
    cb(e, false);
  }
};

export const audioFilter = (req, file, cb) => {
  try {
    const ext = (path.extname(file.originalname) || '').toLowerCase();
    const ok = file.mimetype?.startsWith('audio/') && ALLOWED_AUDIO_EXT.has(ext);
    return ok ? cb(null, true) : cb(new Error('Invalid audio type'), false);
  } catch (e) {
    cb(e, false);
  }
};

// ---------- storage + uploaders ----------
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

export const coverUpload = multer({
  storage: makeStorage(COVER_DIR),
  fileFilter: imageFilter,
  limits: { fileSize: 10 * 1024 * 1024, files: 1 }, // 10MB
});

export const audioUpload = multer({
  storage: makeStorage(AUDIO_DIR),
  fileFilter: audioFilter,
  limits: { fileSize: 100 * 1024 * 1024, files: 1 }, // 100MB
});
