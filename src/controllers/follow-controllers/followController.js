// src/controllers/followController.js
import prisma from '../../config/db.js';

export const followUser = async (req, res) => {
  try {
    const id = String(req.params.id || '').trim();
    if (id === req.user.id) return res.status(400).json({ message: 'نمی‌توانید خودتان را فالو کنید' });

    await prisma.follow.upsert({
      where: { followerId_followingId: { followerId: req.user.id, followingId: id } },
      update: {},
      create: { followerId: req.user.id, followingId: id },
    });
    res.json({ ok: true });
  } catch (e) {
    console.error('followUser error:', e);
    res.status(500).json({ message: 'Server error' });
  }
};

export const unfollowUser = async (req, res) => {
  try {
    const id = String(req.params.id || '').trim();
    await prisma.follow.deleteMany({
      where: { followerId: req.user.id, followingId: id },
    });
    res.json({ ok: true });
  } catch (e) {
    console.error('unfollowUser error:', e);
    res.status(500).json({ message: 'Server error' });
  }
};

export const listFollowers = async (req, res) => {
  try {
    const id = String(req.params.id || req.user.id || '').trim();
    const rows = await prisma.follow.findMany({
      where: { followingId: id },
      include: { follower: { select: { id: true, username: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ items: rows.map(r => r.follower) });
  } catch (e) {
    console.error('listFollowers error:', e);
    res.status(500).json({ message: 'Server error' });
  }
};

export const listFollowing = async (req, res) => {
  try {
    const id = String(req.params.id || req.user.id || '').trim();
    const rows = await prisma.follow.findMany({
      where: { followerId: id },
      include: { following: { select: { id: true, username: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ items: rows.map(r => r.following) });
  } catch (e) {
    console.error('listFollowing error:', e);
    res.status(500).json({ message: 'Server error' });
  }
};
