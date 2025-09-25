import prisma from '../../config/db.js';

export const myPlaylists = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const take = Math.min(Math.max(parseInt(req.query.pageSize || '12', 10), 1), 50);
    const skip = (page - 1) * take;

    const where = { ownerId: req.user.id };
    const [items, total] = await prisma.$transaction([
      prisma.playlist.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          owner: { select: { id: true, username: true } },
          _count: { select: { songs: true } }
        },
      }),
      prisma.playlist.count({ where }),
    ]);

    res.json({
      items,
      page,
      pageSize: take,
      total,
      pages: Math.ceil(total / take),
    });
  } catch (e) {
    console.error('myPlaylists error:', e);
    res.status(500).json({ message: 'Server error' });
  }
};
