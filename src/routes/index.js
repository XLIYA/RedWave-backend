// src/routes/index.js
import express from 'express';
import rateLimit from 'express-rate-limit';

// زیرروترها
import authRoutes from './auth-routes/index.js';
import userRoutes from './user-routes/index.js';
import songRoutes from './song-routes/index.js';
import playlistRoutes from './playlist-routes/index.js';
import searchRoutes from './search-routes/index.js';
import uploadRoutes from './upload-routes/index.js';
import lyricsRoutes from './lyrics-routes/index.js';
import likeRoutes from './like-routes/index.js';
import commentRoutes from './comments-routes/index.js';
import tagRoutes from './tag-routes/index.js';
import followRoutes from './follow-routes/index.js';
import feedRoutes from './feed-routes/index.js';
import albumRoutes from './album-routes/index.js';

const router = express.Router();

// نمونه لیمیت فقط برای لاگین (انتقال از server.js به اینجا)
const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
});

// mount
router.use('/auth/login', loginLimiter);
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/songs', songRoutes);
router.use('/playlists', playlistRoutes);
router.use('/search', searchRoutes);
router.use('/upload', uploadRoutes);
router.use('/lyrics', lyricsRoutes);
router.use('/likes', likeRoutes);
router.use('/comments', commentRoutes);
router.use('/tags', tagRoutes);
router.use('/follow', followRoutes);
router.use('/feed', feedRoutes);
router.use('/albums', albumRoutes);

export default router;
