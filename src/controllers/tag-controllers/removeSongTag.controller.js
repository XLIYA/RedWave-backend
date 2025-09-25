import prisma from '../../config/db.js';

export const removeSongTag = async (req, res) => {
  try {
    const id = String(req.params.id || '').trim(); // songId
    const { tag } = req.body || {};
    if (!tag) return res.status(400).json({ message: 'tag لازم است' });

    await prisma.moodTag.deleteMany({
      where: { songId: id, userId: req.user.id, tag }
    });

    res.json({ ok: true });
  } catch (e) {
    console.error('removeSongTag error:', e);
    res.status(500).json({ message: 'Server error' });
  }
};
