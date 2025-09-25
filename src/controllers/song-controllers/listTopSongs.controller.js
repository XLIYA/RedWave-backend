import prisma from '../../config/db.js';

export const listTopSongs = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const take = Math.min(Math.max(parseInt(req.query.pageSize || '12', 10), 1), 50);
    const skip = (page - 1) * take;

    const [items, total] = await prisma.$transaction([
      prisma.song.findMany({
        skip, take,
        orderBy: [
          { analytics: { playCount: 'desc' } },
          { analytics: { lastPlayed: 'desc' } },
          { createdAt: 'desc' }
        ],
        include: {
          uploadedBy: { select: { id: true, username: true } },
          analytics: true,
          _count: { select: { comments: true, likes: true, moodTags: true } }
        }
      }),
      prisma.song.count()
    ]);

    res.json({
      items, page, pageSize: take, total, pages: Math.ceil(total / take),
      filters: {}
    });
  } catch (e) {
    console.error('listTopSongs error:', e);
    res.status(500).json({ message: 'Server error' });
  }
};
