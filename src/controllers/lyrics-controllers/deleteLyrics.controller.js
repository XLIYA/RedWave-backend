import prisma from '../../config/db.js';

export const deleteLyrics = async (req, res) => {
  try {
    const id = String(req.params.id || '').trim(); // songId

    const song = await prisma.song.findUnique({ where: { id } });
    if (!song) return res.status(404).json({ message: 'Song not found' });

    if (song.uploadedById !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'اجازه ندارید' });
    }

    await prisma.lyrics.delete({ where: { songId: id } });

    res.json({ ok: true });
  } catch (e) {
    console.error('deleteLyrics error:', e);
    res.status(500).json({ message: 'Server error' });
  }
};
