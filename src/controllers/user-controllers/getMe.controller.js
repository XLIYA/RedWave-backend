import prisma from '../../config/db.js';

export const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true, username: true, role: true, bio: true,
        profileImage: true, socialLinks: true, isOnline: true, lastSeen: true,
        createdAt: true, updatedAt: true,
        _count: { select: { followers: true, following: true, songs: true, likes: true, playlists: true } },
      },
    });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (e) {
    console.error('getMe error:', e);
    res.status(500).json({ message: 'Server error' });
  }
};
