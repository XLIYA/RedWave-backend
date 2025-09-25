import prisma from '../../config/db.js';

export const getAlbum = async (req, res, next) => {
  try {
    const id = String(req.params.id || '').trim();
    const album = await prisma.album.findUnique({
      where: { id },
      include: {
        uploadedBy: { select: { id: true, username: true } },
        songs: {
          orderBy: [{ discNumber: 'asc' }, { trackNumber: 'asc' }, { createdAt: 'asc' }],
          select: {
            id: true, title: true, artist: true, genre: true, releaseDate: true,
            coverImage: true, fileUrl: true, trackNumber: true, discNumber: true
          }
        }
      }
    });
    if (!album) return res.status(404).json({ message: 'Album not found' });
    return res.json(album);
  } catch (err) {
    console.error('getAlbum error:', err);
    return next(err);
  }
};
