import prisma from '../../config/db.js';

export const unlikeSong = async (req, res) => {
  try {
    const songId = String(req.params.songId || '').trim();

    await prisma.like.deleteMany({
      where: { userId: req.user.id, songId },
    });

    res.json({ ok: true });
  } catch (e) {
    console.error('unlikeSong error:', e);
    res.status(500).json({ message: 'Server error' });
  }
};
