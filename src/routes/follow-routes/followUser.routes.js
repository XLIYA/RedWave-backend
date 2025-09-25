import express from 'express';
import { protect } from '../../middleware/authMiddleware.js';
import { followUser } from '../../controllers/follow-controllers/index.js';

const router = express.Router();

/**
 * @openapi
 * /api/follow/{id}:
 *   post:
 *     summary: Follow a user
 *     tags: [Follow]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - $ref: '#/components/parameters/UserIdPath'
 *     responses:
 *       200: { description: OK }
 */
router.post('/:id', protect, followUser);

export default router;
