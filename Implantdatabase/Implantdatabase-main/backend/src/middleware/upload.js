import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// สร้างโฟลเดอร์ uploads/implants ถ้ายังไม่มี
const uploadsDir = path.join(__dirname, '../../uploads/implants');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('✅ Created uploads directory:', uploadsDir);
}

// ตั้งค่าการเก็บไฟล์
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname || '').toLowerCase();
    const nameWithoutExt = path.basename(file.originalname || 'image', ext);
    const sanitizedName = nameWithoutExt.replace(/[^a-zA-Z0-9_-]/g, '_');

    cb(null, `${sanitizedName}-${uniqueSuffix}${ext || '.jpg'}`);
  },
});

// รับเฉพาะไฟล์รูป
const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        'Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'
      ),
      false
    );
  }
};

// ตั้งค่า multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB ต่อรูป
  },
});

// middleware สำหรับรับรูป 3 ช่อง
export const uploadImplantImages = upload.fields([
  { name: 'image1', maxCount: 1 },
  { name: 'image2', maxCount: 1 },
  { name: 'image3', maxCount: 1 },
]);

// helper สำหรับลบรูปเก่า
export const deleteImplantImages = (imagePaths) => {
  const paths = Array.isArray(imagePaths) ? imagePaths : [imagePaths];

  paths.forEach((imagePath) => {
    if (!imagePath) return;

    const filename = String(imagePath).split('/').pop();
    if (!filename) return;

    const fullPath = path.join(uploadsDir, filename);

    if (fs.existsSync(fullPath)) {
      try {
        fs.unlinkSync(fullPath);
        console.log('🗑️ Deleted old image:', filename);
      } catch (err) {
        console.error('❌ Failed to delete image:', filename, err.message);
      }
    }
  });
};

export default upload;