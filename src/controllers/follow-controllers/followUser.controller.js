import prisma from '../../config/db.js';

export const followUser = async (req, res) => {
  try {
    const id = String(req.params.id || '').trim();
    if (id === req.user.id) {
      return res.status(400).json({ message: 'نمی‌توانید خودتان را فالو کنید' });
    }

    await prisma.follow.upsert({
      where: { followerId_followingId: { followerId: req.user.id, followingId: id } },
      update: {},
      create: { followerId: req.user.id, followingId: id },
    });

    res.json({ ok: true });
  } catch (e) {
    console.error('followUser error:', e);
    res.status(500).json({ message: 'Server error' });
  }
};
