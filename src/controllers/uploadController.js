// src/controllers/uploadController.js
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ensureDir = (p) => { if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true }); };

const storage = (folder) => multer.diskStorage({
  destination: (_req, _file, cb) => {
    const dest = path.join(__dirname, '../../uploads', folder);
    ensureDir(dest);
    cb(null, dest);
  },
  filename: (_req, file, cb) => {
    const uniq = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const ext = path.extname(file.originalname || '');
    cb(null, `${uniq}${ext}`);
  },
});

export const coverUpload = multer({ storage: storage('covers') });
export const audioUpload = multer({ storage: storage('audio') });

export const uploadCover = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'cover لازم است' });
  const url = `${req.protocol}://${req.get('host')}/uploads/covers/${req.file.filename}`;
  res.json({ url });
};

export const uploadAudio = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'audio لازم است' });
  const url = `${req.protocol}://${req.get('host')}/uploads/audio/${req.file.filename}`;
  res.json({ url });
};
