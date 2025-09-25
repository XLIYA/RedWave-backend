import prisma from '../../config/db.js';
import { normalize } from '../../utils/normalize.js';

export const createSong = async (req, res) => {
  try {
    const { title, artist, genre, releaseDate, coverImage, fileUrl } = req.body || {};
    if (!title?.trim()) return res.status(400).json({ message: 'عنوان آهنگ لازم است' });
    if (!artist?.trim()) return res.status(400).json({ message: 'نام هنرمند لازم است' });
    if (!genre?.trim()) return res.status(400).json({ message: 'ژانر لازم است' });
    if (!releaseDate) return res.status(400).json({ message: 'تاریخ انتشار لازم است' });
    if (!coverImage?.trim()) return res.status(400).json({ message: 'تصویر کاور لازم است' });
    if (!fileUrl?.trim()) return res.status(400).json({ message: 'فایل صوتی لازم است' });

    const parsedDate = new Date(releaseDate);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({ message: 'تاریخ انتشار نامعتبر است' });
    }

    const searchKey = normalize(`${title.trim()}${artist.trim()}${genre.trim()}`);

    const existing = await prisma.song.findFirst({
      where: { title: title.trim(), artist: artist.trim() }
    });
    if (existing) return res.status(400).json({ message: 'آهنگی با این عنوان و هنرمند قبلاً وجود دارد' });

    const song = await prisma.song.create({
      data: {
        title: title.trim(),
        artist: artist.trim(),
        genre: genre.trim(),
        releaseDate: parsedDate,
        coverImage: coverImage.trim(),
        fileUrl: fileUrl.trim(),
        uploadedById: req.user.id,
        searchKey,
      },
      include: {
        uploadedBy: { select: { id: true, username: true } },
        analytics: true,
        _count: { select: { comments: true, likes: true, moodTags: true } },
      }
    });

    res.status(201).json(song);
  } catch (e) {
    console.error('createSong error:', e);
    if (e.code === 'P2002') {
      return res.status(400).json({ message: 'آهنگی با این مشخصات قبلاً وجود دارد' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};
