import prisma from '../../config/db.js';

export const getSong = async (req, res) => {
  try {
    const id = String(req.params.id || '').trim();
    if (!id) return res.status(400).json({ message: 'شناسه نامعتبر است' });

    const song = await prisma.song.findUnique({
      where: { id },
      include: {
        analytics: true,
        lyrics: true,
        uploadedBy: { select: { id: true, username: true, profileImage: true } },
        _count: { select: { comments: true, likes: true, moodTags: true } },
      },
    });
    if (!song) return res.status(404).json({ message: 'Song not found' });

    res.json(song);
  } catch (e) {
    console.error('getSong error:', e);
    res.status(500).json({ message: 'Server error' });
  }
};
