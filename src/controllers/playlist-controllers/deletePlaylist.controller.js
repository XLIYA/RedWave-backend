import prisma from '../../config/db.js';

export const deletePlaylist = async (req, res) => {
  try {
    const id = String(req.params.id || '').trim();
    if (!id) return res.status(400).json({ message: 'شناسه نامعتبر است' });

    const pl = await prisma.playlist.findUnique({ where: { id } });
    if (!pl) return res.status(404).json({ message: 'Playlist not found' });

    if (pl.ownerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'اجازه ندارید' });
    }

    await prisma.playlist.delete({ where: { id } });

    res.json({ ok: true, message: 'Playlist با موفقیت حذف شد' });
  } catch (e) {
    console.error('deletePlaylist error:', e);
    res.status(500).json({ message: 'Server error' });
  }
};
