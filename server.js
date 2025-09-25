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
import prisma from './src/config/db.js';

// ✅ روتر تجمیعی /api (به‌جای تک‌تک روترها)
import apiRoutes from './src/routes/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

console.log('🔧 Starting RedWave API Server...');
console.log('📁 Server directory:', __dirname);

// اگر پشت پراکسی/لودبالنسر هستی (NGINX/Cloudflare)، IP واقعی و ریت‌لیمیت دقیق‌تر
app.set('trust proxy', 1);

// --- Ensure upload dirs -----------------------------------------------------
const uploadsDir = path.join(__dirname, 'uploads');
const audioDir = path.join(uploadsDir, 'audio');
const coversDir = path.join(uploadsDir, 'covers');
[uploadsDir, audioDir, coversDir].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// --- Security, CORS, RateLimit ---------------------------------------------
const corsWhitelist =
  process.env.NODE_ENV === 'production'
    ? ['https://redwave.com', 'https://www.redwave.com']
    : ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000'];

const corsOptions = {
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    if (corsWhitelist.includes(origin)) return callback(null, true);
    // ❗ اگر origin در whitelist نباشد، اجازه می‌دهیم ولی بدون credentials
    return callback(null, false);
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Range'],
  exposedHeaders: ['Accept-Ranges', 'Content-Range', 'Content-Length'],
};

app.use(cors(corsOptions));
// برای preflightهای عمومی
app.options('*', cors(corsOptions));

// Helmet با CORP cross-origin برای قابل‌نمایش بودن فایل‌های آپلود
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// لیمیت کلی درخواست‌ها
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// --- Body parsing + Dev logger ---------------------------------------------
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
if (process.env.NODE_ENV !== 'production') {
  app.use((req, _res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
  });
}

// --- Small helpers ----------------------------------------------------------
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

const audioMime = (p) =>
  (
    {
      '.mp3': 'audio/mpeg',
      '.wav': 'audio/wav',
      '.ogg': 'audio/ogg',
      '.flac': 'audio/flac',
      '.aac': 'audio/aac',
      '.m4a': 'audio/mp4',
      '.webm': 'audio/webm',
    }[path.extname(p).toLowerCase()] || 'audio/mpeg'
  );

const imageMime = (p) =>
  (
    {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml',
    }[path.extname(p).toLowerCase()] || 'image/jpeg'
  );

// --- Audio streaming --------------------------------------------------------
app.use('/uploads/audio', (req, res) => {
  const filePath = path.join(audioDir, path.basename(req.path));
  setStreamCors(res, req);

  if (!fs.existsSync(filePath)) return res.status(404).json({ message: 'Audio file not found' });

  const stat = fs.statSync(filePath);
  const size = stat.size;
  const range = req.headers.range;

  res.set({
    'Content-Type': audioMime(filePath),
    'Accept-Ranges': 'bytes',
    'Cache-Control': 'public, max-age=3600',
  });

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method === 'HEAD') {
    res.set('Content-Length', String(size));
    return res.status(200).end();
  }

  if (range) {
    const [s, e] = range.replace(/bytes=/, '').split('-');
    const start = parseInt(s, 10);
    const end = e ? parseInt(e, 10) : size - 1;
    if (Number.isNaN(start) || start >= size || end >= size) {
      res.set('Content-Range', `bytes */${size}`);
      return res.status(416).json({ message: 'Range not satisfiable' });
    }
    const chunk = end - start + 1;
    res.status(206).set({ 'Content-Range': `bytes ${start}-${end}/${size}`, 'Content-Length': String(chunk) });
    return fs.createReadStream(filePath, { start, end }).pipe(res);
  }

  res.set('Content-Length', String(size));
  return fs.createReadStream(filePath).pipe(res);
});

// --- Cover images -----------------------------------------------------------
app.use('/uploads/covers', (req, res) => {
  const filePath = path.join(coversDir, path.basename(req.path));
  setStreamCors(res, req);

  if (!fs.existsSync(filePath)) return res.status(404).json({ message: 'Cover image not found' });

  res.set({
    'Content-Type': imageMime(filePath),
    'Cache-Control': 'public, max-age=86400',
  });

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method === 'HEAD') {
    const st = fs.statSync(filePath);
    res.set('Content-Length', String(st.size));
    return res.status(200).end();
  }

  return fs.createReadStream(filePath).pipe(res);
});

// --- Static fallback for uploads -------------------------------------------
app.use(
  '/uploads',
  express.static(uploadsDir, {
    maxAge: process.env.NODE_ENV === 'production' ? '1d' : '0',
    etag: true,
    lastModified: true,
    setHeaders: (res) => {
      res.set('Cross-Origin-Resource-Policy', 'cross-origin');
    },
  })
);

// --- Health & Docs ----------------------------------------------------------
app.get('/health', (_req, res) => {
  const audioFiles = fs.existsSync(audioDir) ? fs.readdirSync(audioDir) : [];
  const coverFiles = fs.existsSync(coversDir) ? fs.readdirSync(coversDir) : [];
  res.json({
    ok: true,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    uploads: { audioFiles: audioFiles.length, coverFiles: coverFiles.length },
  });
});

app.use(
  '/api/docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'RedWave API Documentation',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      docExpansion: 'none',
      filter: true,
      showExtensions: true,
      showCommonExtensions: true,
      tryItOutEnabled: true,
    },
  })
);

// --- API routes (تجمیعی) ---------------------------------------------------
app.use('/api', apiRoutes);

// --- Debug routes (dev only) -----------------------------------------------
if (process.env.NODE_ENV !== 'production') {
  const { default: debugRoutes } = await import('./src/routes/debugRoutes.js');
  app.use('/api/debug', debugRoutes);
}

// --- Root -------------------------------------------------------------------
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
        cover: coverFiles[0] ? `/uploads/covers/${coverFiles[0]}` : null,
      },
    },
    timestamp: new Date().toISOString(),
  });
});

// --- 404 --------------------------------------------------------------------
app.use((req, res) => {
  return res.status(404).json({
    message: 'Endpoint not found',
    method: req.method,
    url: req.originalUrl,
    timestamp: new Date().toISOString(),
  });
});

// --- Error handler (headersSent guard) --------------------------------------
app.use((err, req, res, next) => {
  console.error('🚨 Unhandled Error:', err);
  if (res.headersSent) return next(err);
  return res.status(err.status || 500).json({ message: err.message || 'Server error' });
});

// --- Start & graceful shutdown ---------------------------------------------
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
    try {
      await prisma.$disconnect();
    } catch {}
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});
process.on('unhandledRejection', (reason, p) => {
  console.error('Unhandled Rejection at:', p, 'reason:', reason);
  process.exit(1);
});

export default app;
