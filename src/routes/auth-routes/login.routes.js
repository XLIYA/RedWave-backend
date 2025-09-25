import express from 'express';
import { login } from '../../controllers/auth-controllers/index.js';

const router = express.Router();

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Login
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AuthLoginRequest'
 *           example: { username: "RED", password: "123456" }
 *     responses:
 *       200:
 *         description: OK
 */
router.post('/login', login);

export default router;
