import prisma from '../../config/db.js';
import bcrypt from 'bcryptjs';
import { signJwt } from '../../utils/jwt.js';

export const login = async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ message: 'username و password لازم‌اند' });
    }

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) return res.status(401).json({ message: 'نام کاربری/رمز عبور اشتباه است' });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: 'نام کاربری/رمز عبور اشتباه است' });

    const token = signJwt({ id: user.id, role: user.role });
    res.json({ id: user.id, username: user.username, role: user.role, token });
  } catch (e) {
    console.error('login error:', e);
    res.status(500).json({ message: 'Server error' });
  }
};
