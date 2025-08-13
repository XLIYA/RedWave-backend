// src/routes/feedRoutes.js
import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getFeed } from '../controllers/feedController.js';

const router = express.Router();

/**
 * @openapi
 * /api/feed:
 *   get:
 *     summary: Feed of songs from users I follow
 *     tags: [Feed]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - $ref: '#/components/parameters/Page'
 *       - $ref: '#/components/parameters/PageSize'
 *     responses:
 *       200: { description: OK }
 */
router.get('/', protect, getFeed);

export default router;
