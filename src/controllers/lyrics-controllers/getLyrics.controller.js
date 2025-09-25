import prisma from '../../config/db.js';

export const getLyrics = async (req, res) => {
  try {
    const id = String(req.params.id || '').trim(); // songId
    const lyr = await prisma.lyrics.findUnique({ where: { songId: id } });

    if (!lyr) return res.status(404).json({ message: 'Lyrics not found' });

    res.json(lyr);
  } catch (e) {
    console.error('getLyrics error:', e);
    res.status(500).json({ message: 'Server error' });
  }
};
