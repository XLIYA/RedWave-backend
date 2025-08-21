// src/middleware/audioMiddleware.js - میدل‌ویر جدید برای صوت
import fs from 'fs';
import path from 'path';

export const audioStreamMiddleware = (req, res, next) => {
  // فقط برای فایل‌های صوتی
  if (!req.path.startsWith('/uploads/audio/')) {
    return next();
  }

  const filePath = path.join(process.cwd(), 'uploads', 'audio', path.basename(req.path));
  
  console.log('🎵 Audio request:', {
    originalUrl: req.originalUrl,
    path: req.path,
    filePath: filePath,
    method: req.method,
    headers: {
      range: req.headers.range,
      origin: req.headers.origin,
      userAgent: req.headers['user-agent']
    }
  });

  // بررسی وجود فایل
  if (!fs.existsSync(filePath)) {
    console.error('❌ Audio file not found:', filePath);
    return res.status(404).json({ 
      message: 'Audio file not found',
      path: req.path,
      filePath: filePath
    });
  }

  try {
    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    console.log('📊 File info:', {
      size: fileSize,
      sizeFormatted: (fileSize / 1024 / 1024).toFixed(2) + ' MB',
      hasRange: !!range,
      range: range
    });

    // تنظیم headers اساسی
    const mimeType = getAudioMimeType(filePath);
    res.set({
      'Content-Type': mimeType,
      'Accept-Ranges': 'bytes',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Range, Content-Type',
      'Access-Control-Expose-Headers': 'Accept-Ranges, Content-Range, Content-Length',
      'Cache-Control': 'public, max-age=3600',
      'Cross-Origin-Resource-Policy': 'cross-origin'
    });

    // Handle OPTIONS request (CORS preflight)
    if (req.method === 'OPTIONS') {
      console.log('✅ Handling CORS preflight');
      return res.status(200).end();
    }

    // Handle HEAD request
    if (req.method === 'HEAD') {
      console.log('✅ Handling HEAD request');
      res.set('Content-Length', fileSize.toString());
      return res.status(200).end();
    }

    // Handle range requests
    if (range) {
      console.log('🔄 Handling range request:', range);
      
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      
      if (start >= fileSize || end >= fileSize) {
        console.error('❌ Invalid range:', { start, end, fileSize });
        res.set('Content-Range', `bytes */${fileSize}`);
        return res.status(416).json({ message: 'Range not satisfiable' });
      }

      const chunksize = (end - start) + 1;
      
      res.status(206).set({
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Content-Length': chunksize.toString()
      });

      console.log('📤 Sending range:', { start, end, chunksize });
      
      const stream = fs.createReadStream(filePath, { start, end });
      
      stream.on('error', (err) => {
        console.error('❌ Stream error:', err);
        if (!res.headersSent) {
          res.status(500).json({ message: 'Stream error' });
        }
      });
      
      return stream.pipe(res);
    }

    // Send full file
    console.log('📤 Sending full file');
    res.set('Content-Length', fileSize.toString());
    
    const stream = fs.createReadStream(filePath);
    
    stream.on('error', (err) => {
      console.error('❌ Stream error:', err);
      if (!res.headersSent) {
        res.status(500).json({ message: 'Stream error' });
      }
    });
    
    stream.pipe(res);

  } catch (error) {
    console.error('❌ Audio middleware error:', error);
    if (!res.headersSent) {
      res.status(500).json({ 
        message: 'Internal server error',
        error: error.message 
      });
    }
  }
};

function getAudioMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes = {
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.ogg': 'audio/ogg',
    '.flac': 'audio/flac',
    '.aac': 'audio/aac',
    '.m4a': 'audio/mp4',
    '.webm': 'audio/webm'
  };
  return mimeTypes[ext] || 'audio/mpeg';
}