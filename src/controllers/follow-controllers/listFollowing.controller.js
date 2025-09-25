import prisma from '../../config/db.js';

export const listFollowing = async (req, res) => {
  try {
    const id = String(req.params.id || req.user.id || '').trim();

    const rows = await prisma.follow.findMany({
      where: { followerId: id },
      include: { following: { select: { id: true, username: true } } },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ items: rows.map(r => r.following) });
  } catch (e) {
    console.error('listFollowing error:', e);
    res.status(500).json({ message: 'Server error' });
  }
};
