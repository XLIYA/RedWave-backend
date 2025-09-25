import prisma from '../../config/db.js';

export const createPlaylist = async (req, res) => {
  try {
    const { name, description } = req.body || {};
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ message: 'name لازم است' });
    }

    const playlist = await prisma.playlist.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        ownerId: req.user.id,
      },
      include: {
        owner: { select: { id: true, username: true } },
        _count: { select: { songs: true } }
      }
    });

    res.status(201).json(playlist);
  } catch (e) {
    console.error('createPlaylist error:', e);
    res.status(500).json({ message: 'Server error' });
  }
};
