import prisma from '../../config/db.js';

export const deleteSong = async (req, res) => {
  try {
    const id = String(req.params.id || '').trim();
    if (!id) return res.status(400).json({ message: 'شناسه نامعتبر است' });

    const song = await prisma.song.findUnique({ where: { id } });
    if (!song) return res.status(404).json({ message: 'Song not found' });

    if (song.uploadedById !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'اجازه ندارید' });
    }

    await prisma.song.delete({ where: { id } });

    res.json({ ok: true, message: 'آهنگ با موفقیت حذف شد' });
  } catch (e) {
    console.error('deleteSong error:', e);
    res.status(500).json({ message: 'Server error' });
  }
};
