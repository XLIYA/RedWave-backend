// src/routes/userRoutes.js
import express from 'express';
import { protect, optionalAuth } from '../../middleware/authMiddleware.js';
import { 
  getMe, 
  getUserById, 
  updateMe,
  changePassword,
  getMyUploads, 
  getMyLikes,
  getUserUploads,
  getUserPlaylists,
  setOnlineStatus
} from '../../controllers/user-controllers/userController.js';

const router = express.Router();

/**
 * @openapi
 * /api/users/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Users]
 *     security: [ { bearerAuth: [] } ]
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id: { type: string }
 *                 username: { type: string }
 *                 role: { type: string }
 *                 bio: { type: string }
 *                 profileImage: { type: string }
 *                 socialLinks: { type: object }
 *                 isOnline: { type: boolean }
 *                 lastSeen: { type: string }
 *                 createdAt: { type: string }
 *                 updatedAt: { type: string }
 *                 _count:
 *                   type: object
 *                   properties:
 *                     followers: { type: integer }
 *                     following: { type: integer }
 *                     songs: { type: integer }
 *                     likes: { type: integer }
 *                     playlists: { type: integer }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 */
router.get('/me', protect, getMe);

/**
 * @openapi
 * /api/users/me:
 *   put:
 *     summary: Update current user profile
 *     tags: [Users]
 *     security: [ { bearerAuth: [] } ]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bio: { type: string }
 *               profileImage: { type: string }
 *               socialLinks: { type: object }
 *     responses:
 *       200: { description: OK }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 */
router.put('/me', protect, updateMe);

/**
 * @openapi
 * /api/users/me/change-password:
 *   post:
 *     summary: Change user password
 *     tags: [Users]
 *     security: [ { bearerAuth: [] } ]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword]
 *             properties:
 *               currentPassword: { type: string }
 *               newPassword: { type: string, minLength: 6 }
 *     responses:
 *       200: { description: OK }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 */
router.post('/me/change-password', protect, changePassword);

/**
 * @openapi
 * /api/users/me/online-status:
 *   post:
 *     summary: Set online status
 *     tags: [Users]
 *     security: [ { bearerAuth: [] } ]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [isOnline]
 *             properties:
 *               isOnline: { type: boolean }
 *     responses:
 *       200: { description: OK }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 */
router.post('/me/online-status', protect, setOnlineStatus);

/**
 * @openapi
 * /api/users/me/uploads:
 *   get:
 *     summary: List my uploaded songs
 *     tags: [Users]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - $ref: '#/components/parameters/Page'
 *       - $ref: '#/components/parameters/PageSize'
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *         description: Search query
 *       - in: query
 *         name: genre
 *         schema: { type: string }
 *         description: Filter by genre
 *       - in: query
 *         name: order
 *         schema: 
 *           type: string 
 *           enum: [recent, popular, alphabetical]
 *           default: recent
 *         description: Sort order
 *     responses:
 *       200: { description: OK }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 */
router.get('/me/uploads', protect, getMyUploads);

/**
 * @openapi
 * /api/users/me/likes:
 *   get:
 *     summary: List songs I liked
 *     tags: [Users]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - $ref: '#/components/parameters/Page'
 *       - $ref: '#/components/parameters/PageSize'
 *     responses:
 *       200: { description: OK }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 */
router.get('/me/likes', protect, getMyLikes);

/**
 * @openapi
 * /api/users/{id}:
 *   get:
 *     summary: Get user by id
 *     tags: [Users]
 *     parameters:
 *       - $ref: '#/components/parameters/UserIdPath'
 *     responses:
 *       200: { description: OK }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.get('/:id', optionalAuth, getUserById);

/**
 * @openapi
 * /api/users/{id}/uploads:
 *   get:
 *     summary: List user's uploaded songs
 *     tags: [Users]
 *     parameters:
 *       - $ref: '#/components/parameters/UserIdPath'
 *       - $ref: '#/components/parameters/Page'
 *       - $ref: '#/components/parameters/PageSize'
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *       - in: query
 *         name: genre
 *         schema: { type: string }
 *       - in: query
 *         name: order
 *         schema: 
 *           type: string 
 *           enum: [recent, popular, alphabetical]
 *           default: recent
 *     responses:
 *       200: { description: OK }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.get('/:id/uploads', getUserUploads);

/**
 * @openapi
 * /api/users/{id}/playlists:
 *   get:
 *     summary: List user's playlists
 *     tags: [Users]
 *     parameters:
 *       - $ref: '#/components/parameters/UserIdPath'
 *       - $ref: '#/components/parameters/Page'
 *       - $ref: '#/components/parameters/PageSize'
 *     responses:
 *       200: { description: OK }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.get('/:id/playlists', getUserPlaylists);

export default router;