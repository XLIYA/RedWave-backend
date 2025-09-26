// prisma/seed.js  (ESM) — فقط ادمین
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const NODE_ENV   = process.env.NODE_ENV || 'development';
const ADMIN_USER = process.env.ADMIN_USER || (NODE_ENV !== 'production' ? 'admin' : null);
const ADMIN_PASS = process.env.ADMIN_PASS || (NODE_ENV !== 'production' ? 'pass'  : null);

if (NODE_ENV === 'production' && (!ADMIN_USER || !ADMIN_PASS)) {
  console.error('❌ در production مقدارهای ADMIN_USER و ADMIN_PASS الزامی‌اند.');
  process.exit(1);
}

async function main() {
  console.log('🌱 Seeding admin user…');

  const passwordHash = await bcrypt.hash(String(ADMIN_PASS || '!Aa1'), 12);

  // تلاش 1: اگر username در اسکیما Unique باشد، upsert مستقیم
  try {
    const admin = await prisma.user.upsert({
      where: { username: String(ADMIN_USER || 'admin') }, // نیازمند unique(username)
      update: { role: 'admin', password: passwordHash },
      create: {
        username: String(ADMIN_USER || 'admin'),
        password: passwordHash,
        role: 'admin',
      },
      select: { id: true, username: true, role: true }, // ✅ email حذف شد
    });

    console.log('✅ Admin upserted (unique username):', admin);
    return;
  } catch (e) {
    // اگر unique نبود یا خطای اعتبارسنجی خورد، می‌ریم سراغ مسیر مقاوم
    if (e?.name !== 'PrismaClientValidationError') {
      throw e;
    }
    console.warn('⚠️ username در مدل User ظاهراً unique نیست؛ مسیر fallback اجرا می‌شود…');
  }

  // مسیر مقاوم: اگر unique(username) نداریم
  // 1) اولین کاربر با این username را پیدا کن
  const existing = await prisma.user.findFirst({
    where: { username: String(ADMIN_USER || 'admin') },
    select: { id: true },
  });

  let admin;
  if (existing) {
    // 2) اگر پیدا شد، با id آپدیت کن
    admin = await prisma.user.update({
      where: { id: existing.id },
      data: { role: 'admin', password: passwordHash },
      select: { id: true, username: true, role: true },
    });
    console.log('✅ Admin updated (fallback by id):', admin);
  } else {
    // 3) اگر نبود، بساز
    admin = await prisma.user.create({
      data: {
        username: String(ADMIN_USER || 'admin'),
        password: passwordHash,
        role: 'admin',
      },
      select: { id: true, username: true, role: true },
    });
    console.log('✅ Admin created (fallback create):', admin);
  }

  console.log('🎉 Done.');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
