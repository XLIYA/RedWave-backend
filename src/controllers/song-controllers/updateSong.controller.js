import prisma from '../../config/db.js';
import { normalize } from '../../utils/normalize.js';

export const updateSong = async (req, res) => {
  try {
    const id = String(req.params.id || '').trim();
    if (!id) return res.status(400).json({ message: 'شناسه نامعتبر است' });

    const song = await prisma.song.findUnique({ where: { id } });
    if (!song) return res.status(404).json({ message: 'Song not found' });

    if (song.uploadedById !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'اجازه ندارید' });
    }

    const { title, artist, genre, releaseDate, coverImage } = req.body || {};
    const data = {};

    if (title?.trim()) data.title = title.trim();
    if (artist?.trim()) data.artist = artist.trim();
    if (genre?.trim()) data.genre = genre.trim();
    if (releaseDate) {
      const d = new Date(releaseDate);
      if (!isNaN(d.getTime())) data.releaseDate = d;
    }
    if (coverImage?.trim()) data.coverImage = coverImage.trim();

    if (data.title || data.artist || data.genre) {
      const t = data.title || song.title;
      const a = data.artist || song.artist;
      const g = data.genre || song.genre;
      data.searchKey = normalize(`${t}${a}${g}`);
    }

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ message: 'حداقل یک فیلد برای به‌روزرسانی لازم است' });
    }

    const updated = await prisma.song.update({
      where: { id },
      data,
      include: {
        uploadedBy: { select: { id: true, username: true, profileImage: true } },
        analytics: true,
        lyrics: true,
        _count: { select: { comments: true, likes: true, moodTags: true } },
      }
    });

    res.json(updated);
  } catch (e) {
    console.error('updateSong error:', e);
    if (e.code === 'P2002') {
      return res.status(400).json({ message: 'آهنگی با این مشخصات قبلاً وجود دارد' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};
