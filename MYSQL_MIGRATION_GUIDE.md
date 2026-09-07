
# MySQL Migration Guide (2026)

## ระบบใช้ MySQL เป็นหลัก (SQLite deprecated)

### สิ่งที่เปลี่ยนไป (2026):
- `database.js` - ใช้ MySQL/Sequelize เป็น default (ไม่มี SQLite แล้ว)
- `package.json` - mysql2, sequelize, multer, dotenv, cors, jsonwebtoken
- `.env.example` - ตัวอย่าง config ใหม่ (MySQL, JWT, uploads path)
- Images stored as files in `/uploads/implants`, `/uploads/blogs` (DB stores URLs, no base64)
- Static uploads: auto-create dir, auto-delete old images
- Blogs, master data, feedback: CRUD, admin/user

---

## วิธี Setup MySQL

### 1. ติดตั้ง MySQL Server
```bash
# macOS
brew install mysql

# Ubuntu/Debian
sudo apt-get install mysql-server

# Windows
# ดาวน์โหลดจาก https://dev.mysql.com/downloads/mysql/
```

### 2. เริ่ม MySQL Service
```bash
# macOS
brew services start mysql

# Ubuntu/Linux
sudo service mysql start

# หรือ
sudo systemctl start mysql
```

### 3. เข้า MySQL Command Line
```bash
mysql -u root -p
# หรือถ้าไม่มี password
mysql -u root
```

### 4. สร้าง Database
```sql
CREATE DATABASE implant_db;
CREATE DATABASE implant_db_test;

-- เช็คว่าสร้างสำเร็จ
SHOW DATABASES;

-- Exit
EXIT;
```

### 5. Setup Project
```bash
cd backend

# Copy .env.example เป็น .env
cp .env.example .env

# แก้ไข .env ให้ตรงกับ MySQL config ของคุณ
# DB_HOST=localhost
# DB_PORT=3306
# DB_USER=root
# DB_PASSWORD=your_password
# DB_NAME=implant_db
# JWT_SECRET=your_jwt_secret
# UPLOADS_DIR=uploads

# Install dependencies (ถ้ายังไม่ได้ทำ)
npm install

# Sync database schema (สร้างตารางทั้งหมด)
npm run db:sync

# Seed initial data (master, blogs, etc.)
npm run db:seed
npm run seed:implants

# Start development
npm run dev
```

---

## MySQL Connection Details

ตัวอย่าง config ใน `.env`:
- **Host**: localhost
- **Port**: 3306 (default)
- **User**: root
- **Password**: your_password
- **Database**: implant_db
- **JWT_SECRET**: your_jwt_secret
- **UPLOADS_DIR**: uploads

---

## Test Connection
```bash
# ใน backend folder
npm run dev
```

ถ้าเห็น `Server running on http://localhost:5000/api/health` = สำเร็จ
เช็ค `/uploads/implants` `/uploads/blogs` ถูกสร้างอัตโนมัติ

---

## Deploy to Production

เปลี่ยนค่าใน `.env` production:
```env
NODE_ENV=development
PORT=5000

DB_HOST=localhost
DB_PORT=3306
DB_NAME=datadental
DB_USER=root
DB_PASSWORD=080448

JWT_SECRET=your-secret-key-here-change-in-production
JWT_EXPIRE=7d
```

---

## Troubleshooting

### Error: "connect ECONNREFUSED"
- MySQL ยังไม่เปิด → รัน `mysql.server start` หรือ `sudo service mysql start`

### Error: "Access denied for user 'root'@'localhost'"
- Check password ใน .env ให้ตรง

### Error: "Unknown database 'implant_db'"
- สร้าง database ในตัวอย่าง #4 ด้านบน

### Error: "Cannot find uploads directory"
- uploads/ จะถูกสร้างอัตโนมัติ ถ้า permission ไม่พอ ให้ `chmod 777 uploads` หรือรันด้วยสิทธิ์ admin

---

## ข้อดีของ MySQL:
✅ Scalable - รองรับ millions of records
✅ Concurrent users - ไม่มีปัญหา locking
✅ Backup & Recovery - ดีกว่า SQLite
✅ Production-ready - ใช้ได้สำหรับระบบจริง
✅ Static uploads - เก็บไฟล์แยก, DB เก็บแค่ URL
✅ Blogs/master-data/feedback - รองรับ CRUD เต็มรูปแบบ
✅ Easy migration - Code ไม่ต้องเปลี่ยน (Sequelize ทำให้ได้)

---
## 🆕 Major Changes from Previous Version
- SQLite → MySQL (Sequelize), images now stored as files, DB stores URLs (not base64)
- Static uploads: /uploads/implants, /uploads/blogs (auto-create dir, auto-delete old images)
- Blogs, master data, feedback: CRUD, admin/user side
- id รองรับ master-xxx/custom, slug, auto-refresh ทุกหน้า (localStorage sync)
- JWT, CORS, health check, error handler, troubleshooting docs
- Documentation, README_BACKEND.md, README_FRONTEND.md, CHECKLIST.md อัปเดตใหม่
