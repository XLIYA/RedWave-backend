// src/controllers/userController.js
import prisma from '../config/db.js';
import { normalize } from '../utils/normalize.js';
import bcrypt from 'bcryptjs';

export const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true, 
        username: true, 
        role: true, 
        bio: true,
        profileImage: true,
        socialLinks: true,
        isOnline: true,
        lastSeen: true,
        createdAt: true, 
        updatedAt: true,
        _count: { 
          select: { 
            followers: true, 
            following: true,
            songs: true,
            likes: true,
            playlists: true
          } 
        },
      },
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (e) {
    console.error('getMe error:', e);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getUserById = async (req, res) => {
  try {
    const id = String(req.params.id || '').trim();
    if (!id) {
      return res.status(400).json({ message: 'شناسه نامعتبر است' });
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true, 
        username: true, 
        role: true, 
        bio: true,
        profileImage: true,
        socialLinks: true,
        isOnline: true,
        lastSeen: true,
        createdAt: true, 
        updatedAt: true,
        _count: { 
          select: { 
            followers: true, 
            following: true,
            songs: true,
            likes: true,
            playlists: true
          } 
        },
      },
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // اگر کاربر لاگین کرده، بررسی کن که آیا این کاربر را فالو می‌کند
    let isFollowing = false;
    if (req.user && req.user.id !== id) {
      const followRecord = await prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: req.user.id,
            followingId: id
          }
        }
      });
      isFollowing = !!followRecord;
    }
    
    res.json({
      ...user,
      isFollowing
    });
  } catch (e) {
    console.error('getUserById error:', e);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateMe = async (req, res) => {
  try {
    const { bio, profileImage, socialLinks } = req.body || {};
    
    const updateData = {};
    
    if (bio !== undefined) {
      updateData.bio = bio?.trim() || null;
    }
    if (profileImage !== undefined) {
      updateData.profileImage = profileImage?.trim() || null;
    }
    if (socialLinks !== undefined) {
      // اعتبارسنجی socialLinks به عنوان JSON object
      if (socialLinks === null || typeof socialLinks === 'object') {
        updateData.socialLinks = socialLinks;
      } else {
        return res.status(400).json({ message: 'socialLinks باید object یا null باشد' });
      }
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: 'حداقل یک فیلد برای به‌روزرسانی لازم است' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
      select: {
        id: true, 
        username: true, 
        role: true, 
        bio: true,
        profileImage: true,
        socialLinks: true,
        isOnline: true,
        lastSeen: true,
        createdAt: true, 
        updatedAt: true,
        _count: { 
          select: { 
            followers: true, 
            following: true,
            songs: true,
            likes: true,
            playlists: true
          } 
        },
      },
    });

    res.json(updatedUser);
  } catch (e) {
    console.error('updateMe error:', e);
    res.status(500).json({ message: 'Server error' });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body || {};
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'رمز فعلی و رمز جدید لازم‌اند' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'رمز جدید باید حداقل 6 کاراکتر باشد' });
    }

    // گرفتن کاربر با رمز
    const user = await prisma.user.findUnique({ 
      where: { id: req.user.id },
      select: { id: true, password: true }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // بررسی رمز فعلی
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ message: 'رمز فعلی اشتباه است' });
    }

    // هش کردن رمز جدید
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    
    // به‌روزرسانی رمز
    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedNewPassword }
    });

    res.json({ 
      ok: true, 
      message: 'رمز عبور با موفقیت تغییر کرد' 
    });
  } catch (e) {
    console.error('changePassword error:', e);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getMyUploads = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const take = Math.min(Math.max(parseInt(req.query.pageSize || '12', 10), 1), 50);
    const skip = (page - 1) * take;

    const qRaw = String(req.query.q || '').trim();
    const genre = String(req.query.genre || '').trim();
    const order = (req.query.order || 'recent').toString();

    const contains = (field, val) => ({ 
      [field]: { 
        contains: val, 
        mode: 'insensitive' 
      } 
    });
    const qNorm = normalize(qRaw);

    const whereAND = [{ uploadedById: req.user.id }];
    
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
    if (genre) {
      whereAND.push(contains('genre', genre));
    }

    const where = { AND: whereAND };
    
    let orderBy;
    switch (order) {
      case 'popular':
        orderBy = [
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
      filters: { q: qRaw, genre, order }
    });
  } catch (e) {
    console.error('getMyUploads error:', e);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getMyLikes = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const take = Math.min(Math.max(parseInt(req.query.pageSize || '12', 10), 1), 50);
    const skip = (page - 1) * take;

    const [rows, total] = await prisma.$transaction([
      prisma.like.findMany({
        where: { userId: req.user.id },
        orderBy: { createdAt: 'desc' },
        skip, 
        take,
        include: {
          song: {
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
          },
        },
      }),
      prisma.like.count({ where: { userId: req.user.id } }),
    ]);

    const items = rows.map(r => ({
      likedAt: r.createdAt,
      ...r.song,
    }));

    res.json({ 
      items, 
      page, 
      pageSize: take, 
      total, 
      pages: Math.ceil(total / take) 
    });
  } catch (e) {
    console.error('getMyLikes error:', e);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getUserUploads = async (req, res) => {
  try {
    const userId = String(req.params.id || '').trim();
    if (!userId) {
      return res.status(400).json({ message: 'شناسه کاربر نامعتبر است' });
    }

    // بررسی وجود کاربر
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const take = Math.min(Math.max(parseInt(req.query.pageSize || '12', 10), 1), 50);
    const skip = (page - 1) * take;

    const qRaw = String(req.query.q || '').trim();
    const genre = String(req.query.genre || '').trim();
    const order = (req.query.order || 'recent').toString();

    const contains = (field, val) => ({ 
      [field]: { 
        contains: val, 
        mode: 'insensitive' 
      } 
    });
    const qNorm = normalize(qRaw);

    const whereAND = [{ uploadedById: userId }];
    
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
    if (genre) {
      whereAND.push(contains('genre', genre));
    }

    const where = { AND: whereAND };
    
    let orderBy;
    switch (order) {
      case 'popular':
        orderBy = [
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
      user: {
        id: user.id,
        username: user.username,
        profileImage: user.profileImage
      },
      filters: { q: qRaw, genre, order }
    });
  } catch (e) {
    console.error('getUserUploads error:', e);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getUserPlaylists = async (req, res) => {
  try {
    const userId = String(req.params.id || '').trim();
    if (!userId) {
      return res.status(400).json({ message: 'شناسه کاربر نامعتبر است' });
    }

    // بررسی وجود کاربر
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const take = Math.min(Math.max(parseInt(req.query.pageSize || '12', 10), 1), 50);
    const skip = (page - 1) * take;

    const where = { ownerId: userId };
    const [items, total] = await prisma.$transaction([
      prisma.playlist.findMany({
        where, 
        skip, 
        take,
        orderBy: { createdAt: 'desc' },
        include: { 
          owner: { select: { id: true, username: true, profileImage: true } },
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
      pages: Math.ceil(total / take),
      user: {
        id: user.id,
        username: user.username,
        profileImage: user.profileImage
      }
    });
  } catch (e) {
    console.error('getUserPlaylists error:', e);
    res.status(500).json({ message: 'Server error' });
  }
};

export const setOnlineStatus = async (req, res) => {
  try {
    const { isOnline } = req.body || {};
    
    if (typeof isOnline !== 'boolean') {
      return res.status(400).json({ message: 'isOnline باید boolean باشد' });
    }

    const updateData = {
      isOnline,
      lastSeen: new Date()
    };

    await prisma.user.update({
      where: { id: req.user.id },
      data: updateData
    });

    res.json({ 
      ok: true, 
      message: 'وضعیت آنلاین به‌روزرسانی شد',
      isOnline,
      lastSeen: updateData.lastSeen
    });
  } catch (e) {
    console.error('setOnlineStatus error:', e);
    res.status(500).json({ message: 'Server error' });
  }
};