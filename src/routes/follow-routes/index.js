import express from 'express';
import followUserRoutes from './followUser.routes.js';
import unfollowUserRoutes from './unfollowUser.routes.js';
import listFollowersRoutes from './listFollowers.routes.js';
import listFollowingRoutes from './listFollowing.routes.js';

const router = express.Router();

// مسیرها یکتا هستند؛ ترتیب اهمیت ندارد
router.use(followUserRoutes);     // POST /:id
router.use(unfollowUserRoutes);   // DELETE /:id
router.use(listFollowersRoutes);  // GET /followers/me, /followers/:id
router.use(listFollowingRoutes);  // GET /following/me, /following/:id

export default router;
