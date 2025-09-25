import prisma from '../../config/db.js';
import { normalize } from '../../utils/normalize.js';

export const listSongs = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const take = Math.min(Math.max(parseInt(req.query.pageSize || '12', 10), 1), 50);
    const skip = (page - 1) * take;

    const qRaw = String(req.query.q || '').trim();
    const genre = String(req.query.genre || '').trim();
    const artist = String(req.query.artist || '').trim();
    const order = (req.query.order || 'recent').toString();

    const contains = (field, val) => ({ [field]: { contains: val, mode: 'insensitive' } });
    const qNorm = normalize(qRaw);

    const whereAND = [];
    if (qRaw) {
      whereAND.push({
        OR: [
          contains('title', qRaw),
          contains('artist', qRaw),
          contains('genre', qRaw),
          { searchKey: { contains: qNorm } },
        ],
      });
    }
    if (genre) whereAND.push(contains('genre', genre));
    if (artist) whereAND.push(contains('artist', artist));

    const where = whereAND.length ? { AND: whereAND } : {};

    let orderBy;
    switch (order) {
      case 'popular':
        orderBy = [{ analytics: { playCount: 'desc' } }, { createdAt: 'desc' }];
        break;
      case 'trending':
        orderBy = [
          { analytics: { lastPlayed: 'desc' } },
          { analytics: { playCount: 'desc' } },
          { createdAt: 'desc' }
        ];
        break;
      case 'alphabetical':
        orderBy = [{ title: 'asc' }, { artist: 'asc' }];
        break;
      default:
        orderBy = [{ createdAt: 'desc' }];
    }

    const [items, total] = await prisma.$transaction([
      prisma.song.findMany({
        where, orderBy, skip, take,
        include: {
          uploadedBy: { select: { id: true, username: true, profileImage: true } },
          analytics: true,
          _count: { select: { comments: true, likes: true, moodTags: true } },
        },
      }),
      prisma.song.count({ where }),
    ]);

    res.json({
      items,
      page,
      pageSize: take,
      total,
      pages: Math.ceil(total / take),
      filters: { q: qRaw, genre, artist, order }
    });
  } catch (e) {
    console.error('listSongs error:', e);
    res.status(500).json({ message: 'Server error' });
  }
};
