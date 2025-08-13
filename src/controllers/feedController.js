// src/controllers/feedController.js
import prisma from '../config/db.js';

export const getFeed = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const take = Math.min(Math.max(parseInt(req.query.pageSize || '12', 10), 1), 50);
    const skip = (page - 1) * take;

    const following = await prisma.follow.findMany({
      where: { followerId: req.user.id },
      select: { followingId: true },
    });
    const followingIds = following.map(f => f.followingId);
    if (!followingIds.length) {
      return res.json({ items: [], page, pageSize: take, total: 0, pages: 0 });
    }

    const where = { uploadedById: { in: followingIds } };
    const [items, total] = await prisma.$transaction([
      prisma.song.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip, take,
        include: {
          uploadedBy: { select: { id: true, username: true } },
          analytics: true,
          _count: { select: { comments: true, likes: true, moodTags: true } },
        },
      }),
      prisma.song.count({ where }),
    ]);

    res.json({ items, page, pageSize: take, total, pages: Math.ceil(total / take) });
  } catch (e) {
    console.error('getFeed error:', e);
    res.status(500).json({ message: 'Server error' });
  }
};
