import express from 'express';
import { getUserUploads } from '../../controllers/user-controllers/index.js';

const router = express.Router();

/**
 * @openapi
 * /api/users/{id}/uploads:
 *   get:
 *     summary: List user's uploaded songs
 *     tags: [Users]
 *     parameters:
 *       - $ref: '#/components/parameters/UserIdPath'
 *     responses:
 *       200: { description: OK }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.get('/:id/uploads', getUserUploads);

export default router;
