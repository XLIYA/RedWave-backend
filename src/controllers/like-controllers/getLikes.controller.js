import prisma from '../../config/db.js';

export const getLikes = async (req, res) => {
  try {
    const songId = String(req.params.songId || '').trim();

    const items = await prisma.like.findMany({
      where: { songId },
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, username: true } } },
    });

    res.json({ items, total: items.length });
  } catch (e) {
    console.error('getLikes error:', e);
    res.status(500).json({ message: 'Server error' });
  }
};
