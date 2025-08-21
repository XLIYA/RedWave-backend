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
  } catch (error) {
    console.error('Auth middleware error:', error);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'توکن منقضی شده است' });
    }
    return res.status(401).json({ message: 'احراز هویت ناموفق' });
  }
};

export const optionalAuth = async (req, res, next) => {
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
    next();
  } catch {
    next(); // ادامه بدون set کردن کاربر
  }
};

export const requireAdmin = (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: 'احراز هویت لازم است' });
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'دسترسی غیرمجاز' });
  next();
};
