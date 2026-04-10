import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import sequelize from './config/database.js';
import implantRoutes from './routes/implants.js';
import blogRoutes from './routes/blogs.js';
import blogPublicRoutes from './routes/blogsPublic.js';
import masterDataRoutes from './routes/masterData.js';
import authRoutes from './routes/auth.js';
import { authMiddleware } from './middleware/auth.js';
import feedbackRoutes from './routes/feedback.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware - CORS configuration for development
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001', 
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Security headers
app.use((req, res, next) => {
  res.header('Content-Security-Policy', "default-src 'self'; connect-src 'self' http://localhost:* http://127.0.0.1:*; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'");
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-Frame-Options', 'DENY');
  res.header('X-XSS-Protection', '1; mode=block');
  next();
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve static files (uploaded images)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
console.log('📁 Serving static files from:', path.join(__dirname, '../uploads'));

// Routes
app.use('/api/auth', authRoutes);
// Public seed endpoint (for initial setup)
app.post('/api/seed-blogs', async (req, res) => {
  try {
    const { Blog } = await import('./models/index.js');
    const blogSeeds = (await import('./seeds/blogSeeds.js')).default;
    const count = await Blog.count();
    if (count > 0) {
      return res.json({ message: 'Blogs already exist', count });
    }
    const created = await Blog.bulkCreate(blogSeeds);
    res.status(201).json({ message: 'Blogs seeded successfully', count: created.length });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Public sync endpoint (for schema updates)
app.post('/api/sync-db', async (req, res) => {
  try {
    const { Blog } = await import('./models/index.js');
    await Blog.sync({ alter: true });
    res.json({ message: 'Database synced successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});// Protected routes
// Auth temporarily disabled for admin UI convenience
app.use('/api/implants', implantRoutes);
app.use('/api/master-data', masterDataRoutes);
app.use('/api/feedback', feedbackRoutes);

// Blog routes: Public GET, Protected write (POST, PUT, DELETE)
app.use('/api/blogs', blogPublicRoutes); // Handles GET / and GET /:id
app.use('/api/blogs', authMiddleware, blogRoutes); // Handles POST, PUT, DELETE

// Wait for DB to be ready, then sync & start
async function waitForDatabase(retries = 10, delayMs = 3000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await sequelize.authenticate();
      return true;
    } catch (err) {
      const code = err?.code || err?.name || 'UNKNOWN_ERROR';
      console.error(`DB not ready (attempt ${attempt}/${retries}): ${code}`);
      if (attempt === retries) throw err;
      await new Promise((res) => setTimeout(res, delayMs));
    }
  }
}

(async () => {
  try {
    await waitForDatabase();
    await sequelize.sync({ alter: true });
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Database error:', err);
  }
})();

export default app;
