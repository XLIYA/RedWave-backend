import prisma from '../../config/db.js';
import bcrypt from 'bcryptjs';
import { signJwt } from '../../utils/jwt.js';

export const register = async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ message: 'username و password لازم‌اند' });
    }

    const exists = await prisma.user.findUnique({ where: { username } });
    if (exists) return res.status(409).json({ message: 'این نام کاربری قبلاً ثبت شده است' });

    const hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { username, password: hash, role: 'user' },
      select: { id: true, username: true, role: true }
    });

    const token = signJwt({ id: user.id, role: user.role });
    res.status(201).json({ ...user, token });
  } catch (e) {
    console.error('register error:', e);
    res.status(500).json({ message: 'Server error' });
  }
};
