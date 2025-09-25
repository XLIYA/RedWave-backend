import prisma from '../../config/db.js';

export const getSongTags = async (req, res) => {
  try {
    const id = String(req.params.id || '').trim(); // songId
    const items = await prisma.moodTag.findMany({
      where: { songId: id },
      include: { user: { select: { id: true, username: true} } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ items, total: items.length });
  } catch (e) {
    console.error('getSongTags error:', e);
    res.status(500).json({ message: 'Server error' });
  }
};
