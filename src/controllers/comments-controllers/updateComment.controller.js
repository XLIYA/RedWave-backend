import prisma from '../../config/db.js';

export const updateComment = async (req, res) => {
  try {
    const id = String(req.params.id || '').trim();
    const { text } = req.body || {};
    if (!text) return res.status(400).json({ message: 'text لازم است' });

    const cm = await prisma.comment.findUnique({ where: { id } });
    if (!cm) return res.status(404).json({ message: 'Comment not found' });
    if (cm.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'اجازه ندارید' });
    }

    const row = await prisma.comment.update({ where: { id }, data: { text } });
    res.json(row);
  } catch (e) {
    console.error('updateComment error:', e);
    res.status(500).json({ message: 'Server error' });
  }
};
