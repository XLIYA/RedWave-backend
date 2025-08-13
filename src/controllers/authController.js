// src/controllers/authController.js
import prisma from '../config/db.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const sign = (payload) => {
  const secret = process.env.JWT_SECRET || 'dev_secret';
  return jwt.sign(payload, secret, { expiresIn: '7d' });
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ message: 'username و password لازم‌اند' });
    }

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      return res.status(401).json({ message: 'نام کاربری/رمز اشتباه است' });
    }

    // اصلاح شد: از password به جای passwordHash استفاده می‌کنیم
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ message: 'نام کاربری/رمز اشتباه است' });
    }

    const token = sign({ id: user.id, role: user.role });
    res.json({ 
      id: user.id, 
      username: user.username, 
      role: user.role, 
      token 
    });
  } catch (e) {
    console.error('login error:', e);
    res.status(500).json({ message: 'Server error' });
  }
};

export const register = async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ message: 'username و password لازم‌اند' });
    }

    // اعتبارسنجی اضافی
    if (username.length < 3) {
      return res.status(400).json({ message: 'نام کاربری باید حداقل 3 کاراکتر باشد' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'رمز عبور باید حداقل 6 کاراکتر باشد' });
    }

    const exists = await prisma.user.findUnique({ where: { username } });
    if (exists) {
      return res.status(400).json({ message: 'نام کاربری تکراری است' });
    }

    // اصلاح شد: از password به جای passwordHash استفاده می‌کنیم
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { 
        username, 
        password: hashedPassword, // اصلاح شد
        role: 'user' 
      },
      select: { 
        id: true, 
        username: true, 
        role: true, 
        createdAt: true, 
        updatedAt: true 
      },
    });

    res.status(201).json(user);
  } catch (e) {
    console.error('register error:', e);
    res.status(500).json({ message: 'Server error' });
  }
};