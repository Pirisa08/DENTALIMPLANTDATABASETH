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
import brandsRoutes from './routes/brands.js';
import profileRoutes from './routes/profile.js';

import { Blog } from './models/index.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
];

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

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use((req, res, next) => {
  res.header(
    'Content-Security-Policy',
    "default-src 'self'; connect-src 'self' http://localhost:* http://127.0.0.1:*; img-src 'self' data: blob: http://localhost:* http://127.0.0.1:*; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'"
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
const uploadsPath = path.join(__dirname, '../uploads');
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

app.use('/uploads', express.static(uploadsPath));

console.log('📁 Serving static files from:', uploadsPath);
console.log('🖼 Implant uploads path:', implantUploadsPath);
console.log('📰 Blog uploads path:', blogUploadsPath);

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

// quick image test
app.get('/api/uploads-check', (req, res) => {
  res.json({
    ok: true,
    uploadsPath,
    implantUploadsPath,
    blogUploadsPath,
    exampleImplantUrl: `http://localhost:${PORT}/uploads/implants/example.jpg`,
  });
});

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
    await sequelize.sync({ alter: true });
    return res.json({ message: 'Database synced successfully' });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

app.use('/api/implants', implantRoutes);
app.use('/api/master-data', masterDataRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/brands', brandsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/public/blogs', blogPublicRoutes);
app.use('/api/blogs', blogRoutes);

app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
  });
});

app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);

  if (err.message?.startsWith('CORS blocked')) {
    return res.status(403).json({ error: err.message });
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

    await sequelize.sync({ alter: true });
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