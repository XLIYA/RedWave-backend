// src/middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import prisma from '../config/db.js';

export const protect = async (req, res, next) => {
  try {
    const hdr = req.headers.authorization || '';
    
    if (!hdr.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'توکن در فرمت Bearer لازم است' });
    }

    const token = hdr.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'توکن لازم است' });
    }

    // تأیید توکن
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
    
    // گرفتن کاربر از دیتابیس
    const user = await prisma.user.findUnique({ 
      where: { id: decoded.id },
      select: {
        id: true,
        username: true,
        role: true,
        isOnline: true
      }
    });
    
    if (!user) {
      return res.status(401).json({ message: 'کاربر یافت نشد' });
    }

    // اضافه کردن کاربر به req
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'توکن منقضی شده است' });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'توکن نامعتبر است' });
    }
    
    return res.status(401).json({ message: 'احراز هویت ناموفق' });
  }
};

// middleware اختیاری - اگر توکن وجود داشت کاربر را set می‌کند، وگرنه ادامه می‌دهد
export const optionalAuth = async (req, res, next) => {
  try {
    const hdr = req.headers.authorization || '';
    
    if (!hdr.startsWith('Bearer ')) {
      return next(); // ادامه بدون کاربر
    }

    const token = hdr.split(' ')[1];
    
    if (!token) {
      return next(); // ادامه بدون کاربر
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
    const user = await prisma.user.findUnique({ 
      where: { id: decoded.id },
      select: {
        id: true,
        username: true,
        role: true,
        isOnline: true
      }
    });
    
    if (user) {
      req.user = user;
    }
    
    next();
  } catch (error) {
    // در صورت خطا، فقط ادامه می‌دهیم بدون set کردن کاربر
    next();
  }
};

// middleware برای بررسی نقش admin
export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'احراز هویت لازم است' });
  }
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'دسترسی admin لازم است' });
  }
  
  next();
};

// middleware برای بررسی مالکیت یا admin
export const requireOwnerOrAdmin = (getResourceUserId) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'احراز هویت لازم است' });
    }
    
    try {
      const resourceUserId = await getResourceUserId(req);
      
      if (req.user.id === resourceUserId || req.user.role === 'admin') {
        return next();
      }
      
      return res.status(403).json({ message: 'اجازه دسترسی ندارید' });
    } catch (error) {
      console.error('requireOwnerOrAdmin error:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  };
};