// src/controllers/songController.js
import prisma from '../config/db.js';
import { normalize } from '../utils/normalize.js';

// Create
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
    if (isNaN(parsedDate.getTime())) return res.status(400).json({ message: 'تاریخ انتشار نامعتبر است' });

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

// Read
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

// List (paginated + filters)
export const listSongs = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const take = Math.min(Math.max(parseInt(req.query.pageSize || '12', 10), 1), 50);
    const skip = (page - 1) * take;

    const qRaw = String(req.query.q || '').trim();
    const genre = String(req.query.genre || '').trim();
    const artist = String(req.query.artist || '').trim();
    const order = (req.query.order || 'recent').toString();

    const contains = (field, val) => ({ [field]: { contains: val, mode: 'insensitive' } });
    const qNorm = normalize(qRaw);

    const whereAND = [];
    if (qRaw) {
      whereAND.push({
        OR: [
          contains('title', qRaw),
          contains('artist', qRaw),
          contains('genre', qRaw),
          { searchKey: { contains: qNorm } },
        ],
      });
    }
    if (genre) whereAND.push(contains('genre', genre));
    if (artist) whereAND.push(contains('artist', artist));

    const where = whereAND.length ? { AND: whereAND } : {};

    let orderBy;
    switch (order) {
      case 'popular':
        orderBy = [{ analytics: { playCount: 'desc' } }, { createdAt: 'desc' }];
        break;
      case 'trending':
        orderBy = [{ analytics: { lastPlayed: 'desc' } }, { analytics: { playCount: 'desc' } }, { createdAt: 'desc' }];
        break;
      case 'alphabetical':
        orderBy = [{ title: 'asc' }, { artist: 'asc' }];
        break;
      default:
        orderBy = [{ createdAt: 'desc' }];
    }

    const [items, total] = await prisma.$transaction([
      prisma.song.findMany({
        where, orderBy, skip, take,
        include: {
          uploadedBy: { select: { id: true, username: true, profileImage: true } },
          analytics: true,
          _count: { select: { comments: true, likes: true, moodTags: true } },
        },
      }),
      prisma.song.count({ where }),
    ]);

    res.json({
      items,
      page,
      pageSize: take,
      total,
      pages: Math.ceil(total / take),
      filters: { q: qRaw, genre, artist, order }
    });
  } catch (e) {
    console.error('listSongs error:', e);
    res.status(500).json({ message: 'Server error' });
  }
};

// Play (idempotent)
export const playSong = async (req, res) => {
  const songId = String(req.params.id || '').trim();
  if (!songId) return res.status(400).json({ message: 'شناسه نامعتبر است' });

  const userId = req.user?.id || null;

  try {
    // 1) وجود آهنگ
    const song = await prisma.song.findUnique({
      where: { id: songId },
      select: { id: true, title: true, artist: true }
    });
    if (!song) return res.status(404).json({ message: 'Song not found' });

    // 2) تلاش برای ثبت اولین پخش برای user+song بیرون از ترنزکشن (جلوگیری از 25P02)
    let isFirstListen = false;
    if (userId) {
      try {
        await prisma.userSongPlay.create({ data: { userId, songId } });
        isFirstListen = true;
      } catch (e) {
        // اگر تکراری بود، یعنی قبلاً ثبت شده؛ نادیده می‌گیریم
        if (e?.code !== 'P2002') {
          throw e;
        }
      }
    }

    // 3) ترنزکشن تمیز برای آپدیت شمارنده‌ها (بدون ریسک خطای قبلی)
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
      data: {
        song,
        analytics,
        uniqueIncreased: isFirstListen
      }
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

// Top
export const listTopSongs = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const take = Math.min(Math.max(parseInt(req.query.pageSize || '12', 10), 1), 50);
    const skip = (page - 1) * take;

    const [items, total] = await prisma.$transaction([
      prisma.song.findMany({
        skip, take,
        orderBy: [
          { analytics: { playCount: 'desc' } },
          { analytics: { lastPlayed: 'desc' } },
          { createdAt: 'desc' }
        ],
        include: {
          uploadedBy: { select: { id: true, username: true } },
          analytics: true,
          _count: { select: { comments: true, likes: true, moodTags: true } }
        }
      }),
      prisma.song.count()
    ]);

    res.json({
      items, page, pageSize: take, total, pages: Math.ceil(total / take),
      filters: {}
    });
  } catch (e) {
    console.error('listTopSongs error:', e);
    res.status(500).json({ message: 'Server error' });
  }
};

// Trending (window filter)
export const listTrendingSongs = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const take = Math.min(Math.max(parseInt(req.query.pageSize || '12', 10), 1), 50);
    const skip = (page - 1) * take;

    const windowDays = Math.max(parseInt(req.query.windowDays || '30', 10), 1);
    const minPlays = Math.max(parseInt(req.query.minPlays || '0', 10), 0);
    const windowStart = new Date(Date.now() - windowDays * 24 * 60 * 60 * 1000);

    const where = {
      analytics: {
        lastPlayed: { gte: windowStart },
        playCount: { gte: minPlays }
      }
    };

    const [items, total] = await prisma.$transaction([
      prisma.song.findMany({
        skip, take, where,
        orderBy: [
          { analytics: { lastPlayed: 'desc' } },
          { analytics: { playCount: 'desc' } },
          { createdAt: 'desc' }
        ],
        include: {
          uploadedBy: { select: { id: true, username: true } },
          analytics: true,
          _count: { select: { comments: true, likes: true, moodTags: true } }
        }
      }),
      prisma.song.count({ where })
    ]);

    res.json({
      items, page, pageSize: take, total, pages: Math.ceil(total / take),
      filters: { windowDays, minPlays }
    });
  } catch (e) {
    console.error('listTrendingSongs error:', e);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update
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

// Delete
export const deleteSong = async (req, res) => {
  try {
    const id = String(req.params.id || '').trim();
    if (!id) return res.status(400).json({ message: 'شناسه نامعتبر است' });

    const song = await prisma.song.findUnique({ where: { id } });
    if (!song) return res.status(404).json({ message: 'Song not found' });

    if (song.uploadedById !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'اجازه ندارید' });
    }

    await prisma.song.delete({ where: { id } });

    res.json({ ok: true, message: 'آهنگ با موفقیت حذف شد' });
  } catch (e) {
    console.error('deleteSong error:', e);
    res.status(500).json({ message: 'Server error' });
  }
};
