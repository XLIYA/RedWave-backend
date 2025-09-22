// server.js
import 'dotenv/config.js';
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { fileURLToPath } from 'url';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './src/config/swagger.js';
import prisma from './src/config/db.js'; // ✅ برای قطع اتصال تمیز

// Routes
import authRoutes from './src/routes/authRoutes.js';
import userRoutes from './src/routes/userRoutes.js';
import songRoutes from './src/routes/songRoutes.js';
import playlistRoutes from './src/routes/playlistRoutes.js';
import searchRoutes from './src/routes/searchRoutes.js';
import uploadRoutes from './src/routes/uploadRoutes.js';
import lyricsRoutes from './src/routes/lyricsRoutes.js';
import likeRoutes from './src/routes/likeRoutes.js';
import commentRoutes from './src/routes/commentRoutes.js';
import tagRoutes from './src/routes/tagRoutes.js';
import followRoutes from './src/routes/followRoutes.js';
import feedRoutes from './src/routes/feedRoutes.js';
import albumRoutes from './src/routes/albumRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

console.log('🔧 Starting RedWave API Server...');
console.log('📁 Server directory:', __dirname);

// Ensure upload dirs
const uploadsDir = path.join(__dirname, 'uploads');
const audioDir = path.join(uploadsDir, 'audio');
const coversDir = path.join(uploadsDir, 'covers');
[uploadsDir, audioDir, coversDir].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// CORS/Helmet/RateLimit
const corsWhitelist = process.env.NODE_ENV === 'production'
  ? ['https://redwave.com', 'https://www.redwave.com']
  : ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000'];

const corsOptions = {
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    if (corsWhitelist.includes(origin)) return callback(null, true);
    // رد می‌شه؛ ولی API بدون credentials کار می‌کنه
    return callback(null, false);
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Range'],
  exposedHeaders: ['Accept-Ranges', 'Content-Range', 'Content-Length']
};
app.use(cors(corsOptions));
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 1000, standardHeaders: true, legacyHeaders: false }));
app.use('/api/auth/login', rateLimit({ windowMs: 10 * 60 * 1000, max: 50 }));

// Body parsing + dev log
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
if (process.env.NODE_ENV !== 'production') {
  app.use((req, _res, next) => { console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`); next(); });
}

// Small helpers
function setStreamCors(res, req) {
  const origin = req.headers.origin;
  if (origin && corsWhitelist.includes(origin)) {
    res.set('Access-Control-Allow-Origin', origin);
    res.set('Vary', 'Origin');
  } else {
    res.set('Access-Control-Allow-Origin', '*');
  }
  res.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Range, Content-Type');
  res.set('Access-Control-Expose-Headers', 'Accept-Ranges, Content-Range, Content-Length');
  res.set('Cross-Origin-Resource-Policy', 'cross-origin');
}
const audioMime = (p) => ({ '.mp3':'audio/mpeg','.wav':'audio/wav','.ogg':'audio/ogg','.flac':'audio/flac','.aac':'audio/aac','.m4a':'audio/mp4','.webm':'audio/webm' }[path.extname(p).toLowerCase()] || 'audio/mpeg');
const imageMime = (p) => ({ '.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.gif':'image/gif','.webp':'image/webp','.svg':'image/svg+xml' }[path.extname(p).toLowerCase()] || 'image/jpeg');

// Audio streaming
app.use('/uploads/audio', (req, res) => {
  const filePath = path.join(audioDir, path.basename(req.path));
  setStreamCors(res, req);
  if (!fs.existsSync(filePath)) return res.status(404).json({ message: 'Audio file not found' });
  const stat = fs.statSync(filePath), size = stat.size, range = req.headers.range;
  res.set({ 'Content-Type': audioMime(filePath), 'Accept-Ranges': 'bytes', 'Cache-Control': 'public, max-age=3600' });
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method === 'HEAD') { res.set('Content-Length', String(size)); return res.status(200).end(); }
  if (range) {
    const [s,e] = range.replace(/bytes=/,'').split('-'); const start = parseInt(s,10); const end = e ? parseInt(e,10) : size-1;
    if (Number.isNaN(start) || start >= size || end >= size) { res.set('Content-Range', `bytes */${size}`); return res.status(416).json({ message:'Range not satisfiable' }); }
    const chunk = end - start + 1;
    res.status(206).set({ 'Content-Range': `bytes ${start}-${end}/${size}`, 'Content-Length': String(chunk) });
    return fs.createReadStream(filePath, { start, end }).pipe(res);
  }
  res.set('Content-Length', String(size));
  return fs.createReadStream(filePath).pipe(res);
});

// Covers
app.use('/uploads/covers', (req, res) => {
  const filePath = path.join(coversDir, path.basename(req.path));
  setStreamCors(res, req);
  if (!fs.existsSync(filePath)) return res.status(404).json({ message: 'Cover image not found' });
  res.set({ 'Content-Type': imageMime(filePath), 'Cache-Control': 'public, max-age=86400' });
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method === 'HEAD') { const st = fs.statSync(filePath); res.set('Content-Length', String(st.size)); return res.status(200).end(); }
  return fs.createReadStream(filePath).pipe(res);
});

// Static fallback
app.use('/uploads', express.static(uploadsDir, {
  maxAge: process.env.NODE_ENV === 'production' ? '1d' : '0',
  etag: true,
  lastModified: true,
  setHeaders: (res, _path, _stat) => { res.set('Cross-Origin-Resource-Policy', 'cross-origin'); }
}));

// Health & Docs
app.get('/health', (_req, res) => {
  const audioFiles = fs.existsSync(audioDir) ? fs.readdirSync(audioDir) : [];
  const coverFiles = fs.existsSync(coversDir) ? fs.readdirSync(coversDir) : [];
  res.json({ ok: true, timestamp: new Date().toISOString(), uptime: process.uptime(), environment: process.env.NODE_ENV || 'development', uploads: { audioFiles: audioFiles.length, coverFiles: coverFiles.length } });
});
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { customCss: '.swagger-ui .topbar { display: none }', customSiteTitle: 'RedWave API Documentation', swaggerOptions: { persistAuthorization: true, displayRequestDuration: true, docExpansion: 'none', filter: true, showExtensions: true, showCommonExtensions: true, tryItOutEnabled: true } }));

// Routes (قبل از 404)
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/songs', songRoutes);
app.use('/api/playlists', playlistRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/lyrics', lyricsRoutes);
app.use('/api/likes', likeRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/follow', followRoutes);
app.use('/api/feed', feedRoutes);
app.use('/api/albums', albumRoutes);

if (process.env.NODE_ENV !== 'production') {
  const { default: debugRoutes } = await import('./src/routes/debugRoutes.js');
  app.use('/api/debug', debugRoutes);
}

// Root
app.get('/', (_req, res) => {
  const audioFiles = fs.existsSync(audioDir) ? fs.readdirSync(audioDir) : [];
  const coverFiles = fs.existsSync(coversDir) ? fs.readdirSync(coversDir) : [];
  res.json({
    message: 'Welcome to RedWave API',
    version: '1.0.0',
    documentation: '/api/docs',
    health: '/health',
    debug: process.env.NODE_ENV !== 'production' ? '/api/debug/files' : undefined,
    uploads: {
      audioFiles: audioFiles.length,
      coverFiles: coverFiles.length,
      examples: {
        audio: audioFiles[0] ? `/uploads/audio/${audioFiles[0]}` : null,
        cover: coverFiles[0] ? `/uploads/covers/${coverFiles[0]}` : null
      }
    },
    timestamp: new Date().toISOString()
  });
});

// 404
app.use((req, res) => {
  return res.status(404).json({
    message: 'Endpoint not found',
    method: req.method,
    url: req.originalUrl,
    timestamp: new Date().toISOString()
  });
});

// Error handler (گارد headersSent)
app.use((err, req, res, next) => {
  console.error('🚨 Unhandled Error:', err);
  if (res.headersSent) return next(err);
  return res.status(err.status || 500).json({ message: err.message || 'Server error' });
});

// Start & shutdown
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 RedWave API running on port ${PORT}`);
  console.log(`📚 Documentation: http://localhost:${PORT}/api/docs`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📁 Uploads directory: ${uploadsDir}`);
});
const gracefulShutdown = (signal) => {
  console.log(`${signal} received, closing...`);
  server.close(async () => {
    try { await prisma.$disconnect(); } catch {}
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10000);
};
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('uncaughtException', (err) => { console.error('Uncaught Exception:', err); process.exit(1); });
process.on('unhandledRejection', (reason, p) => { console.error('Unhandled Rejection at:', p, 'reason:', reason); process.exit(1); });

export default app;
