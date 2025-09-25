import prisma from '../../config/db.js';

export const getUserById = async (req, res) => {
  try {
    const id = String(req.params.id || '').trim();
    if (!id) return res.status(400).json({ message: 'شناسه نامعتبر است' });

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true, username: true, role: true, bio: true,
        profileImage: true, socialLinks: true, isOnline: true, lastSeen: true,
        createdAt: true, updatedAt: true,
        _count: { select: { followers: true, following: true, songs: true, likes: true, playlists: true } },
      },
    });
    if (!user) return res.status(404).json({ message: 'User not found' });

    let isFollowing = false;
    if (req.user && req.user.id !== id) {
      const followRecord = await prisma.follow.findUnique({
        where: { followerId_followingId: { followerId: req.user.id, followingId: id } }
      });
      isFollowing = !!followRecord;
    }

    res.json({ ...user, isFollowing });
  } catch (e) {
    console.error('getUserById error:', e);
    res.status(500).json({ message: 'Server error' });
  }
};
