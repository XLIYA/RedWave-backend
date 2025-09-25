import prisma from '../../config/db.js';

export const playSong = async (req, res) => {
  const songId = String(req.params.id || '').trim();
  if (!songId) return res.status(400).json({ message: 'شناسه نامعتبر است' });

  const userId = req.user?.id || null;

  try {
    const song = await prisma.song.findUnique({
      where: { id: songId },
      select: { id: true, title: true, artist: true }
    });
    if (!song) return res.status(404).json({ message: 'Song not found' });

    let isFirstListen = false;
    if (userId) {
      try {
        await prisma.userSongPlay.create({ data: { userId, songId } });
        isFirstListen = true;
      } catch (e) {
        if (e?.code !== 'P2002') throw e;
      }
    }

    const analytics = await prisma.$transaction(async (tx) => {
      const now = new Date();
      return tx.analytics.upsert({
        where: { songId },
        update: {
          playCount: { increment: 1 },
          uniqueListeners: { increment: isFirstListen ? 1 : 0 },
          lastPlayed: now
        },
        create: {
          songId,
          playCount: 1,
          uniqueListeners: isFirstListen ? 1 : 0,
          lastPlayed: now
        }
      });
    });

    return res.json({
      ok: true,
      message: 'Play recorded',
      data: { song, analytics, uniqueIncreased: isFirstListen }
    });
  } catch (e) {
    console.error('playSong error:', e);
    return res.status(500).json({
      ok: false,
      message: 'Failed to register play',
      error: e?.code ? { code: e.code, message: e.message } : { message: e?.message || 'unknown' }
    });
  }
};
