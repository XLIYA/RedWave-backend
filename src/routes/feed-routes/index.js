import express from 'express';
import getFeedRoutes from './getFeed.routes.js';

const router = express.Router();
router.use(getFeedRoutes);

export default router;
