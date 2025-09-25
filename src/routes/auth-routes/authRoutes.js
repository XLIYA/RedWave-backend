// src/routes/authRoutes.js
import express from 'express';
import { login, register } from '../../controllers/auth-controllers/index.js';


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

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AuthRegisterRequest'
 *     responses:
 *       201: { description: Created }
 */
router.post('/register', register);

export default router;
