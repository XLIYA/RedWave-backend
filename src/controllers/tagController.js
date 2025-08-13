// src/controllers/tagController.js
import prisma from '../config/db.js';

export const getSongTags = async (req, res) => {
  try {
    const id = String(req.params.id || '').trim(); // songId
    const items = await prisma.moodTag.findMany({
      where: { songId: id },
      include: { user: { select: { id: true, username: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ items, total: items.length });
  } catch (e) {
    console.error('getSongTags error:', e);
    res.status(500).json({ message: 'Server error' });
  }
};

export const addSongTag = async (req, res) => {
  try {
    const id = String(req.params.id || '').trim(); // songId
    const { tag } = req.body || {};
    if (!tag) return res.status(400).json({ message: 'tag لازم است' });

    await prisma.moodTag.create({
      data: { songId: id, userId: req.user.id, tag },
    });
    res.json({ ok: true });
  } catch (e) {
    console.error('addSongTag error:', e);
    res.status(500).json({ message: 'Server error' });
  }
};

export const removeSongTag = async (req, res) => {
  try {
    const id = String(req.params.id || '').trim(); // songId
    const { tag } = req.body || {};
    if (!tag) return res.status(400).json({ message: 'tag لازم است' });

    await prisma.moodTag.deleteMany({ where: { songId: id, userId: req.user.id, tag } });
    res.json({ ok: true });
  } catch (e) {
    console.error('removeSongTag error:', e);
    res.status(500).json({ message: 'Server error' });
  }
};

export const listTopTags = async (_req, res) => {
  try {
    const rows = await prisma.$queryRaw`
      SELECT "tag", COUNT(*)::int AS "count"
      FROM "public"."MoodTag"
      GROUP BY "tag"
      ORDER BY COUNT(*) DESC
      LIMIT 50
    `;
    res.json({ items: rows });
  } catch (e) {
    console.error('listTopTags error:', e);
    res.status(500).json({ message: 'Server error' });
  }
};
