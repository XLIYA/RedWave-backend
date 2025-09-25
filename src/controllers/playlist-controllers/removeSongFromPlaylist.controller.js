import prisma from '../../config/db.js';

export const removeSongFromPlaylist = async (req, res) => {
  try {
    const id = String(req.params.id || '').trim();
    const songId = String(req.params.songId || '').trim();

    if (!id || !songId) {
      return res.status(400).json({ message: 'id و songId لازم‌اند' });
    }

    const pl = await prisma.playlist.findUnique({ where: { id } });
    if (!pl) return res.status(404).json({ message: 'Playlist not found' });

    if (pl.ownerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'اجازه ندارید' });
    }

    const deleteResult = await prisma.playlistSong.deleteMany({
      where: { playlistId: id, songId }
    });

    if (deleteResult.count === 0) {
      return res.status(404).json({ message: 'آهنگ در این playlist یافت نشد' });
    }

    res.json({ ok: true, message: 'آهنگ با موفقیت حذف شد' });
  } catch (e) {
    console.error('removeSongFromPlaylist error:', e);
    res.status(500).json({ message: 'Server error' });
  }
};
