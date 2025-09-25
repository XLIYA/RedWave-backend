import { ensureUploadDirsOnce, audioUpload, buildPublicUrl } from './uploads.common.js';

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
      // duration: ...  // در صورت نیاز با ffprobe/music-metadata محاسبه کن
    });
  },
];
