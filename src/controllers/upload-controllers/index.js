export { uploadCover } from './uploadCover.controller.js';
export { uploadAudio } from './uploadAudio.controller.js';
export { uploadErrorHandler } from './uploadErrorHandler.js';

// در صورت نیاز به استفاده بیرون از کنترلرها:
export {
  UPLOAD_ROOT, AUDIO_DIR, COVER_DIR,
  ensureUploadDirsOnce, buildPublicUrl,
} from './uploads.common.js';
