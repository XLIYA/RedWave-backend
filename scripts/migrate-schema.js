// scripts/migrate-schema.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const normalize = (s = '') => s.toString().toLowerCase().replace(/[^a-z0-9]+/g, '');

async function main() {
  console.log('🔄 Starting migration...');

  try {
    // 1. ایجاد indexes اساسی
    console.log('🔍 Creating basic indexes...');
    
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_analytics_playcount 
      ON "Analytics" ("playCount" DESC, "lastPlayed" DESC);
    `;
    
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_song_title 
      ON "Song" ("title");
    `;
    
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_song_artist 
      ON "Song" ("artist");
    `;
    
    console.log('✅ Basic indexes created');

    // 2. بررسی songs بدون searchKey
    const songsToUpdate = await prisma.song.findMany({
      where: {
        OR: [
          { searchKey: '' },
          { searchKey: null }
        ]
      },
      select: { id: true, title: true, artist: true, genre: true }
    });

    if (songsToUpdate.length > 0) {
      console.log(`🔄 Updating ${songsToUpdate.length} songs with searchKey...`);
      
      for (const song of songsToUpdate) {
        const searchKey = normalize(`${song.title}${song.artist}${song.genre}`);
        await prisma.song.update({
          where: { id: song.id },
          data: { searchKey }
        });
      }
      console.log('✅ Songs updated with searchKey');
    }

    // 3. ایجاد analytics برای songs
    const songsWithoutAnalytics = await prisma.song.findMany({
      where: { analytics: null },
      select: { id: true }
    });

    if (songsWithoutAnalytics.length > 0) {
      console.log(`🔄 Creating analytics for ${songsWithoutAnalytics.length} songs...`);
      
      for (const song of songsWithoutAnalytics) {
        try {
          await prisma.analytics.create({
            data: {
              songId: song.id,
              playCount: 0,
              uniqueListeners: 0,
              lastPlayed: new Date()
            }
          });
        } catch (error) {
          if (!error.message.includes('Unique constraint')) {
            console.error(`Error for song ${song.id}:`, error.message);
          }
        }
      }
      console.log('✅ Analytics created');
    }

    // 4. گزارش نهایی
    const stats = {
      users: await prisma.user.count(),
      songs: await prisma.song.count(),
      analytics: await prisma.analytics.count()
    };

    console.log('✅ Migration completed!');
    console.log(`📊 Users: ${stats.users}, Songs: ${stats.songs}, Analytics: ${stats.analytics}`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

main()
  .catch(async (e) => {
    console.error('Error:', e);
    await prisma.$disconnect();
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });