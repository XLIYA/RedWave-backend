import prisma from '../../config/db.js';

export const listComments = async (req, res) => {
  try {
    const songId = String(req.params.songId || '').trim();
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const take = Math.min(Math.max(parseInt(req.query.pageSize || '12', 10), 1), 100);
    const skip = (page - 1) * take;

    const where = { songId };
    const [items, total] = await prisma.$transaction([
      prisma.comment.findMany({
        where, skip, take,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { id: true, username: true } } },
      }),
      prisma.comment.count({ where }),
    ]);

    res.json({ items, page, pageSize: take, total, pages: Math.ceil(total / take) });
  } catch (e) {
    console.error('listComments error:', e);
    res.status(500).json({ message: 'Server error' });
  }
};
