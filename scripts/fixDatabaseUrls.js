// scripts/fixDatabaseUrls.js - اسکریپت تصحیح URL های دیتابیس
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

async function fixDatabaseUrls() {
  console.log('🔧 Starting database URL fix...');

  try {
    // مسیرهای فایل‌ها
    const uploadsDir = path.join(__dirname, '../uploads');
    const audioDir = path.join(uploadsDir, 'audio');
    const coversDir = path.join(uploadsDir, 'covers');

    // خواندن فایل‌های موجود
    const audioFiles = fs.existsSync(audioDir) ? fs.readdirSync(audioDir) : [];
    const coverFiles = fs.existsSync(coversDir) ? fs.readdirSync(coversDir) : [];

    console.log('📁 Found files:');
    console.log('🎵 Audio files:', audioFiles);
    console.log('🖼️ Cover files:', coverFiles);

    // گرفتن همه آهنگ‌ها از دیتابیس
    const songs = await prisma.song.findMany({
      select: {
        id: true,
        title: true,
        artist: true,
        coverImage: true,
        fileUrl: true
      }
    });

    console.log('\n📊 Current songs in database:');
    songs.forEach(song => {
      console.log(`🎵 ${song.title} - ${song.artist}`);
      console.log(`   Cover: ${song.coverImage}`);
      console.log(`   Audio: ${song.fileUrl}`);
    });

    console.log('\n🔧 Starting URL correction...');

    for (const song of songs) {
      let needsUpdate = false;
      const updateData = {};

      // بررسی و تصحیح cover image
      if (song.coverImage) {
        const currentCoverFilename = song.coverImage.split('/').pop();
        const coverExists = coverFiles.includes(currentCoverFilename);
        
        if (!coverExists) {
          // سعی کنیم فایل متناظر پیدا کنیم
          const matchingCover = findMatchingFile(song.title, song.artist, coverFiles);
          if (matchingCover) {
            updateData.coverImage = `http://localhost:5000/uploads/covers/${matchingCover}`;
            needsUpdate = true;
            console.log(`🖼️ Fixed cover for "${song.title}": ${matchingCover}`);
          } else {
            console.log(`❌ No matching cover found for "${song.title}"`);
          }
        } else {
          console.log(`✅ Cover already correct for "${song.title}"`);
        }
      }

      // بررسی و تصحیح audio file
      if (song.fileUrl) {
        const currentAudioFilename = song.fileUrl.split('/').pop();
        const audioExists = audioFiles.includes(currentAudioFilename);
        
        if (!audioExists) {
          // سعی کنیم فایل متناظر پیدا کنیم
          const matchingAudio = findMatchingFile(song.title, song.artist, audioFiles);
          if (matchingAudio) {
            updateData.fileUrl = `http://localhost:5000/uploads/audio/${matchingAudio}`;
            needsUpdate = true;
            console.log(`🎵 Fixed audio for "${song.title}": ${matchingAudio}`);
          } else {
            console.log(`❌ No matching audio found for "${song.title}"`);
          }
        } else {
          console.log(`✅ Audio already correct for "${song.title}"`);
        }
      }

      // به‌روزرسانی دیتابیس اگر نیاز باشد
      if (needsUpdate) {
        await prisma.song.update({
          where: { id: song.id },
          data: updateData
        });
        console.log(`💾 Updated database for "${song.title}"`);
      }
    }

    console.log('\n✅ Database URL fix completed!');

    // نمایش نتیجه نهایی
    const updatedSongs = await prisma.song.findMany({
      select: {
        id: true,
        title: true,
        artist: true,
        coverImage: true,
        fileUrl: true
      }
    });

    console.log('\n📊 Updated songs in database:');
    updatedSongs.forEach(song => {
      console.log(`🎵 ${song.title} - ${song.artist}`);
      console.log(`   Cover: ${song.coverImage}`);
      console.log(`   Audio: ${song.fileUrl}`);
    });

  } catch (error) {
    console.error('❌ Error fixing database URLs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

function findMatchingFile(title, artist, files) {
  // تمیز کردن نام‌ها برای مقایسه
  const cleanTitle = cleanString(title);
  const cleanArtist = cleanString(artist);
  
  // جستجوی فایل با نام مشابه
  const matchingFile = files.find(file => {
    const cleanFilename = cleanString(file);
    
    // بررسی شامل بودن عنوان یا هنرمند
    return cleanFilename.includes(cleanTitle) || 
           cleanFilename.includes(cleanArtist) ||
           cleanTitle.includes(cleanFilename.split('.')[0]) ||
           cleanArtist.includes(cleanFilename.split('.')[0]);
  });
  
  return matchingFile;
}

function cleanString(str) {
  return str.toLowerCase()
    .replace(/[^\w\s]/g, '') // حذف کاراکترهای خاص
    .replace(/\s+/g, '')     // حذف فاصله‌ها
    .trim();
}

// اجرای اسکریپت
fixDatabaseUrls().catch(console.error);