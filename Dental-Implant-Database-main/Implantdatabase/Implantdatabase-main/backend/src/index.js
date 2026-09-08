import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import sequelize from './config/database.js';

import implantRoutes from './routes/implants.js';
import blogRoutes from './routes/blogs.js';
import blogPublicRoutes from './routes/blogsPublic.js';
import masterDataRoutes from './routes/masterData.js';
import authRoutes from './routes/auth.js';
import feedbackRoutes from './routes/feedback.js';
import feedbackAdminRoutes from './routes/feedbackRoutes.js';
import brandsRoutes from './routes/brands.js';
import profileRoutes from './routes/profile.js';

import { Blog } from './models/index.js';


dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express(); 
const PORT = process.env.PORT || 8900;
const SHOULD_ALTER_DB = process.env.DB_SYNC_ALTER === 'true';

// =========================
// Allowed origins
// =========================
const allowedOrigins = [
  'http://localhost:8900', 
  'http://localhost:8901',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:8900',
  'http://127.0.0.1:8901',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://26.176.134.115:3000',
  'http://26.176.134.115:3001',
  'http://26.176.134.115:5173',
  'http://26.176.134.115:5174',
  'https://database.ai-implantid.com',

];

// เช็ค origin แบบยืดหยุ่นขึ้นสำหรับ dev
const isAllowedOrigin = (origin) => {
  if (!origin) return true;

  // ตัด / ท้าย url ออกก่อนเปรียบเทียบ
  const cleanOrigin = origin.replace(/\/$/, '');
  const allowed = allowedOrigins.map(o => o.replace(/\/$/, ''));

  // log origin ที่เข้ามา
  console.log('[CORS] Request from origin:', origin);

  if (allowed.includes(cleanOrigin)) return true;

  try {
    const url = new URL(origin);
    const hostname = url.hostname;
    const port = url.port;

    const allowedPorts = ['3000', '3001', '5173', '5174'];

    if (
      allowedPorts.includes(port) &&
      (hostname === 'localhost' ||
        hostname === '127.0.0.1' ||
        /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname))
    ) {
      return true;
    }
  } catch (error) {
    console.error('Origin parse error:', error.message);
  }

  return false;
};

const defaultBlogSeeds = [
  {
    title: 'Dental Implant Basics',
    description: 'Introduction to dental implant systems and components.',
    publishedDate: '2026-04-10',
    content:
      'Dental implants are used to replace missing teeth and provide long-term stability.',
    imageDataUrl: '/uploads/blogs/implant-basic.jpg',
    image: '/uploads/blogs/implant-basic.jpg',
    status: 'Active',
    category: 'Education',
    author: 'Admin',
    readTime: '5 Min',
  },
  {
    title: 'Immediate Implant Placement',
    description: 'Clinical overview of immediate implant placement after extraction.',
    publishedDate: '2026-04-11',
    content:
      'Immediate implant placement can reduce treatment time and preserve bone architecture.',
    imageDataUrl: '/uploads/blogs/immediate-placement.jpg',
    image: '/uploads/blogs/immediate-placement.jpg',
    status: 'Active',
    category: 'Clinical Techniques',
    author: 'Admin',
    readTime: '5 Min',
  },
  {
    title: 'Implant Surface Technology',
    description: 'How implant surface treatment affects osseointegration.',
    publishedDate: '2026-04-12',
    content:
      'Modern surfaces such as SLA and RBM improve bone-to-implant contact.',
    imageDataUrl: '/uploads/blogs/surface-tech.jpg',
    image: '/uploads/blogs/surface-tech.jpg',
    status: 'Active',
    category: 'Technology',
    author: 'Admin',
    readTime: '5 Min',
  },
];

// =========================
// Resolve uploads directory
// =========================
const resolveUploadsBasePath = () => {
  const candidates = [
    path.resolve(__dirname, 'uploads'),
    path.resolve(__dirname, '../uploads'),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  return path.resolve(__dirname, 'uploads');
};

const uploadsPath = resolveUploadsBasePath();
const implantUploadsPath = path.join(uploadsPath, 'implants');
const blogUploadsPath = path.join(uploadsPath, 'blogs');

if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}
if (!fs.existsSync(implantUploadsPath)) {
  fs.mkdirSync(implantUploadsPath, { recursive: true });
}
if (!fs.existsSync(blogUploadsPath)) {
  fs.mkdirSync(blogUploadsPath, { recursive: true });
}

console.log('📁 Using uploads path:', uploadsPath);
console.log('🖼 Implant uploads path:', implantUploadsPath);
console.log('📰 Blog uploads path:', blogUploadsPath);

// =========================
// CORS
// =========================
app.use(
  cors({
    origin(origin, callback) {
      if (isAllowedOrigin(origin)) {
        return callback(null, true);
      }

      console.error('CORS blocked for origin:', origin);
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// รองรับ preflight ทุก route
app.options('*', cors());

// =========================
// Security headers
// =========================
app.use((req, res, next) => {
  res.header(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "connect-src 'self' http://localhost:* http://127.0.0.1:* http://26.176.134.115:* ws://localhost:* ws://127.0.0.1:* ws://26.176.134.115:*",
      "img-src 'self' data: blob: http://localhost:* http://127.0.0.1:* http://26.176.134.115:* https:",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline' https:",
      "font-src 'self' data: https:",
    ].join('; ')
  );

  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-Frame-Options', 'DENY');
  res.header('X-XSS-Protection', '1; mode=block');
  next();
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// =========================
// Static uploads
// =========================
app.use(
  '/uploads',
  express.static(uploadsPath, {
    etag: true,
    maxAge: '1d',
    setHeaders: (res, filePath) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      res.setHeader('Cache-Control', 'public, max-age=86400');

      const ext = path.extname(filePath).toLowerCase();

      if (ext === '.jpg' || ext === '.jpeg') {
        res.setHeader('Content-Type', 'image/jpeg');
      } else if (ext === '.png') {
        res.setHeader('Content-Type', 'image/png');
      } else if (ext === '.webp') {
        res.setHeader('Content-Type', 'image/webp');
      } else if (ext === '.gif') {
        res.setHeader('Content-Type', 'image/gif');
      }
    },
  })
);

// กัน error ENOENT ของไฟล์หายไม่ให้เด้งเป็น unhandled
app.use('/uploads', (req, res) => {
  return res.status(404).json({
    error: 'Uploaded file not found',
    path: req.originalUrl,
    uploadsPath,
  });
});

// =========================
// Health
// =========================
app.get('/api/health', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({
      ok: true,
      message: 'API is healthy',
      database: 'connected',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      message: 'API is running but database is not ready',
      database: 'disconnected',
      error: err.message,
    });
  }
});

app.get('/api/uploads-check', (req, res) => {
  res.json({
    ok: true,
    uploadsPath,
    implantUploadsPath,
    blogUploadsPath,
    exampleImplantUrl: `http://localhost:${PORT}/uploads/implants/example.jpg`,
  });
});

// =========================
// Routes
// =========================
app.use('/api/auth', authRoutes);

app.post('/api/seed-blogs', async (req, res) => {
  try {
    const count = await Blog.count();

    if (count > 0) {
      return res.json({ message: 'Blogs already exist', count });
    }

    const created = await Blog.bulkCreate(defaultBlogSeeds);

    return res.status(201).json({
      message: 'Blogs seeded successfully',
      count: created.length,
    });
  } catch (err) {
    console.error('POST /api/seed-blogs failed:', err);
    return res.status(400).json({ error: err.message });
  }
});

app.post('/api/sync-db', async (req, res) => {
  try {
    await sequelize.sync(SHOULD_ALTER_DB ? { alter: true } : {});
    return res.json({ message: 'Database synced successfully' });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

app.use('/api/implants', implantRoutes);
app.use('/api/master-data', masterDataRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/brands', brandsRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/public/blogs', blogPublicRoutes);
app.use('/api/blogs', blogRoutes);

// =========================
// 404
// =========================
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
  });
});

// =========================
// Error handler
// =========================
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);

  if (err.message?.startsWith('CORS blocked')) {
    return res.status(403).json({ error: err.message });
  }

  if (err.code === 'ENOENT') {
    return res.status(404).json({
      error: 'File not found',
      details: err.path || err.message,
    });
  }

  return res.status(500).json({
    error: 'Internal server error',
    details: err.message,
  });
});

async function initDatabase() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    await sequelize.sync(SHOULD_ALTER_DB ? { alter: true } : {});
    console.log('✅ Database synced');
  } catch (err) {
    console.error('❌ Database init failed:', err.message);
    console.error('⚠️ Server will still run, but DB routes may fail until DB config is fixed.');
  }
}

app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🖼 Static uploads URL: http://localhost:${PORT}/uploads/`);

  await initDatabase();
});

export default app;
