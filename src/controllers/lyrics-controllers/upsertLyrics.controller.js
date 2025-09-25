import prisma from '../../config/db.js';

export const upsertLyrics = async (req, res) => {
  try {
    const id = String(req.params.id || '').trim(); // songId
    const { lyricsText } = req.body || {};
    if (!lyricsText) return res.status(400).json({ message: 'lyricsText لازم است' });

    const song = await prisma.song.findUnique({ where: { id } });
    if (!song) return res.status(404).json({ message: 'Song not found' });

    if (song.uploadedById !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'اجازه ندارید' });
    }

    const row = await prisma.lyrics.upsert({
      where: { songId: id },
      update: { lyricsText },
      create: { songId: id, lyricsText },
    });

    res.json({ id: row.id, songId: row.songId });
  } catch (e) {
    console.error('upsertLyrics error:', e);
    res.status(500).json({ message: 'Server error' });
  }
};
