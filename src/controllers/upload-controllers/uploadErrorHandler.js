import multer from 'multer';

export function uploadErrorHandler(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ ok: false, code: err.code, message: err.message });
  }
  if (err && (err.message?.startsWith('Invalid image type') || err.message?.startsWith('Invalid audio type'))) {
    return res.status(400).json({ ok: false, message: err.message });
  }
  next(err);
}
