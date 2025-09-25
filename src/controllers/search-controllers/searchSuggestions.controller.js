// src/controllers/search/searchSuggestions.controller.js
import prisma from '../../config/db.js';

export const searchSuggestions = async (req, res) => {
  try {
    const q = String(req.query.q || '').trim();
    if (!q || q.length < 2) {
      return res.json({ suggestions: [] });
    }

    const limit = Math.min(parseInt(req.query.limit || '10', 10), 20);

    const [titleSuggestions, artistSuggestions] = await prisma.$transaction([
      prisma.song.findMany({
        where: { title: { contains: q, mode: 'insensitive' } },
        select: { title: true },
        take: limit,
        distinct: ['title'],
      }),
      prisma.song.findMany({
        where: { artist: { contains: q, mode: 'insensitive' } },
        select: { artist: true },
        take: limit,
        distinct: ['artist'],
      }),
    ]);

    const suggestions = [
      ...titleSuggestions.map((s) => ({ type: 'title', value: s.title })),
      ...artistSuggestions.map((s) => ({ type: 'artist', value: s.artist })),
    ].slice(0, limit);

    res.json({ suggestions });
  } catch (e) {
    console.error('searchSuggestions error:', e);
    res.status(500).json({ message: 'Server error' });
  }
};
