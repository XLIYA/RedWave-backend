import prisma from '../../config/db.js';

export const updateMe = async (req, res) => {
  try {
    const { bio, profileImage, socialLinks } = req.body || {};
    const updateData = {};

    if (bio !== undefined) updateData.bio = bio?.trim() || null;
    if (profileImage !== undefined) updateData.profileImage = profileImage?.trim() || null;
    if (socialLinks !== undefined) {
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
        id: true, username: true, role: true, bio: true,
        profileImage: true, socialLinks: true, isOnline: true, lastSeen: true,
        createdAt: true, updatedAt: true,
        _count: { select: { followers: true, following: true, songs: true, likes: true, playlists: true } },
      },
    });

    res.json(updatedUser);
  } catch (e) {
    console.error('updateMe error:', e);
    res.status(500).json({ message: 'Server error' });
  }
};
