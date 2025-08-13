// src/controllers/commentsController.js
import prisma from '../config/db.js';

export const listComments = async (req, res) => {
  try {
    const songId = String(req.params.songId || '').trim();
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const take = Math.min(Math.max(parseInt(req.query.pageSize || '12', 10), 1), 100);
    const skip = (page - 1) * take;

    const where = { songId };
    const [items, total] = await prisma.$transaction([
      prisma.comment.findMany({
        where, skip, take,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { id: true, username: true } } },
      }),
      prisma.comment.count({ where }),
    ]);
    res.json({ items, page, pageSize: take, total, pages: Math.ceil(total / take) });
  } catch (e) {
    console.error('listComments error:', e);
    res.status(500).json({ message: 'Server error' });
  }
};

export const addComment = async (req, res) => {
  try {
    const songId = String(req.params.songId || '').trim();
    const { text } = req.body || {};
    if (!text) return res.status(400).json({ message: 'text لازم است' });

    const row = await prisma.comment.create({
      data: { songId, userId: req.user.id, text },
      include: { user: { select: { id: true, username: true } } },
    });
    res.status(201).json(row);
  } catch (e) {
    console.error('addComment error:', e);
    res.status(500).json({ message: 'Server error' });
  }
};

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
