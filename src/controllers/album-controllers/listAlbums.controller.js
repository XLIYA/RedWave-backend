import prisma from '../../config/db.js';

export const listAlbums = async (req, res, next) => {
  try {
    if (res.headersSent) return;

    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const take = Math.min(Math.max(parseInt(req.query.pageSize || '12', 10), 1), 50);
    const skip = (page - 1) * take;
    const q = String(req.query.q || '').trim();

    const where = q
      ? {
          OR: [
            { title:  { contains: q, mode: 'insensitive' } },
            { artist: { contains: q, mode: 'insensitive' } }
          ]
        }
      : {};

    const [items, total] = await Promise.all([
      prisma.album.findMany({
        where, skip, take,
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { songs: true } } }
      }),
      prisma.album.count({ where })
    ]);

    return res.json({
      items,
      page,
      pageSize: take,
      total,
      pages: Math.ceil(total / take)
    });
  } catch (err) {
    return next(err);
  }
};
