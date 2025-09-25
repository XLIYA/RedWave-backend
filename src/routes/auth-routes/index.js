import express from 'express';
import loginRoutes from './login.routes.js';
import registerRoutes from './register.routes.js';

const router = express.Router();

// ترتیب مهم نیست، هر دو روی /api/auth مونت می‌شن
router.use(loginRoutes);
router.use(registerRoutes);

export default router;
