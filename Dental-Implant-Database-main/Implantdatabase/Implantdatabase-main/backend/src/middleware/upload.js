import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ใช้ path เดียวกับ index.js
const resolveUploadsBasePath = () => {
  const candidates = [
    path.resolve(__dirname, '../uploads'),   // backend/uploads
    path.resolve(__dirname, '../../uploads') // project/uploads
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  return path.resolve(__dirname, '../uploads');
};

const uploadsBasePath = resolveUploadsBasePath();
const implantsDir = path.join(uploadsBasePath, 'implants');
const blogsDir = path.join(uploadsBasePath, 'blogs');

if (!fs.existsSync(uploadsBasePath)) {
  fs.mkdirSync(uploadsBasePath, { recursive: true });
}
if (!fs.existsSync(implantsDir)) {
  fs.mkdirSync(implantsDir, { recursive: true });
}
if (!fs.existsSync(blogsDir)) {
  fs.mkdirSync(blogsDir, { recursive: true });
}

const sanitizeFileName = (name = '') =>
  String(name)
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9._-]/g, '');

const imageFileFilter = (req, file, cb) => {
  if (!file.mimetype || !file.mimetype.startsWith('image/')) {
    return cb(new Error('Only image files are allowed'));
  }
  cb(null, true);
};

const createStorage = (targetDir) =>
  multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, targetDir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname || '').toLowerCase() || '.jpg';
      const base = path.basename(file.originalname || 'image', ext);
      const safeBase = sanitizeFileName(base);
      const uniqueName = `${safeBase}-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
      cb(null, uniqueName);
    },
  });

export const uploadImplantImages = multer({
  storage: createStorage(implantsDir),
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 3,
  },
}).fields([
  { name: 'image1', maxCount: 1 },
  { name: 'image2', maxCount: 1 },
  { name: 'image3', maxCount: 1 },
]);

export const uploadBlogImage = multer({
  storage: createStorage(blogsDir),
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 1,
  },
}).single('image');

export const deleteImplantImages = (paths = []) => {
  for (const item of paths) {
    if (!item || typeof item !== 'string') continue;

    const normalized = item.replace(/^\/+/, '');
    const relativePath = normalized.startsWith('uploads/')
      ? normalized.replace(/^uploads\//, '')
      : normalized;

    const absolutePath = path.join(uploadsBasePath, relativePath);

    try {
      if (fs.existsSync(absolutePath)) {
        fs.unlinkSync(absolutePath);
      }
    } catch (err) {
      console.warn('Failed to delete file:', absolutePath, err.message);
    }
  }
};