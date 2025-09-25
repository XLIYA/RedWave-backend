import prisma from '../../config/db.js';

export const addSongToPlaylist = async (req, res) => {
  try {
    const id = String(req.params.id || '').trim();
    const { songId } = req.body || {};

    if (!id || !songId) {
      return res.status(400).json({ message: 'id و songId لازم‌اند' });
    }

    const pl = await prisma.playlist.findUnique({ where: { id } });
    if (!pl) return res.status(404).json({ message: 'Playlist not found' });

    if (pl.ownerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'اجازه ندارید' });
    }

    const song = await prisma.song.findUnique({ where: { id: songId } });
    if (!song) return res.status(404).json({ message: 'Song not found' });

    const result = await prisma.playlistSong.upsert({
      where: {
        playlistId_songId: { playlistId: id, songId }
      },
      update: { createdAt: new Date() },
      create: { playlistId: id, songId },
    });

    res.json({
      ok: true,
      message: 'آهنگ با موفقیت اضافه شد',
      playlistSong: result,
    });
  } catch (e) {
    console.error('addSongToPlaylist error:', e);
    res.status(500).json({ message: 'Server error' });
  }
};
