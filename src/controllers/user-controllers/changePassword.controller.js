import prisma from '../../config/db.js';
import bcrypt from 'bcryptjs';

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body || {};
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'رمز فعلی و رمز جدید لازم‌اند' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'رمز جدید باید حداقل 6 کاراکتر باشد' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, password: true }
    });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ message: 'رمز فعلی اشتباه است' });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: req.user.id }, data: { password: hashedNewPassword } });

    res.json({ ok: true, message: 'رمز عبور با موفقیت تغییر کرد' });
  } catch (e) {
    console.error('changePassword error:', e);
    res.status(500).json({ message: 'Server error' });
  }
};
