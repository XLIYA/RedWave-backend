import express from 'express';
import { listTopTags } from '../../controllers/tag-controllers/index.js';

const router = express.Router();

/**
 * @openapi
 * /api/tags:
 *   get:
 *     summary: Top tags (global)
 *     tags: [Tags]
 *     responses:
 *       200: { description: OK }
 */
router.get('/', listTopTags);

export default router;
