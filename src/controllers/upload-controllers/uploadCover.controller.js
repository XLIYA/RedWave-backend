import { ensureUploadDirsOnce, coverUpload, buildPublicUrl } from './uploads.common.js';

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
