// src/controllers/songController.js
import prisma from '../config/db.js';
import { normalize } from '../utils/normalize.js';

export const createSong = async (req, res) => {
  try {
    const { title, artist, genre, releaseDate, coverImage, fileUrl } = req.body || {};
    
    // اعتبارسنجی کامل
    if (!title?.trim()) {
      return res.status(400).json({ message: 'عنوان آهنگ لازم است' });
    }
    if (!artist?.trim()) {
      return res.status(400).json({ message: 'نام هنرمند لازم است' });
    }
    if (!genre?.trim()) {
      return res.status(400).json({ message: 'ژانر لازم است' });
    }
    if (!releaseDate) {
      return res.status(400).json({ message: 'تاریخ انتشار لازم است' });
    }
    if (!coverImage?.trim()) {
      return res.status(400).json({ message: 'تصویر کاور لازم است' });
    }
    if (!fileUrl?.trim()) {
      return res.status(400).json({ message: 'فایل صوتی لازم است' });
    }

    // بررسی تاریخ معتبر
    const parsedDate = new Date(releaseDate);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({ message: 'تاریخ انتشار نامعتبر است' });
    }

    // ساخت searchKey
    const searchKey = normalize(`${title.trim()}${artist.trim()}${genre.trim()}`);
    
    // بررسی تکراری نبودن
    const existing = await prisma.song.findFirst({
      where: {
        title: title.trim(),
        artist: artist.trim(),
      }
    });
    
    if (existing) {
      return res.status(400).json({ message: 'آهنگی با این عنوان و هنرمند قبلاً وجود دارد' });
    }

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
        _count: { 
          select: { 
            comments: true, 
            likes: true, 
            moodTags: true 
          } 
        },
      }
    });

    res.status(201).json(song);
  } catch (e) {
    console.error('createSong error:', e);
    
    // بررسی خطای unique constraint
    if (e.code === 'P2002') {
      return res.status(400).json({ message: 'آهنگی با این مشخصات قبلاً وجود دارد' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
};

export const getSong = async (req, res) => {
  try {
    const id = String(req.params.id || '').trim();
    if (!id) {
      return res.status(400).json({ message: 'شناسه نامعتبر است' });
    }

    const song = await prisma.song.findUnique({
      where: { id },
      include: {
        analytics: true,
        lyrics: true,
        uploadedBy: { select: { id: true, username: true, profileImage: true } },
        _count: { 
          select: { 
            comments: true, 
            likes: true, 
            moodTags: true 
          } 
        },
      },
    });
    
    if (!song) {
      return res.status(404).json({ message: 'Song not found' });
    }

    res.json(song);
  } catch (e) {
    console.error('getSong error:', e);
    res.status(500).json({ message: 'Server error' });
  }
};

export const listSongs = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const take = Math.min(Math.max(parseInt(req.query.pageSize || '12', 10), 1), 50);
    const skip = (page - 1) * take;

    const qRaw = String(req.query.q || '').trim();
    const genre = String(req.query.genre || '').trim();
    const artist = String(req.query.artist || '').trim();
    const order = (req.query.order || 'recent').toString();

    const contains = (field, val) => ({ 
      [field]: { 
        contains: val, 
        mode: 'insensitive' 
      } 
    });
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
    
    // بهبود orderBy
    let orderBy;
    switch (order) {
      case 'popular':
        orderBy = [
          { analytics: { playCount: 'desc' } }, 
          { createdAt: 'desc' }
        ];
        break;
      case 'trending':
        orderBy = [
          { analytics: { lastPlayed: 'desc' } },
          { analytics: { playCount: 'desc' } },
          { createdAt: 'desc' }
        ];
        break;
      case 'alphabetical':
        orderBy = [
          { title: 'asc' },
          { artist: 'asc' }
        ];
        break;
      default: // recent
        orderBy = [{ createdAt: 'desc' }];
    }

    const [items, total] = await prisma.$transaction([
      prisma.song.findMany({
        where, 
        orderBy, 
        skip, 
        take,
        include: {
          uploadedBy: { select: { id: true, username: true, profileImage: true } },
          analytics: true,
          _count: { 
            select: { 
              comments: true, 
              likes: true, 
              moodTags: true 
            } 
          },
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

export const playSong = async (req, res) => {
  try {
    const id = String(req.params.id || '').trim();
    if (!id) {
      return res.status(400).json({ message: 'شناسه نامعتبر است' });
    }

    // بررسی وجود آهنگ
    const song = await prisma.song.findUnique({ where: { id } });
    if (!song) {
      return res.status(404).json({ message: 'Song not found' });
    }

    // TODO: در آینده باید uniqueListeners را بر اساس userId واقعی محاسبه کنیم
    const userId = req.user?.id; // اگر کاربر لاگین باشد
    
    const updated = await prisma.analytics.upsert({
      where: { songId: id },
      update: {
        playCount: { increment: 1 },
        uniqueListeners: { increment: 1 }, // فعلاً همیشه +1، بعداً باید بهبود یابد
        lastPlayed: new Date(),
      },
      create: { 
        songId: id, 
        playCount: 1, 
        uniqueListeners: 1, 
        lastPlayed: new Date() 
      },
      include: {
        song: {
          select: {
            id: true,
            title: true,
            artist: true
          }
        }
      }
    });

    res.json({
      ...updated,
      message: 'Play count updated successfully'
    });
  } catch (e) {
    console.error('playSong error:', e);
    res.status(500).json({ message: 'Server error' });
  }
};

// Emergency Fix برای src/controllers/songController.js
// این کدها را جایگزین listTopSongs و listTrendingSongs کنید

export const listTopSongs = async (req, res) => {
  try {
    console.log('🏆 listTopSongs called');
    
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const take = Math.min(Math.max(parseInt(req.query.pageSize || '12', 10), 1), 50);
    const skip = (page - 1) * take;
    
    console.log('Query params:', { page, take, skip });

    // سادهترین query ممکن - بدون analytics
    const allSongs = await prisma.song.findMany({
      skip,
      take,
      orderBy: { createdAt: 'desc' }, // ابتدا از تاریخ استفاده کنیم
      include: {
        uploadedBy: { 
          select: { 
            id: true, 
            username: true 
          } 
        },
        analytics: true, // فقط include کنیم، در orderBy استفاده نکنیم
        _count: { 
          select: { 
            comments: true, 
            likes: true, 
            moodTags: true 
          } 
        },
      },
    });

    console.log('Found songs:', allSongs.length);

    // حالا در JavaScript sort کنیم
    const sortedSongs = allSongs.sort((a, b) => {
      const aPlays = a.analytics?.playCount || 0;
      const bPlays = b.analytics?.playCount || 0;
      
      if (bPlays !== aPlays) {
        return bPlays - aPlays; // descending by playCount
      }
      
      // اگر playCount برابر بود، از تاریخ استفاده کن
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    const total = await prisma.song.count();

    console.log('✅ Top songs success:', { total, returned: sortedSongs.length });

    res.json({ 
      items: sortedSongs, 
      page, 
      pageSize: take, 
      total, 
      pages: Math.ceil(total / take),
      note: "Sorted by play count (in-memory)"
    });

  } catch (e) {
    console.error('❌ listTopSongs error:', e.message);
    console.error('Stack:', e.stack);
    
    res.status(500).json({ 
      message: 'Top songs error',
      error: e.message,
      timestamp: new Date().toISOString()
    });
  }
};

export const listTrendingSongs = async (req, res) => {
  try {
    console.log('📈 listTrendingSongs called');
    
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const take = Math.min(Math.max(parseInt(req.query.pageSize || '12', 10), 1), 50);
    const skip = (page - 1) * take;
    
    const windowDays = Math.max(parseInt(req.query.windowDays || '30', 10), 1);
    const minPlays = Math.max(parseInt(req.query.minPlays || '0', 10), 0);
    
    console.log('Query params:', { page, take, skip, windowDays, minPlays });

    // سادهترین query
    const allSongs = await prisma.song.findMany({
      skip,
      take,
      orderBy: { createdAt: 'desc' }, // ابتدا از تاریخ استفاده کنیم
      include: {
        uploadedBy: { 
          select: { 
            id: true, 
            username: true 
          } 
        },
        analytics: true,
        _count: { 
          select: { 
            comments: true, 
            likes: true, 
            moodTags: true 
          } 
        },
      },
    });

    console.log('Found songs:', allSongs.length);

    const now = new Date();
    const windowStart = new Date(now.getTime() - windowDays * 24 * 60 * 60 * 1000);

    // فیلتر و sort در JavaScript
    const trendingSongs = allSongs
      .filter(song => {
        // اگر analytics نداشت، شامل کن
        if (!song.analytics) return true;
        
        // اگر playCount کمتر از minimum بود، رد کن
        if (song.analytics.playCount < minPlays) return false;
        
        // اگر در window نبود، رد کن
        const lastPlayed = new Date(song.analytics.lastPlayed);
        if (lastPlayed < windowStart) return false;
        
        return true;
      })
      .sort((a, b) => {
        const aLastPlayed = a.analytics?.lastPlayed ? new Date(a.analytics.lastPlayed) : new Date(a.createdAt);
        const bLastPlayed = b.analytics?.lastPlayed ? new Date(b.analytics.lastPlayed) : new Date(b.createdAt);
        
        // اول بر اساس آخرین پخش
        if (bLastPlayed.getTime() !== aLastPlayed.getTime()) {
          return bLastPlayed - aLastPlayed;
        }
        
        // بعد بر اساس play count
        const aPlays = a.analytics?.playCount || 0;
        const bPlays = b.analytics?.playCount || 0;
        if (bPlays !== aPlays) {
          return bPlays - aPlays;
        }
        
        // در نهایت بر اساس تاریخ ایجاد
        return new Date(b.createdAt) - new Date(a.createdAt);
      });

    const total = await prisma.song.count();

    console.log('✅ Trending songs success:', { 
      total, 
      returned: trendingSongs.length,
      windowStart: windowStart.toISOString()
    });

    res.json({
      items: trendingSongs,
      page,
      pageSize: take,
      total: trendingSongs.length, // تعداد واقعی نتایج trending
      pages: Math.ceil(trendingSongs.length / take),
      meta: { 
        windowDays, 
        minPlays,
        windowStart: windowStart.toISOString(),
        note: "Filtered and sorted in-memory"
      },
    });

  } catch (e) {
    console.error('❌ listTrendingSongs error:', e.message);
    console.error('Stack:', e.stack);
    
    res.status(500).json({ 
      message: 'Trending songs error',
      error: e.message,
      timestamp: new Date().toISOString()
    });
  }
};

export const updateSong = async (req, res) => {
  try {
    const id = String(req.params.id || '').trim();
    if (!id) {
      return res.status(400).json({ message: 'شناسه نامعتبر است' });
    }

    // بررسی وجود آهنگ
    const song = await prisma.song.findUnique({ where: { id } });
    if (!song) {
      return res.status(404).json({ message: 'Song not found' });
    }

    // بررسی مجوز
    if (song.uploadedById !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'اجازه ندارید' });
    }

    const { title, artist, genre, releaseDate, coverImage } = req.body || {};
    
    // آماده کردن داده‌های به‌روزرسانی
    const updateData = {};
    
    if (title?.trim()) {
      updateData.title = title.trim();
    }
    if (artist?.trim()) {
      updateData.artist = artist.trim();
    }
    if (genre?.trim()) {
      updateData.genre = genre.trim();
    }
    if (releaseDate) {
      const parsedDate = new Date(releaseDate);
      if (!isNaN(parsedDate.getTime())) {
        updateData.releaseDate = parsedDate;
      }
    }
    if (coverImage?.trim()) {
      updateData.coverImage = coverImage.trim();
    }

    // به‌روزرسانی searchKey اگر title، artist یا genre تغییر کرده
    if (updateData.title || updateData.artist || updateData.genre) {
      const newTitle = updateData.title || song.title;
      const newArtist = updateData.artist || song.artist;
      const newGenre = updateData.genre || song.genre;
      updateData.searchKey = normalize(`${newTitle}${newArtist}${newGenre}`);
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: 'حداقل یک فیلد برای به‌روزرسانی لازم است' });
    }

    const updatedSong = await prisma.song.update({
      where: { id },
      data: updateData,
      include: {
        uploadedBy: { select: { id: true, username: true, profileImage: true } },
        analytics: true,
        lyrics: true,
        _count: { 
          select: { 
            comments: true, 
            likes: true, 
            moodTags: true 
          } 
        },
      }
    });

    res.json(updatedSong);
  } catch (e) {
    console.error('updateSong error:', e);
    
    if (e.code === 'P2002') {
      return res.status(400).json({ message: 'آهنگی با این مشخصات قبلاً وجود دارد' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteSong = async (req, res) => {
  try {
    const id = String(req.params.id || '').trim();
    if (!id) {
      return res.status(400).json({ message: 'شناسه نامعتبر است' });
    }

    // بررسی وجود آهنگ
    const song = await prisma.song.findUnique({ where: { id } });
    if (!song) {
      return res.status(404).json({ message: 'Song not found' });
    }

    // بررسی مجوز
    if (song.uploadedById !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'اجازه ندارید' });
    }

    // حذف آهنگ (cascade باعث حذف تمام related data می‌شود)
    await prisma.song.delete({ where: { id } });

    res.json({ 
      ok: true, 
      message: 'آهنگ با موفقیت حذف شد' 
    });
  } catch (e) {
    console.error('deleteSong error:', e);
    res.status(500).json({ message: 'Server error' });
  }
};