// prisma/seed.js (ESM)
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// همون نرمالایز خودمون برای searchKey
const normalize = (s = '') =>
  s.toString().normalize('NFKD').toLowerCase().replace(/[^\p{Letter}\p{Number}]+/gu, '');

async function main() {
  console.log('🌱 Seeding database...');

  // 1) Admin user
  const adminPassword = await bcrypt.hash('pass', 10);
  const admin = await prisma.user.upsert({
    where: { username: 'admin' }, // username یونیک است
    update: { role: 'admin' },
    create: {
      username: 'admin',
      password: adminPassword,
      role: 'admin'
    },
    select: { id: true, username: true, role: true }
  });
  console.log('👤 Admin:', admin);

  // 2) Sample songs
  const songsInput = [
    {
      title: 'FE!N',
      artist: 'Travis Scott',
      genre: 'Hip-Hop',
      releaseDate: new Date('2023-07-28T00:00:00.000Z'),
      coverImage: 'http://localhost:5000/uploads/covers/FE!N.jpg',
      fileUrl: 'http://localhost:5000/uploads/audio/FE!N.mp3',
    },
    {
      title: 'SICKO MODE',
      artist: 'Travis Scott',
      genre: 'Hip-Hop',
      releaseDate: new Date('2018-08-03T00:00:00.000Z'),
      coverImage: 'http://localhost:5000/uploads/covers/SICKO-MODE.webp',
      fileUrl: 'http://localhost:5000/uploads/audio/SICKO-MODE.mp3',
    }
  ];

  const songs = [];
  for (const s of songsInput) {
    const created = await prisma.song.upsert({
      where: {
        // با توجه به @@unique([title, artist])
        // Prisma upsert به unique نیاز دارد، پس باید where را بر اساس فیلد یونیک بسازیم.
        // چون کلید مرکب را مستقیم نمی‌شود در where داد، ابتدا می‌گردیم:
        id: (
          await prisma.song.findFirst({
            where: { title: s.title, artist: s.artist },
            select: { id: true }
          })
        )?.id || '00000000-0000-0000-0000-000000000000'
      },
      update: {},
      create: {
        ...s,
        uploadedById: admin.id,
        searchKey: normalize(`${s.title}${s.artist}${s.genre}`)
      },
      include: { analytics: true }
    });

    // اگر Analytics نداشت، بساز
    if (!created.analytics) {
      await prisma.analytics.create({
        data: {
          songId: created.id,
          playCount: 0,
          uniqueListeners: 0,
          lastPlayed: new Date()
        }
      });
    }
    songs.push(created);
  }
  console.log('🎵 Seeded songs:', songs.map(s => `${s.title} – ${s.artist}`));

  // 3) Playlist with both songs
  const playlist = await prisma.playlist.upsert({
    where: {
      id: (
        await prisma.playlist.findFirst({
          where: { ownerId: admin.id, name: 'Admin Picks' },
          select: { id: true }
        })
      )?.id || '00000000-0000-0000-0000-000000000000'
    },
    update: {},
    create: {
      name: 'Admin Picks',
      description: 'A starter playlist seeded by Prisma',
      ownerId: admin.id
    }
  });

  // اتصال آهنگ‌ها به پلی‌لیست (PlaylistSong)
  for (const s of songs) {
    await prisma.playlistSong.upsert({
      where: {
        // کلید مرکب در upsert: از @@id([playlistId, songId]) پشتیبانی نمی‌شود،
        // پس شبیه بالا ابتدا find می‌کنیم:
        playlistId_songId: (
          await prisma.playlistSong.findUnique({
            where: { playlistId_songId: { playlistId: playlist.id, songId: s.id } }
          })
        )
          ? { playlistId: playlist.id, songId: s.id }
          : { playlistId: '00000000-0000-0000-0000-000000000000', songId: '00000000-0000-0000-0000-000000000000' }
      },
      update: {},
      create: {
        playlistId: playlist.id,
        songId: s.id
      }
    }).catch(async (e) => {
      // اگر findUnique بالا null بود، upsert ممکنه خطا بده—در اینصورت create ساده:
      if (e.code === 'P2025' || e.code === 'P2001') {
        await prisma.playlistSong.create({ data: { playlistId: playlist.id, songId: s.id } });
      } else {
        throw e;
      }
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
