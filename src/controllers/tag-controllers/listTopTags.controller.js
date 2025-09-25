import prisma from '../../config/db.js';

export const listTopTags = async (_req, res) => {
  try {
    const rows = await prisma.$queryRaw`
      SELECT "tag", COUNT(*)::int AS "count"
      FROM "public"."MoodTag"
      GROUP BY "tag"
      ORDER BY COUNT(*) DESC
      LIMIT 50
    `;
    res.json({ items: rows });
  } catch (e) {
    console.error('listTopTags error:', e);
    res.status(500).json({ message: 'Server error' });
  }
};
