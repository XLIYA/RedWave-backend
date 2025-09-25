import prisma from '../../config/db.js';

export const getUserPlaylists = async (req, res) => {
  try {
    const userId = String(req.params.id || '').trim();
    if (!userId) return res.status(400).json({ message: 'شناسه کاربر نامعتبر است' });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const take = Math.min(Math.max(parseInt(req.query.pageSize || '12', 10), 1), 50);
    const skip = (page - 1) * take;

    const where = { ownerId: userId };
    const [items, total] = await prisma.$transaction([
      prisma.playlist.findMany({
        where, skip, take, orderBy: { createdAt: 'asc' }, // یا 'desc' طبق ترجیح
        include: {
          owner: { select: { id: true, username: true, profileImage: true } },
          _count: { select: { songs: true } }
        },
      }),
      prisma.playlist.count({ where }),
    ]);

    res.json({
      items, page, pageSize: take, total, pages: Math.ceil(total / take),
      user: { id: user.id, username: user.username, profileImage: user.profileImage }
    });
  } catch (e) {
    console.error('getUserPlaylists error:', e);
    res.status(500).json({ message: 'Server error' });
  }
};
