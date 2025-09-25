// src/routes/followRoutes.js
import express from 'express';
import { protect } from '../../middleware/authMiddleware.js';
import { followUser, unfollowUser, listFollowers, listFollowing } from '../../controllers/follow-controllers/index.js';

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

/**
 * @openapi
 * /api/follow/{id}:
 *   delete:
 *     summary: Unfollow a user
 *     tags: [Follow]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - $ref: '#/components/parameters/UserIdPath'
 *     responses:
 *       200: { description: OK }
 */
router.delete('/:id', protect, unfollowUser);

/**
 * @openapi
 * /api/follow/followers/me:
 *   get:
 *     summary: My followers
 *     tags: [Follow]
 *     security: [ { bearerAuth: [] } ]
 *     responses:
 *       200: { description: OK }
 */
router.get('/followers/me', protect, listFollowers);

/**
 * @openapi
 * /api/follow/following/me:
 *   get:
 *     summary: Who I follow
 *     tags: [Follow]
 *     security: [ { bearerAuth: [] } ]
 *     responses:
 *       200: { description: OK }
 */
router.get('/following/me', protect, listFollowing);

/**
 * @openapi
 * /api/follow/followers/{id}:
 *   get:
 *     summary: Followers of a user
 *     tags: [Follow]
 *     parameters:
 *       - $ref: '#/components/parameters/UserIdPath'
 *     responses:
 *       200: { description: OK }
 */
router.get('/followers/:id', listFollowers);

/**
 * @openapi
 * /api/follow/following/{id}:
 *   get:
 *     summary: Users followed by a user
 *     tags: [Follow]
 *     parameters:
 *       - $ref: '#/components/parameters/UserIdPath'
 *     responses:
 *       200: { description: OK }
 */
router.get('/following/:id', listFollowing);

export default router;
