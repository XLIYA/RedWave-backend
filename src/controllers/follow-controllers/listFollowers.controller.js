import prisma from '../../config/db.js';

export const listFollowers = async (req, res) => {
  try {
    const id = String(req.params.id || req.user.id || '').trim();

    const rows = await prisma.follow.findMany({
      where: { followingId: id },
      include: { follower: { select: { id: true, username: true } } },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ items: rows.map(r => r.follower) });
  } catch (e) {
    console.error('listFollowers error:', e);
    res.status(500).json({ message: 'Server error' });
  }
};
