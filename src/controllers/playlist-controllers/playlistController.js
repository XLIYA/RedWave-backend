// src/controllers/playlistController.js
import prisma from '../../config/db.js';

export const createPlaylist = async (req, res) => {
  try {
    const { name, description } = req.body || {};
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ message: 'name لازم است' });
    }

    const playlist = await prisma.playlist.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        ownerId: req.user.id,
      },
      include: {
        owner: { select: { id: true, username: true } },
        _count: { select: { songs: true } }
      }
    });
    res.status(201).json(playlist);
  } catch (e) {
    console.error('createPlaylist error:', e);
    res.status(500).json({ message: 'Server error' });
  }
};

export const myPlaylists = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const take = Math.min(Math.max(parseInt(req.query.pageSize || '12', 10), 1), 50);
    const skip = (page - 1) * take;

    const where = { ownerId: req.user.id };
    const [items, total] = await prisma.$transaction([
      prisma.playlist.findMany({
        where, 
        skip, 
        take,
        orderBy: { createdAt: 'desc' },
        include: { 
          owner: { select: { id: true, username: true } },
          _count: { select: { songs: true } }
        },
      }),
      prisma.playlist.count({ where }),
    ]);

    res.json({ 
      items, 
      page, 
      pageSize: take, 
      total, 
      pages: Math.ceil(total / take) 
    });
  } catch (e) {
    console.error('myPlaylists error:', e);
    res.status(500).json({ message: 'Server error' });
  }
};

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
                  select: { 
                    comments: true, 
                    likes: true, 
                    moodTags: true 
                  } 
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
      addedAt: s.createdAt // زمان اضافه شدن به playlist
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

export const addSongToPlaylist = async (req, res) => {
  try {
    const id = String(req.params.id || '').trim();
    const { songId } = req.body || {};
    
    if (!id || !songId) {
      return res.status(400).json({ message: 'id و songId لازم‌اند' });
    }

    // بررسی وجود playlist
    const pl = await prisma.playlist.findUnique({ where: { id } });
    if (!pl) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    // بررسی مجوز
    if (pl.ownerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'اجازه ندارید' });
    }

    // بررسی وجود آهنگ
    const song = await prisma.song.findUnique({ where: { id: songId } });
    if (!song) {
      return res.status(404).json({ message: 'Song not found' });
    }

    // اضافه کردن آهنگ (اگر قبلاً اضافه نشده باشد)
    const result = await prisma.playlistSong.upsert({
      where: { 
        playlistId_songId: { 
          playlistId: id, 
          songId 
        } 
      },
      update: { createdAt: new Date() }, // به‌روزرسانی زمان
      create: { 
        playlistId: id, 
        songId 
      },
    });

    res.json({ 
      ok: true, 
      message: 'آهنگ با موفقیت اضافه شد',
      playlistSong: result
    });
  } catch (e) {
    console.error('addSongToPlaylist error:', e);
    res.status(500).json({ message: 'Server error' });
  }
};

export const removeSongFromPlaylist = async (req, res) => {
  try {
    const id = String(req.params.id || '').trim();
    const songId = String(req.params.songId || '').trim();
    
    if (!id || !songId) {
      return res.status(400).json({ message: 'id و songId لازم‌اند' });
    }

    // بررسی وجود playlist
    const pl = await prisma.playlist.findUnique({ where: { id } });
    if (!pl) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    // بررسی مجوز
    if (pl.ownerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'اجازه ندارید' });
    }

    // حذف آهنگ از playlist
    const deleteResult = await prisma.playlistSong.deleteMany({ 
      where: { 
        playlistId: id, 
        songId 
      } 
    });

    if (deleteResult.count === 0) {
      return res.status(404).json({ message: 'آهنگ در این playlist یافت نشد' });
    }

    res.json({ 
      ok: true, 
      message: 'آهنگ با موفقیت حذف شد' 
    });
  } catch (e) {
    console.error('removeSongFromPlaylist error:', e);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updatePlaylist = async (req, res) => {
  try {
    const id = String(req.params.id || '').trim();
    const { name, description } = req.body || {};
    
    if (!id) {
      return res.status(400).json({ message: 'شناسه نامعتبر است' });
    }

    // بررسی وجود playlist
    const pl = await prisma.playlist.findUnique({ where: { id } });
    if (!pl) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    // بررسی مجوز
    if (pl.ownerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'اجازه ندارید' });
    }

    // آماده کردن داده‌های به‌روزرسانی
    const updateData = {};
    if (name && name.trim().length > 0) {
      updateData.name = name.trim();
    }
    if (description !== undefined) {
      updateData.description = description?.trim() || null;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: 'حداقل یک فیلد برای به‌روزرسانی لازم است' });
    }

    const updatedPlaylist = await prisma.playlist.update({
      where: { id },
      data: updateData,
      include: {
        owner: { select: { id: true, username: true } },
        _count: { select: { songs: true } }
      }
    });

    res.json(updatedPlaylist);
  } catch (e) {
    console.error('updatePlaylist error:', e);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deletePlaylist = async (req, res) => {
  try {
    const id = String(req.params.id || '').trim();
    
    if (!id) {
      return res.status(400).json({ message: 'شناسه نامعتبر است' });
    }

    // بررسی وجود playlist
    const pl = await prisma.playlist.findUnique({ where: { id } });
    if (!pl) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    // بررسی مجوز
    if (pl.ownerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'اجازه ندارید' });
    }

    // حذف playlist (به دلیل cascade، آهنگ‌ها هم حذف می‌شوند)
    await prisma.playlist.delete({ where: { id } });

    res.json({ 
      ok: true, 
      message: 'Playlist با موفقیت حذف شد' 
    });
  } catch (e) {
    console.error('deletePlaylist error:', e);
    res.status(500).json({ message: 'Server error' });
  }
};

// aliases برای هم‌خوانی با روتر
export { myPlaylists as getMyPlaylists };
export { getPlaylistById as getPlaylist };