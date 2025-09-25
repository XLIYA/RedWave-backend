import prisma from '../../config/db.js';

export const listTrendingSongs = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const take = Math.min(Math.max(parseInt(req.query.pageSize || '12', 10), 1), 50);
    const skip = (page - 1) * take;

    const windowDays = Math.max(parseInt(req.query.windowDays || '30', 10), 1);
    const minPlays = Math.max(parseInt(req.query.minPlays || '0', 10), 0);
    const windowStart = new Date(Date.now() - windowDays * 24 * 60 * 60 * 1000);

    const where = {
      analytics: {
        lastPlayed: { gte: windowStart },
        playCount: { gte: minPlays }
      }
    };

    const [items, total] = await prisma.$transaction([
      prisma.song.findMany({
        skip, take, where,
        orderBy: [
          { analytics: { lastPlayed: 'desc' } },
          { analytics: { playCount: 'desc' } },
          { createdAt: 'desc' }
        ],
        include: {
          uploadedBy: { select: { id: true, username: true } },
          analytics: true,
          _count: { select: { comments: true, likes: true, moodTags: true } }
        }
      }),
      prisma.song.count({ where })
    ]);

    res.json({
      items, page, pageSize: take, total, pages: Math.ceil(total / take),
      filters: { windowDays, minPlays }
    });
  } catch (e) {
    console.error('listTrendingSongs error:', e);
    res.status(500).json({ message: 'Server error' });
  }
};
