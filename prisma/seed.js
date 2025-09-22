// prisma/seed.js  (ESM)
// ---------------------
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

/**
 * نرمالایز برای searchKey (همسو با src/utils/normalize.js)
 */
const normalize = (s = '') =>
  s.toString()
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}]+/gu, '');

/**
 * خواندن امن ENV با پیش‌فرض‌های منطقی در توسعه
 */
const NODE_ENV = process.env.NODE_ENV || 'development';
const PORT = Number(process.env.PORT || 5000);
const MEDIA_BASE =
  process.env.SEED_MEDIA_BASE?.replace(/\/+$/, '') || `http://localhost:${PORT}`;

const ADMIN_USER = process.env.ADMIN_USER || (NODE_ENV !== 'production' ? 'admin' : null);
const ADMIN_PASS = process.env.ADMIN_PASS || (NODE_ENV !== 'production' ? 'admin1234' : null);

// در پروڈاکشن ENV الزامی است
if (NODE_ENV === 'production' && (!ADMIN_USER || !ADMIN_PASS)) {
  // eslint-disable-next-line no-console
  console.error('❌ ADMIN_USER و ADMIN_PASS در محیط production الزامی‌اند.');
  process.exit(1);
}

async function main() {
  console.log('🌱 Seeding database...');

  // 1) ادمین
  const adminPasswordHash = await bcrypt.hash(String(ADMIN_PASS), 10);
  const admin = await prisma.user.upsert({
    where: { username: String(ADMIN_USER) }, // username یونیک
    update: { role: 'admin', password: adminPasswordHash },
    create: {
      username: String(ADMIN_USER),
      password: adminPasswordHash,
      role: 'admin',
    },
    select: { id: true, username: true, role: true },
  });
  console.log('👤 Admin:', admin);

  // 2) آهنگ‌های نمونه (قابل تنظیم با SEED_MEDIA_BASE)
  const songsInput = [
    {
      title: 'FE!N',
      artist: 'Travis Scott',
      genre: 'Hip-Hop',
      releaseDate: new Date('2023-07-28T00:00:00.000Z'),
      coverImage: `${MEDIA_BASE}/uploads/covers/FE!N.jpg`,
      fileUrl: `${MEDIA_BASE}/uploads/audio/FE!N.mp3`,
    },
    {
      title: 'SICKO MODE',
      artist: 'Travis Scott',
      genre: 'Hip-Hop',
      releaseDate: new Date('2018-08-03T00:00:00.000Z'),
      coverImage: `${MEDIA_BASE}/uploads/covers/SICKO-MODE.webp`,
      fileUrl: `${MEDIA_BASE}/uploads/audio/SICKO-MODE.mp3`,
    },
  ];

  const songs = [];
  for (const s of songsInput) {
    // اگر در Prisma برای Song این ایندکس دارید: @@unique([title, artist])
    // می‌توانید از where: { title_artist: { title, artist } } استفاده کنید.
    const created = await prisma.song.upsert({
      where: {
        title_artist: {
          title: s.title,
          artist: s.artist,
        },
      },
      update: {
        genre: s.genre,
        releaseDate: s.releaseDate,
        coverImage: s.coverImage,
        fileUrl: s.fileUrl,
        searchKey: normalize(`${s.title}${s.artist}${s.genre}`),
      },
      create: {
        ...s,
        uploadedById: admin.id,
        searchKey: normalize(`${s.title}${s.artist}${s.genre}`),
      },
      include: { analytics: true },
    });

    // Analytics (یک‌به‌یک با Song)
    // اگر در اسکیما unique روی songId دارید، upsert مستقیم جواب می‌دهد.
    try {
      await prisma.analytics.upsert({
        where: { songId: created.id },
        update: {},
        create: {
          songId: created.id,
          playCount: 0,
          uniqueListeners: 0,
          lastPlayed: new Date(),
        },
      });
    } catch (e) {
      // اگر unique(songId) نداشتید، fallback: فقط اگر نبود بساز
      const ax = await prisma.analytics.findFirst({ where: { songId: created.id } });
      if (!ax) {
        await prisma.analytics.create({
          data: {
            songId: created.id,
            playCount: 0,
            uniqueListeners: 0,
            lastPlayed: new Date(),
          },
        });
      }
    }

    songs.push(created);
  }
  console.log('🎵 Seeded songs:', songs.map((s) => `${s.title} – ${s.artist}`));

  // 3) پلی‌لیست اولیه
  const playlist = await prisma.playlist.upsert({
    where: {
      // اگر برای Playlist هم کلید یکتا مناسبی دارید (مثلاً ownerId + name)،
      // بهتر است از آن استفاده کنید. اینجا ساده می‌گیریم: اگر قبلاً با همین نام برای این مالک ساخته شده، آن را به‌روز می‌کنیم.
      // اگر در اسکیما unique مرکب دارید:
      // where: { ownerId_name: { ownerId: admin.id, name: 'Admin Picks' } }
      id:
        (
          await prisma.playlist.findFirst({
            where: { ownerId: admin.id, name: 'Admin Picks' },
            select: { id: true },
          })
        )?.id || '00000000-0000-0000-0000-000000000000',
    },
    update: {},
    create: {
      name: 'Admin Picks',
      description: 'A starter playlist seeded by Prisma',
      ownerId: admin.id,
    },
  });

  // اتصال آهنگ‌ها به پلی‌لیست با کلید مرکب @@id([playlistId, songId])
  for (const s of songs) {
    await prisma.playlistSong.upsert({
      where: {
        playlistId_songId: { playlistId: playlist.id, songId: s.id },
      },
      update: {},
      create: {
        playlistId: playlist.id,
        songId: s.id,
      },
    });
  }

  console.log('🎼 Playlist:', { id: playlist.id, name: playlist.name });
  console.log('✅ Seeding done.');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
