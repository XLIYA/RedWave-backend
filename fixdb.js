// fixdb.js - فایل تصحیح ساده دیتابیس
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixDatabase() {
  console.log('🔧 Starting database fix...');

  try {
    // به‌روزرسانی همه آهنگ‌ها
    const result = await prisma.song.updateMany({
      data: {
        coverImage: 'http://localhost:5000/uploads/covers/SICKO-MODE.webp',
        fileUrl: 'http://localhost:5000/uploads/audio/SICKO-MODE.mp3'
      }
    });
    
    console.log(`✅ Updated ${result.count} songs successfully!`);
    
    // نمایش نتایج
    const updatedSongs = await prisma.song.findMany({
      select: { 
        id: true,
        title: true, 
        artist: true,
        coverImage: true, 
        fileUrl: true 
      }
    });
    
    console.log('\n📋 Updated songs:');
    updatedSongs.forEach((song, index) => {
      console.log(`${index + 1}. 🎵 ${song.title} - ${song.artist}`);
      console.log(`   📷 Cover: ${song.coverImage}`);
      console.log(`   🎧 Audio: ${song.fileUrl}`);
      console.log('');
    });
    
    console.log('🎉 Database fix completed!');
    
  } catch (error) {
    console.error('❌ Database fix failed:', error);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

fixDatabase();