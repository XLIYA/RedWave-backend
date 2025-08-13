// src/controllers/likeController.js
import prisma from '../config/db.js';

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

export const likeSong = async (req, res) => {
  try {
    const songId = String(req.params.songId || '').trim();
    await prisma.like.upsert({
      where: { userId_songId: { userId: req.user.id, songId } },
      update: {},
      create: { userId: req.user.id, songId },
    });
    res.json({ ok: true });
  } catch (e) {
    console.error('likeSong error:', e);
    res.status(500).json({ message: 'Server error' });
  }
};

export const unlikeSong = async (req, res) => {
  try {
    const songId = String(req.params.songId || '').trim();
    await prisma.like.deleteMany({ where: { userId: req.user.id, songId } });
    res.json({ ok: true });
  } catch (e) {
    console.error('unlikeSong error:', e);
    res.status(500).json({ message: 'Server error' });
  }
};
