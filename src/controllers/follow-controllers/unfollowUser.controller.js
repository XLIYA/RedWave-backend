import prisma from '../../config/db.js';

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
