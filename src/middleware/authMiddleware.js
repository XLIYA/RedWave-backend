// src/middleware/authMiddleware.js
import prisma from '../config/db.js';
import { verifyJwt } from '../utils/jwt.js';

export const protect = async (req, res, next) => {
  try {
    const hdr = req.headers.authorization || '';
    if (!hdr.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'توکن در فرمت Bearer لازم است' });
    }
    const token = hdr.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'توکن لازم است' });

    const decoded = verifyJwt(token);
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, username: true, role: true }
    });
    if (!user) return res.status(401).json({ message: 'کاربر یافت نشد' });
    req.user = user;
    next();
  } catch (e) {
    return res.status(401).json({ message: 'توکن نامعتبر است' });
  }
};

// احراز هویت اختیاری برای صفحات عمومی (مثلاً play)
export const optionalAuth = async (req, _res, next) => {
  try {
    const hdr = req.headers.authorization || '';
    if (!hdr.startsWith('Bearer ')) return next();
    const token = hdr.split(' ')[1];
    if (!token) return next();

    const decoded = verifyJwt(token);
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, username: true, role: true }
    });
    if (user) req.user = user;
  } catch (_) {
    // نادیده بگیر
  } finally {
    next();
  }
};

export const requireAdmin = (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: 'احراز هویت لازم است' });
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'دسترسی غیرمجاز' });
  next();
};
