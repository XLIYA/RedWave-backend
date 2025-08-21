// scripts/manualDatabaseFix.js - تصحیح دستی دیتابیس
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function manualFix() {
  console.log('🔧 Manual database fix...');

  try {
    // بر اساس فایل‌های موجود که دیدیم:
    // Audio: [ 'FE!N.mp3', 'SICKO-MODE.mp3' ]
    // Covers: [ 'FE!N.jpg', 'SICKO-MODE.webp' ]

    const songs = await prisma.song.findMany();
    console.log('📊 Found songs:', songs.length);

    for (const song of songs) {
      console.log(`\n🎵 Processing: ${song.title} by ${song.artist}`);
      
      let updateData = {};
      
      // تشخیص بر اساس عنوان
      if (song.title.toLowerCase().includes('sicko') || song.title.toLowerCase().includes('mode')) {
        updateData.coverImage = 'http://localhost:5000/uploads/covers/SICKO-MODE.webp';
        updateData.fileUrl = 'http://localhost:5000/uploads/audio/SICKO-MODE.mp3';
        console.log('  ✅ Matched with SICKO-MODE files');
      } 
      else if (song.title.toLowerCase().includes('fein') || song.title.toLowerCase().includes('fe!n')) {
        updateData.coverImage = 'http://localhost:5000/uploads/covers/FE!N.jpg';
        updateData.fileUrl = 'http://localhost:5000/uploads/audio/FE!N.mp3';
        console.log('  ✅ Matched with FE!N files');
      }
      else {
        // اگر مطابقت نداشت، از اولین فایل استفاده کن
        updateData.coverImage = 'http://localhost:5000/uploads/covers/FE!N.jpg';
        updateData.fileUrl = 'http://localhost:5000/uploads/audio/FE!N.mp3';
        console.log('  🔄 Using default FE!N files');
      }

      // به‌روزرسانی
      await prisma.song.update({
        where: { id: song.id },
        data: updateData
      });

      console.log(`  💾 Updated: Cover=${updateData.coverImage.split('/').pop()}, Audio=${updateData.fileUrl.split('/').pop()}`);
    }

    console.log('\n✅ Manual fix completed!');

    // بررسی نهایی
    const updatedSongs = await prisma.song.findMany({
      select: {
        title: true,
        artist: true,
        coverImage: true,
        fileUrl: true
      }
    });

    console.log('\n📊 Final verification:');
    updatedSongs.forEach(song => {
      console.log(`🎵 ${song.title}`);
      console.log(`   Cover: ${song.coverImage}`);
      console.log(`   Audio: ${song.fileUrl}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

manualFix().catch(console.error);