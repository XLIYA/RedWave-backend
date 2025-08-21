// src/routes/debugRoutes.js - اضافه کنید این فایل رو
import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// List all uploaded files
router.get('/files', (req, res) => {
  try {
    const uploadsDir = path.join(__dirname, '../../uploads');
    const audioDir = path.join(uploadsDir, 'audio');
    const coversDir = path.join(uploadsDir, 'covers');
    
    const getFileInfo = (dir) => {
      if (!fs.existsSync(dir)) return { exists: false, files: [] };
      
      const files = fs.readdirSync(dir).map(filename => {
        const filePath = path.join(dir, filename);
        const stats = fs.statSync(filePath);
        return {
          filename,
          size: stats.size,
          sizeFormatted: (stats.size / 1024 / 1024).toFixed(2) + ' MB',
          created: stats.birthtime,
          modified: stats.mtime,
          url: `/uploads/${path.basename(dir)}/${filename}`
        };
      });
      
      return { exists: true, files };
    };
    
    const result = {
      uploadsExists: fs.existsSync(uploadsDir),
      audioDir: getFileInfo(audioDir),
      coversDir: getFileInfo(coversDir),
      timestamp: new Date().toISOString()
    };
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      error: error.message, 
      stack: error.stack 
    });
  }
});

// Test specific audio file
router.get('/test-audio/:filename', (req, res) => {
  const filename = req.params.filename;
  const audioDir = path.join(__dirname, '../../uploads/audio');
  const filePath = path.join(audioDir, filename);
  
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ 
      error: 'File not found',
      filename,
      searchPath: filePath,
      audioDir: audioDir,
      dirExists: fs.existsSync(audioDir)
    });
  }

  const stat = fs.statSync(filePath);
  const audioUrl = `/uploads/audio/${filename}`;
  
  const html = `
<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>تست صوتی - ${filename}</title>
    <style>
        * { box-sizing: border-box; }
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            padding: 20px; 
            background: #f8f9fa;
            margin: 0;
        }
        .container { max-width: 800px; margin: 0 auto; }
        .card { 
            background: white; 
            padding: 20px; 
            border-radius: 10px; 
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            margin: 20px 0;
        }
        .header { text-align: center; color: #dc3545; }
        audio { 
            width: 100%; 
            margin: 20px 0; 
            border-radius: 5px;
            outline: none;
        }
        .info { 
            background: #e9ecef; 
            padding: 15px; 
            border-radius: 8px; 
            margin: 15px 0;
            border-left: 4px solid #007bff;
        }
        .success { 
            background: #d4edda; 
            border-left-color: #28a745; 
            color: #155724;
            padding: 10px 15px;
            border-radius: 5px;
            margin: 10px 0;
        }
        .error { 
            background: #f8d7da; 
            border-left-color: #dc3545; 
            color: #721c24;
            padding: 10px 15px;
            border-radius: 5px;
            margin: 10px 0;
        }
        .btn {
            background: #007bff;
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            text-decoration: none;
            display: inline-block;
            margin: 5px;
        }
        .btn:hover { background: #0056b3; }
        .btn-success { background: #28a745; }
        .btn-success:hover { background: #1e7e34; }
        .logs {
            background: #212529;
            color: #28a745;
            padding: 15px;
            border-radius: 5px;
            font-family: 'Courier New', monospace;
            font-size: 14px;
            max-height: 300px;
            overflow-y: auto;
            white-space: pre-wrap;
        }
        .status {
            display: flex;
            align-items: center;
            gap: 10px;
            margin: 10px 0;
            padding: 10px;
            border-radius: 5px;
            background: #f8f9fa;
        }
        .status-icon {
            width: 20px;
            height: 20px;
            border-radius: 50%;
        }
        .status-loading { background: #ffc107; }
        .status-success { background: #28a745; }
        .status-error { background: #dc3545; }
    </style>
</head>
<body>
    <div class="container">
        <div class="card">
            <h1 class="header">🎵 تست پخش صوتی RedWave</h1>
            
            <div class="info">
                <strong>نام فایل:</strong> ${filename}<br>
                <strong>حجم:</strong> ${(stat.size / 1024 / 1024).toFixed(2)} مگابایت<br>
                <strong>مسیر:</strong> <code>${audioUrl}</code><br>
                <strong>تاریخ ایجاد:</strong> ${stat.birthtime.toLocaleString('fa-IR')}
            </div>
            
            <div class="status" id="audioStatus">
                <div class="status-icon status-loading"></div>
                <span>در حال بارگذاری...</span>
            </div>
            
            <h3>🎧 پلیر صوتی:</h3>
            <audio id="audioPlayer" controls preload="metadata" crossorigin="anonymous">
                <source src="${audioUrl}" type="audio/mpeg">
                مرورگر شما از پخش صوت پشتیبانی نمی‌کند.
            </audio>
            
            <div>
                <button class="btn" onclick="testDirectAccess()">🔗 تست دسترسی مستقیم</button>
                <button class="btn btn-success" onclick="testCORS()">🌍 تست CORS</button>
                <a href="${audioUrl}" target="_blank" class="btn">📄 باز کردن فایل</a>
            </div>
            
            <h3>📊 لاگ‌های Real-time:</h3>
            <div class="logs" id="logs"></div>
        </div>
    </div>

    <script>
        const audio = document.getElementById('audioPlayer');
        const logs = document.getElementById('logs');
        const status = document.getElementById('audioStatus');
        
        function updateStatus(text, type = 'loading') {
            const icon = status.querySelector('.status-icon');
            const span = status.querySelector('span');
            
            icon.className = \`status-icon status-\${type}\`;
            span.textContent = text;
        }
        
        function addLog(message, type = 'info') {
            const timestamp = new Date().toLocaleTimeString('fa-IR');
            const logEntry = \`[\${timestamp}] \${message}\\n\`;
            logs.textContent += logEntry;
            logs.scrollTop = logs.scrollHeight;
            console.log(message);
        }
        
        // Audio Event Listeners
        audio.addEventListener('loadstart', () => {
            addLog('🔄 شروع بارگذاری صوت...');
            updateStatus('در حال بارگذاری...', 'loading');
        });
        
        audio.addEventListener('loadedmetadata', () => {
            addLog(\`📊 متادیتا بارگذاری شد - مدت: \${audio.duration.toFixed(2)} ثانیه\`);
        });
        
        audio.addEventListener('canplay', () => {
            addLog('✅ صوت آماده پخش است!');
            updateStatus('آماده پخش', 'success');
        });
        
        audio.addEventListener('canplaythrough', () => {
            addLog('🚀 صوت کاملاً بارگذاری شد');
        });
        
        audio.addEventListener('error', (e) => {
            const errorCode = audio.error ? audio.error.code : 'نامشخص';
            const errorMessage = audio.error ? audio.error.message : 'خطای نامشخص';
            addLog(\`❌ خطا در بارگذاری: کد \${errorCode} - \${errorMessage}\`);
            updateStatus('خطا در بارگذاری', 'error');
        });
        
        audio.addEventListener('play', () => {
            addLog('▶️ پخش شروع شد');
        });
        
        audio.addEventListener('pause', () => {
            addLog('⏸️ پخش متوقف شد');
        });
        
        audio.addEventListener('ended', () => {
            addLog('🏁 پخش تمام شد');
        });
        
        audio.addEventListener('timeupdate', () => {
            if (audio.currentTime > 0) {
                const progress = ((audio.currentTime / audio.duration) * 100).toFixed(1);
                // Log progress every 10 seconds to avoid spam
                if (Math.floor(audio.currentTime) % 10 === 0) {
                    addLog(\`⏱️ پیشرفت: \${progress}%\`);
                }
            }
        });
        
        // Test Functions
        async function testDirectAccess() {
            addLog('🔗 تست دسترسی مستقیم...');
            try {
                const response = await fetch('${audioUrl}', { method: 'HEAD' });
                if (response.ok) {
                    addLog(\`✅ دسترسی مستقیم موفق - وضعیت: \${response.status}\`);
                    addLog(\`📋 Headers: \${JSON.stringify(Object.fromEntries(response.headers))}\`);
                } else {
                    addLog(\`❌ دسترسی مستقیم ناموفق - وضعیت: \${response.status}\`);
                }
            } catch (error) {
                addLog(\`❌ خطا در دسترسی مستقیم: \${error.message}\`);
            }
        }
        
        async function testCORS() {
            addLog('🌍 تست CORS...');
            try {
                const response = await fetch('${audioUrl}', {
                    method: 'OPTIONS',
                    headers: {
                        'Origin': window.location.origin,
                        'Access-Control-Request-Method': 'GET',
                        'Access-Control-Request-Headers': 'Range'
                    }
                });
                addLog(\`✅ CORS تست شد - وضعیت: \${response.status}\`);
                addLog(\`📋 CORS Headers: \${JSON.stringify(Object.fromEntries(response.headers))}\`);
            } catch (error) {
                addLog(\`❌ خطا در تست CORS: \${error.message}\`);
            }
        }
        
        // Initialize
        addLog('🚀 صفحه تست بارگذاری شد');
        addLog(\`🎵 فایل: ${filename}\`);
        addLog(\`📊 حجم: ${(stat.size / 1024 / 1024).toFixed(2)} MB\`);
    </script>
</body>
</html>`;
  
  res.send(html);
});

// Check audio file headers
router.get('/headers/:filename', async (req, res) => {
  const filename = req.params.filename;
  const audioUrl = `http://localhost:${process.env.PORT || 5000}/uploads/audio/${filename}`;
  
  try {
    const response = await fetch(audioUrl, { method: 'HEAD' });
    
    res.json({
      url: audioUrl,
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers),
      ok: response.ok
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      url: audioUrl
    });
  }
});

export default router;