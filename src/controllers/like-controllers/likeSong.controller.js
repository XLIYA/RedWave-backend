import prisma from '../../config/db.js';

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
