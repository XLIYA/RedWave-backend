// scripts/createAdmin.js (ESM)
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

function parseArgs(argv) {
  const out = {};
  const nonFlags = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--username') { out.username = argv[i + 1]; i++; continue; }
    if (a === '--password') { out.password = argv[i + 1]; i++; continue; }
    if (a.startsWith('--username=')) { out.username = a.split('=')[1]; continue; }
    if (a.startsWith('--password=')) { out.password = a.split('=')[1]; continue; }
    if (!a.startsWith('--')) nonFlags.push(a);
  }
  if (!out.username && nonFlags[0]) out.username = nonFlags[0];
  if (!out.password && nonFlags[1]) out.password = nonFlags[1];
  return out;
}

const { username, password } = parseArgs(process.argv.slice(2));

if (!username || !password) {
  console.error(
    '❌ Usage:\n' +
    '   node scripts/createAdmin.js --username <name> --password <pass>\n' +
    '   or:\n' +
    '   node scripts/createAdmin.js <name> <pass>'
  );
  process.exit(1);
}

try {
  const hash = await bcrypt.hash(password, 10);
  const user = await prisma.user.upsert({
    where: { username },
    update: { password: hash, role: 'admin' },
    create: { username, password: hash, role: 'admin' },
    select: { id: true, username: true, role: true },
  });
  console.log('✅ Admin ready:', user);
} catch (e) {
  console.error('❌ Error:', e?.message || e);
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
