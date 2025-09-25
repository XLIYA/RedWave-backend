// src/controllers/search/search.controller.js
import prisma from '../../config/db.js';
import { normalize } from '../../utils/normalize.js';

export const search = async (req, res) => {
  try {
    const qRaw = String(req.query.q || '').trim();
    if (!qRaw) {
      return res.status(400).json({ message: 'q الزامی است' });
    }

    const qNorm = normalize(qRaw);
    const scope = String(req.query.scope || 'songs');
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const take = Math.min(Math.max(parseInt(req.query.pageSize || '20', 10), 1), 100);
    const skip = (page - 1) * take;

    const contains = (field) => ({
      [field]: {
        contains: qRaw,
        mode: 'insensitive',
      },
    });

    // users
    if (scope === 'users') {
      const where = {
        OR: [contains('username'), contains('bio')],
      };

      const [items, total] = await prisma.$transaction([
        prisma.user.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            username: true,
            bio: true,
            profileImage: true,
            createdAt: true,
            _count: {
              select: { followers: true, following: true, songs: true },
            },
          },
          skip,
          take,
        }),
        prisma.user.count({ where }),
      ]);

      return res.json({
        scope,
        q: qRaw,
        page,
        pageSize: take,
        total,
        pages: Math.ceil(total / take),
        items,
      });
    }

    // playlists
    if (scope === 'playlists') {
      const where = {
        OR: [contains('name'), contains('description')],
      };

      let [items, total] = await prisma.$transaction([
        prisma.playlist.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          include: {
            owner: { select: { id: true, username: true } },
            _count: { select: { songs: true } },
          },
          skip,
          take,
        }),
        prisma.playlist.count({ where }),
      ]);

      // fall back to similarity search
      if (total === 0 && qRaw.length >= 2) {
        try {
          const rows = await prisma.$queryRaw`
            SELECT p."id", p."name", p."description", p."ownerId", p."createdAt", p."updatedAt"
            FROM "public"."Playlist" p
            WHERE (p."name" % ${qRaw}) OR (COALESCE(p."description", '') % ${qRaw})
            ORDER BY GREATEST(
              similarity(p."name", ${qRaw}),
              similarity(COALESCE(p."description", ''), ${qRaw})
            ) DESC
            OFFSET ${skip} LIMIT ${take}
          `;

          const cnt = await prisma.$queryRaw`
            SELECT COUNT(*)::int AS count
            FROM "public"."Playlist" p
            WHERE (p."name" % ${qRaw}) OR (COALESCE(p."description", '') % ${qRaw})
          `;

          if (rows.length > 0) {
            const ownerIds = [...new Set(rows.map((r) => r.ownerId))];
            const owners = await prisma.user.findMany({
              where: { id: { in: ownerIds } },
              select: { id: true, username: true },
            });
            const ownerMap = new Map(owners.map((o) => [o.id, o]));

            const songCounts = await prisma.playlistSong.groupBy({
              by: ['playlistId'],
              where: { playlistId: { in: rows.map((r) => r.id) } },
              _count: { songId: true },
            });
            const songCountMap = new Map(
              songCounts.map((sc) => [sc.playlistId, sc._count.songId]),
            );

            items = rows.map((r) => ({
              ...r,
              owner: ownerMap.get(r.ownerId) || null,
              _count: { songs: songCountMap.get(r.id) || 0 },
            }));

            const totalNum = Number(cnt?.[0]?.count || 0);
            return res.json({
              scope,
              q: qRaw,
              page,
              pageSize: take,
              total: totalNum,
              pages: Math.ceil(totalNum / take),
              items,
              searchType: 'similarity',
            });
          }
        } catch (similarityError) {
          console.warn('Similarity search failed:', similarityError);
        }
      }

      return res.json({
        scope,
        q: qRaw,
        page,
        pageSize: take,
        total,
        pages: Math.ceil(total / take),
        items,
        searchType: 'standard',
      });
    }

    // songs (default)
    const where = {
      OR: [
        contains('title'),
        contains('artist'),
        contains('genre'),
        { searchKey: { contains: qNorm } },
      ],
    };

    let [items, total] = await prisma.$transaction([
      prisma.song.findMany({
        where,
        orderBy: [{ analytics: { playCount: 'desc' } }, { createdAt: 'desc' }],
        include: {
          uploadedBy: { select: { id: true, username: true } },
          analytics: true,
          _count: { select: { likes: true, comments: true, moodTags: true } },
        },
        skip,
        take,
      }),
      prisma.song.count({ where }),
    ]);

    // fallback similarity for songs
    if (total === 0 && qNorm.length >= 2) {
      try {
        const rows = await prisma.$queryRaw`
          SELECT s."id"
          FROM "public"."Song" s
          WHERE s."searchKey" % ${qNorm}
          ORDER BY similarity(s."searchKey", ${qNorm}) DESC
          OFFSET ${skip} LIMIT ${take}
        `;

        const cnt = await prisma.$queryRaw`
          SELECT COUNT(*)::int AS count
          FROM "public"."Song" s
          WHERE s."searchKey" % ${qNorm}
        `;

        const ids = rows.map((r) => r.id);
        if (ids.length > 0) {
          const details = await prisma.song.findMany({
            where: { id: { in: ids } },
            include: {
              uploadedBy: { select: { id: true, username: true } },
              analytics: true,
              _count: { select: { likes: true, comments: true, moodTags: true } },
            },
          });

          const map = new Map(details.map((d) => [d.id, d]));
          items = ids.map((id) => map.get(id)).filter(Boolean);
        } else {
          items = [];
        }

        const totalNum = Number(cnt?.[0]?.count || 0);
        return res.json({
          scope: 'songs',
          q: qRaw,
          page,
          pageSize: take,
          total: totalNum,
          pages: Math.ceil(totalNum / take),
          items,
          searchType: 'similarity',
        });
      } catch (similarityError) {
        console.warn('Similarity search failed:', similarityError);
      }
    }

    return res.json({
      scope: 'songs',
      q: qRaw,
      page,
      pageSize: take,
      total,
      pages: Math.ceil(total / take),
      items,
      searchType: 'standard',
    });
  } catch (e) {
    console.error('search error:', e);
    res.status(500).json({ message: 'Server error' });
  }
};
