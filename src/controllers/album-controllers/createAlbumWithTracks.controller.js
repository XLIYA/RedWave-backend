import prisma from '../../config/db.js';
import path from 'path';

const buildPublicUrl = (req, type, filename) => {
  const base = process.env.PUBLIC_BASE_URL || `${req.protocol}://${req.get('host')}`;
  const folder = type === 'cover' ? 'covers' : 'audio';
  return `${base}/uploads/${folder}/${filename}`;
};

const normalize = (s = '') =>
  s.toString().normalize('NFKD').toLowerCase().replace(/[^\p{Letter}\p{Number}]+/gu, '');

export const createAlbumWithTracks = async (req, res, next) => {
  try {
    const { title, artist } = req.body || {};
    const releaseDate = req.body.releaseDate ? new Date(req.body.releaseDate) : null;
    const description = req.body.description?.toString().trim() || null;

    if (!title?.trim()) return res.status(400).json({ message: 'title لازم است' });
    if (!artist?.trim()) return res.status(400).json({ message: 'artist لازم است' });

    const coverFile = (req.files?.cover || [])[0];
    const audioFiles = req.files?.audios || [];
    if (!audioFiles.length) {
      return res.status(400).json({ message: 'حداقل یک فایل صوتی لازم است (audios[])' });
    }

    let tracksMeta = [];
    if (req.body.tracks) {
      try {
        const parsed = JSON.parse(req.body.tracks);
        if (!Array.isArray(parsed)) throw new Error('tracks باید آرایه باشد');
        tracksMeta = parsed;
      } catch {
        return res.status(400).json({ message: 'فرمت tracks نامعتبر است (JSON array)' });
      }
    }

    const album = await prisma.album.create({
      data: {
        title: title.trim(),
        artist: artist.trim(),
        description,
        releaseDate: releaseDate || null,
        coverImage: coverFile ? buildPublicUrl(req, 'cover', coverFile.filename) : null,
        uploadedById: req.user.id
      },
      select: { id: true, title: true, artist: true, coverImage: true, releaseDate: true }
    });

    await prisma.$transaction(async (tx) => {
      for (let idx = 0; idx < audioFiles.length; idx++) {
        const file = audioFiles[idx];
        const meta = tracksMeta[idx] || {};
        const mTitle = (meta.title || path.parse(file.originalname).name || `Track ${idx + 1}`).toString();
        const mGenre = (meta.genre || 'Unknown').toString();
        const mRelease = meta.releaseDate ? new Date(meta.releaseDate) : (releaseDate || new Date());
        const mTrackNo = meta.trackNumber ? parseInt(meta.trackNumber, 10) : (idx + 1);
        const mDiscNo = meta.discNumber ? parseInt(meta.discNumber, 10) : null;

        await tx.song.upsert({
          where: {
            title_artist_albumId: { title: mTitle, artist: artist.trim(), albumId: album.id }
          },
          update: {
            genre: mGenre,
            releaseDate: mRelease,
            coverImage: album.coverImage || buildPublicUrl(req, 'cover', file.filename),
            fileUrl: buildPublicUrl(req, 'audio', file.filename),
            trackNumber: mTrackNo,
            discNumber: mDiscNo,
            searchKey: normalize(`${mTitle}${artist}${mGenre}`)
          },
          create: {
            title: mTitle,
            artist: artist.trim(),
            genre: mGenre,
            releaseDate: mRelease,
            coverImage: album.coverImage || buildPublicUrl(req, 'cover', file.filename),
            fileUrl: buildPublicUrl(req, 'audio', file.filename),
            uploadedById: req.user.id,
            albumId: album.id,
            trackNumber: mTrackNo,
            discNumber: mDiscNo,
            searchKey: normalize(`${mTitle}${artist}${mGenre}`)
          }
        });
      }

      const rows = await tx.song.findMany({
        where: { albumId: album.id },
        select: { id: true }
      });

      for (const r of rows) {
        await tx.analytics.upsert({
          where: { songId: r.id },
          update: {},
          create: { songId: r.id, playCount: 0, uniqueListeners: 0, lastPlayed: new Date() }
        });
      }
    });

    const full = await prisma.album.findUnique({
      where: { id: album.id },
      include: {
        songs: {
          orderBy: [{ discNumber: 'asc' }, { trackNumber: 'asc' }, { createdAt: 'asc' }],
          select: {
            id: true, title: true, artist: true, genre: true, releaseDate: true,
            coverImage: true, fileUrl: true, trackNumber: true, discNumber: true
          }
        }
      }
    });

    return res.status(201).json({ album: full, count: full.songs.length });
  } catch (err) {
    console.error('createAlbumWithTracks error:', err);
    return next(err);
  }
};
