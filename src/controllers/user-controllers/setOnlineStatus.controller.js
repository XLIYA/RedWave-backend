import prisma from '../../config/db.js';

export const setOnlineStatus = async (req, res) => {
  try {
    const { isOnline } = req.body || {};
    if (typeof isOnline !== 'boolean') {
      return res.status(400).json({ message: 'isOnline باید boolean باشد' });
    }

    const updateData = { isOnline, lastSeen: new Date() };
    await prisma.user.update({ where: { id: req.user.id }, data: updateData });

    res.json({ ok: true, message: 'وضعیت آنلاین به‌روزرسانی شد', isOnline, lastSeen: updateData.lastSeen });
  } catch (e) {
    console.error('setOnlineStatus error:', e);
    res.status(500).json({ message: 'Server error' });
  }
};
