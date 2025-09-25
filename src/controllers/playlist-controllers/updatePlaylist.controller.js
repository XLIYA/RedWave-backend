import prisma from '../../config/db.js';

export const updatePlaylist = async (req, res) => {
  try {
    const id = String(req.params.id || '').trim();
    const { name, description } = req.body || {};

    if (!id) return res.status(400).json({ message: 'شناسه نامعتبر است' });

    const pl = await prisma.playlist.findUnique({ where: { id } });
    if (!pl) return res.status(404).json({ message: 'Playlist not found' });

    if (pl.ownerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'اجازه ندارید' });
    }

    const updateData = {};
    if (name && name.trim().length > 0) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description?.trim() || null;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: 'حداقل یک فیلد برای به‌روزرسانی لازم است' });
    }

    const updatedPlaylist = await prisma.playlist.update({
      where: { id },
      data: updateData,
      include: {
        owner: { select: { id: true, username: true } },
        _count: { select: { songs: true } }
      }
    });

    res.json(updatedPlaylist);
  } catch (e) {
    console.error('updatePlaylist error:', e);
    res.status(500).json({ message: 'Server error' });
  }
};
