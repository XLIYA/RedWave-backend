import express from 'express';

import meGetRoutes from './me.get.routes.js';
import meUpdateRoutes from './me.update.routes.js';
import meChangePasswordRoutes from './me.changePassword.routes.js';
import meOnlineStatusRoutes from './me.onlineStatus.routes.js';
import meUploadsRoutes from './me.uploads.routes.js';
import meLikesRoutes from './me.likes.routes.js';
import getUserByIdRoutes from './getUserById.routes.js';
import getUserUploadsRoutes from './getUserUploads.routes.js';
import getUserPlaylistsRoutes from './getUserPlaylists.routes.js';

const router = express.Router();

// اول مسیرهای /me، سپس /:id و زیرمسیرها
router.use(meGetRoutes);             // GET   /me
router.use(meUpdateRoutes);          // PUT   /me
router.use(meChangePasswordRoutes);  // POST  /me/change-password
router.use(meOnlineStatusRoutes);    // POST  /me/online-status
router.use(meUploadsRoutes);         // GET   /me/uploads
router.use(meLikesRoutes);           // GET   /me/likes

router.use(getUserUploadsRoutes);    // GET   /:id/uploads
router.use(getUserPlaylistsRoutes);  // GET   /:id/playlists
router.use(getUserByIdRoutes);       // GET   /:id

export default router;
