import prisma from '../../config/db.js';

export const getPlaylistById = async (req, res) => {
  try {
    const id = String(req.params.id || '').trim();
    if (!id) {
      return res.status(400).json({ message: 'شناسه نامعتبر است' });
    }

    const pl = await prisma.playlist.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, username: true } },
        songs: {
          orderBy: { createdAt: 'desc' },
          include: {
            song: {
              include: {
                uploadedBy: { select: { id: true, username: true } },
                analytics: true,
                _count: {
                  select: { comments: true, likes: true, moodTags: true }
                },
              },
            },
          },
        },
        _count: { select: { songs: true } }
      },
    });

    if (!pl) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    const items = pl.songs.map(s => ({
      ...s.song,
      addedAt: s.createdAt, // زمان اضافه شدن به playlist
    }));

    res.json({
      id: pl.id,
      name: pl.name,
      description: pl.description,
      owner: pl.owner,
      createdAt: pl.createdAt,
      updatedAt: pl.updatedAt,
      songsCount: pl._count.songs,
      items,
    });
  } catch (e) {
    console.error('getPlaylistById error:', e);
    res.status(500).json({ message: 'Server error' });
  }
};
