import prisma from '../../config/db.js';

export const getMyLikes = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const take = Math.min(Math.max(parseInt(req.query.pageSize || '12', 10), 1), 50);
    const skip = (page - 1) * take;

    const [rows, total] = await prisma.$transaction([
      prisma.like.findMany({
        where: { userId: req.user.id },
        orderBy: { createdAt: 'desc' },
        skip, take,
        include: {
          song: {
            include: {
              uploadedBy: { select: { id: true, username: true, profileImage: true } },
              analytics: true,
              _count: { select: { comments: true, likes: true, moodTags: true } },
            },
          },
        },
      }),
      prisma.like.count({ where: { userId: req.user.id } }),
    ]);

    const items = rows.map(r => ({ likedAt: r.createdAt, ...r.song }));

    res.json({ items, page, pageSize: take, total, pages: Math.ceil(total / take) });
  } catch (e) {
    console.error('getMyLikes error:', e);
    res.status(500).json({ message: 'Server error' });
  }
};
