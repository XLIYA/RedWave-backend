// scripts/backfillSearchKey.js
import prisma from '../src/config/db.js';
import { normalize } from '../src/utils/normalize.js';

const main = async () => {
  const batch = 100;
  let skip = 0;
  let totalUpdated = 0;

  while (true) {
    const songs = await prisma.song.findMany({
      select: { id: true, title: true, artist: true, genre: true },
      orderBy: { createdAt: 'asc' },
      skip,
      take: batch,
    });
    if (!songs.length) break;

    for (const s of songs) {
      const searchKey = normalize(`${s.title}${s.artist}${s.genre}`);
      await prisma.song.update({ where: { id: s.id }, data: { searchKey } });
      totalUpdated++;
    }

    console.log('Updated so far:', totalUpdated);
    skip += batch;
  }

  console.log(`✅ Done. Updated ${totalUpdated} songs.`);
  await prisma.$disconnect();
};

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
