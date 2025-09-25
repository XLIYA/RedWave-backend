import express from 'express';

const router = express.Router();

// GET /api/albums/__ping
router.get('/__ping', (req, res) => res.json({ ok: true, route: 'albums' }));

export default router;
