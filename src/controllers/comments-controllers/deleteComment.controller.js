import prisma from '../../config/db.js';

export const deleteComment = async (req, res) => {
  try {
    const id = String(req.params.id || '').trim();
    const cm = await prisma.comment.findUnique({ where: { id } });
    if (!cm) return res.status(404).json({ message: 'Comment not found' });
    if (cm.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'اجازه ندارید' });
    }

    await prisma.comment.delete({ where: { id } });
    res.json({ ok: true });
  } catch (e) {
    console.error('deleteComment error:', e);
    res.status(500).json({ message: 'Server error' });
  }
};
