import prisma from '../../config/db.js';

export const addComment = async (req, res) => {
  try {
    const songId = String(req.params.songId || '').trim();
    const { text } = req.body || {};
    if (!text) return res.status(400).json({ message: 'text لازم است' });

    const row = await prisma.comment.create({
      data: { songId, userId: req.user.id, text },
      include: { user: { select: { id: true, username: true } } },
    });

    res.status(201).json(row);
  } catch (e) {
    console.error('addComment error:', e);
    res.status(500).json({ message: 'Server error' });
  }
};
