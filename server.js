// server.js - Fixed & Hardened
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

// Import routes
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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

console.log('🔧 Starting RedWave API Server...');
console.log('📁 Server directory:', __dirname);

// ======================================
// 📁 ENSURE UPLOAD DIRECTORIES EXIST
// ======================================
const uploadsDir = path.join(__dirname, 'uploads');
const audioDir = path.join(uploadsDir, 'audio');
const coversDir = path.join(uploadsDir, 'covers');

[uploadsDir, audioDir, coversDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📁 Created directory: ${dir}`);
  } else {
    console.log(`✅ Directory exists: ${dir}`);
  }
});

try {
  const audioFiles = fs.existsSync(audioDir) ? fs.readdirSync(audioDir) : [];
  const coverFiles = fs.existsSync(coversDir) ? fs.readdirSync(coversDir) : [];
  console.log('🎵 Audio files found:', audioFiles.length, audioFiles);
  console.log('🖼️ Cover files found:', coverFiles.length, coverFiles);
} catch (error) {
  console.error('❌ Error reading directories:', error);
}

// ======================================
// 🌐 CORS + HELMET + RATE LIMIT
// ======================================
const corsWhitelist = process.env.NODE_ENV === 'production'
  ? ['https://redwave.com', 'https://www.redwave.com']
  : ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000'];

const corsOptions = {
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    if (corsWhitelist.includes(origin)) return callback(null, true);
    return callback(null, false); // رد نمی‌کنیم، فقط اجازه نمی‌دیم credentials ست بشه
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Range'],
  exposedHeaders: ['Accept-Ranges', 'Content-Range', 'Content-Length']
};
app.use(cors(corsOptions));

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false
});
app.use(globalLimiter);

const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 50
});
app.use('/api/auth/login', authLimiter);

// ======================================
// 📝 BODY PARSING
// ======================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ======================================
// 📝 DEV REQUEST LOGGING
// ======================================
if (process.env.NODE_ENV !== 'production') {
  app.use((req, _res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
  });
}

// Helper to set CORS on stream responses
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

// ======================================
// 🎵 AUDIO STREAMING (BEFORE static)
// ======================================
app.use('/uploads/audio', (req, res) => {
  const filename = path.basename(req.path);
  const filePath = path.join(audioDir, filename);

  // CORS for stream
  setStreamCors(res, req);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: 'Audio file not found', filename });
  }

  try {
    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;
    const mimeType = getAudioMimeType(filePath);

    res.set({
      'Content-Type': mimeType,
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'public, max-age=3600'
    });

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method === 'HEAD') {
      res.set('Content-Length', fileSize.toString());
      return res.status(200).end();
    }

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      if (Number.isNaN(start) || start >= fileSize || end >= fileSize) {
        res.set('Content-Range', `bytes */${fileSize}`);
        return res.status(416).json({ message: 'Range not satisfiable' });
      }

      const chunksize = (end - start) + 1;
      res.status(206).set({
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Content-Length': chunksize.toString()
      });
      return fs.createReadStream(filePath, { start, end }).pipe(res);
    }

    res.set('Content-Length', fileSize.toString());
    return fs.createReadStream(filePath).pipe(res);
  } catch (error) {
    if (!res.headersSent) {
      res.status(500).json({ message: 'Audio stream error', error: error.message });
    }
  }
});

// ======================================
// 🖼️ COVER IMAGES (BEFORE static)
// ======================================
app.use('/uploads/covers', (req, res) => {
  const filename = path.basename(req.path);
  const filePath = path.join(coversDir, filename);

  // CORS for images
  setStreamCors(res, req);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: 'Cover image not found', filename });
  }

  try {
    const mimeType = getImageMimeType(filePath);
    res.set({
      'Content-Type': mimeType,
      'Cache-Control': 'public, max-age=86400'
    });

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method === 'HEAD') {
      const stat = fs.statSync(filePath);
      res.set('Content-Length', stat.size.toString());
      return res.status(200).end();
    }

    return fs.createReadStream(filePath).pipe(res);
  } catch (error) {
    if (!res.headersSent) {
      res.status(500).json({ message: 'Cover stream error', error: error.message });
    }
  }
});

// ======================================
// 🗂️ UPLOADS STATIC (fallback)
// ======================================
app.use('/uploads', express.static(uploadsDir, {
  maxAge: process.env.NODE_ENV === 'production' ? '1d' : '0',
  etag: true,
  lastModified: true,
  setHeaders: (res, reqPath) => {
    // Basic CORS for static fallback
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));

// ======================================
// 🔧 HELPERS
// ======================================
function getAudioMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const map = {
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.ogg': 'audio/ogg',
    '.flac': 'audio/flac',
    '.aac': 'audio/aac',
    '.m4a': 'audio/mp4',
    '.webm': 'audio/webm'
  };
  return map[ext] || 'audio/mpeg';
}
function getImageMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const map = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml'
  };
  return map[ext] || 'image/jpeg';
}

// ======================================
// 🏥 HEALTH
// ======================================
app.get('/health', (_req, res) => {
  try {
    const audioFiles = fs.existsSync(audioDir) ? fs.readdirSync(audioDir) : [];
    const coverFiles = fs.existsSync(coversDir) ? fs.readdirSync(coversDir) : [];
    res.json({
      ok: true,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      uploads: {
        audioFiles: audioFiles.length,
        coverFiles: coverFiles.length
      }
    });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

// ======================================
// 📚 DOCS
// ======================================
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'RedWave API Documentation',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    docExpansion: 'none',
    filter: true,
    showExtensions: true,
    showCommonExtensions: true,
    tryItOutEnabled: true
  }
}));

// ======================================
// 🛣️ ROUTES
// ======================================
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

// Debug routes only in dev
if (process.env.NODE_ENV !== 'production') {
  const { default: debugRoutes } = await import('./src/routes/debugRoutes.js');
  app.use('/api/debug', debugRoutes);
}

// ======================================
// 🏠 ROOT
// ======================================
app.get('/', (_req, res) => {
  try {
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
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ======================================
// 404 + ERROR HANDLERS
// ======================================
app.use((req, res) => {
  res.status(404).json({
    message: 'Endpoint not found',
    method: req.method,
    url: req.url,
    timestamp: new Date().toISOString()
  });
});

app.use((err, req, res, _next) => {
  console.error('🚨 Unhandled Error:', {
    error: err.message,
    stack: err.stack,
    method: req.method,
    url: req.url
  });

  const message = process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message;

  res.status(err.status || 500).json({
    message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// ======================================
// 🚀 START
// ======================================
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 RedWave API running on port ${PORT}`);
  console.log(`📚 Documentation: http://localhost:${PORT}/api/docs`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📁 Uploads directory: ${uploadsDir}`);
});

// Graceful shutdown
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
process.on('unhandledRejection', (reason, promise) => { console.error('Unhandled Rejection at:', promise, 'reason:', reason); process.exit(1); });

export default app;
