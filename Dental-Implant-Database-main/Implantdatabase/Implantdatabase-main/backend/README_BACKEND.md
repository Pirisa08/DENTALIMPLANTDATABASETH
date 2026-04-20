# Backend Setup Guide - Implant Database

## 🚀 การติดตั้งและใช้งาน

### 1. ติดตั้ง Dependencies
```bash
cd backend
npm install
```

### 2. ตั้งค่า MySQL Database

#### วิธีที่ 1: ใช้ MySQL Workbench หรือ phpMyAdmin
1. เปิด MySQL Workbench หรือ phpMyAdmin
2. รัน SQL script จากไฟล์ `backend/database/schema.sql`
3. ระบบจะสร้างฐานข้อมูล `implant_db` และตารางทั้งหมด

#### วิธีที่ 2: ใช้ Command Line
```bash
# Windows (PowerShell)
Get-Content backend/database/schema.sql | mysql -u root -p

# หรือใช้ MySQL CLI
mysql -u root -p < backend/database/schema.sql
```

### 3. ตั้งค่า Environment Variables
สร้างไฟล์ `.env` ใน folder `backend/`:

```env
PORT=5000
NODE_ENV=development

# MySQL Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=implant_db
DB_USER=root
DB_PASSWORD=your_mysql_password

# JWT Secret
JWT_SECRET=your_secure_random_string
JWT_EXPIRES_IN=7d

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

### 4. สร้าง Admin User

#### วิธีที่ 1: ใช้ bcrypt hash
```javascript
// ใน Node.js console หรือสร้างไฟล์ script
import bcrypt from 'bcryptjs';
const password = 'ilovedentalverymuch';
const hash = await bcrypt.hash(password, 10);
console.log(hash);
```

#### วิธีที่ 2: รันคำสั่ง SQL
```sql
INSERT INTO users (username, email, password, role, status) 
VALUES (
  'admin', 
  'admin@lamduan.mfu.ac.th', 
  '$2a$10$YourHashedPasswordHere', -- แทนที่ด้วย hash จริง
  'admin', 
  'Active'
);
```

### 5. เริ่มต้น Server
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

Server จะรันที่ `http://localhost:5000`

---

## 📁 โครงสร้าง Backend

```
backend/
├── src/
│   ├── config/
│   │   └── database.js          # MySQL/Sequelize configuration
│   ├── middleware/
│   │   ├── auth.js              # JWT authentication
│   │   └── upload.js            # Multer image upload (NEW!)
│   ├── models/
│   │   ├── Implant.js           # Implant model
│   │   ├── Company.js           # Company model
│   │   ├── Country.js           # Country model
│   │   ├── Level.js             # Level model
│   │   ├── User.js              # User model
│   │   └── index.js             # Model associations
│   ├── routes/
│   │   ├── implants.js          # Implant CRUD + Image Upload (UPDATED!)
│   │   ├── auth.js              # Login/Register
│   │   ├── blogs.js             # Blog management
│   │   ├── masterData.js        # Master data CRUD
│   │   └── feedback.js          # Contact feedback
│   └── index.js                 # Express server (UPDATED!)
├── uploads/
│   └── implants/                # Uploaded implant images
├── database/
│   └── schema.sql               # MySQL database schema (NEW!)
├── package.json
└── .env                         # Environment variables
```

---

## 🔌 API Endpoints

### Implants (with Image Upload)

#### GET `/api/implants`
ดึงรายการ implants ทั้งหมด (พร้อม relations)

**Response:**
```json
[
  {
    "id": 1,
    "name": "Straumann BLX",
    "brand": "Straumann",
    "image1": "/uploads/implants/straumann-1234567890.jpg",
    "image2": "/uploads/implants/straumann-1234567891.jpg",
    "image3": null,
    "company": { "id": 1, "name": "Straumann" },
    "level": { "id": 1, "name": "Premium" },
    "country": { "id": 1, "name": "Switzerland" }
  }
]
```

#### GET `/api/implants/:id`
ดึงข้อมูล implant ตาม ID

#### POST `/api/implants`
สร้าง implant ใหม่ พร้อมอัพโหลดรูปภาพ

**Request:** `multipart/form-data`
```
name: "Straumann BLX"
brand: "Straumann"
companyId: 1
levelId: 1
countryId: 1
image1: [File]
image2: [File]
image3: [File]
```

**Response:**
```json
{
  "id": 1,
  "name": "Straumann BLX",
  "image1": "/uploads/implants/straumann-1234567890.jpg",
  ...
}
```

#### PUT `/api/implants/:id`
แก้ไข implant (รูปภาพใหม่จะแทนที่รูปเก่าอัตโนมัติ)

**Request:** `multipart/form-data` (เหมือน POST)

#### DELETE `/api/implants/:id`
ลบ implant (รูปภาพจะถูกลบอัตโนมัติด้วย)

---

## 🖼️ Image Upload Features

### การทำงาน:
1. ✅ **Disk Storage**: เก็บรูปเป็นไฟล์จริงใน `backend/uploads/implants/`
2. ✅ **File Validation**: รองรับเฉพาะ JPEG, PNG, GIF, WebP
3. ✅ **File Size Limit**: สูงสุด 10MB ต่อรูป
4. ✅ **Unique Filename**: ใช้ timestamp + random number
5. ✅ **Auto Delete**: ลบรูปเก่าอัตโนมัติเมื่อ update/delete
6. ✅ **Static Serving**: เข้าถึงรูปผ่าน URL: `http://localhost:5000/uploads/implants/filename.jpg`

### ตัวอย่างการใช้งาน:

#### Frontend (React)
```javascript
const formData = new FormData();
formData.append('name', 'Straumann BLX');
formData.append('brand', 'Straumann');
formData.append('companyId', 1);
formData.append('image1', file1); // File object from input
formData.append('image2', file2);

const response = await fetch('http://localhost:5000/api/implants', {
  method: 'POST',
  body: formData,
  // Don't set Content-Type header - browser will set it with boundary
});
```

#### แสดงรูปภาพ:
```jsx
<img src={`http://localhost:5000${implant.image1}`} alt={implant.name} />
```

---

## 🔐 Authentication

### Login
**POST** `/api/auth/login`
```json
{
  "email": "admin@lamduan.mfu.ac.th",
  "password": "ilovedentalverymuch"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@lamduan.mfu.ac.th",
    "role": "admin"
  }
}
```

### Protected Routes
เพิ่ม header ในทุก request:
```
Authorization: Bearer <token>
```

---

## 🔄 Database Sync

Sequelize จะ sync schema อัตโนมัติทุกครั้งที่เริ่มเซิร์ฟเวอร์:
- ใช้ `alter: true` - จะปรับตารางให้ตรงกับ model โดยไม่ลบข้อมูล
- ถ้าต้องการ reset ทั้งหมด ให้ใช้ `force: true` (ระวัง: จะลบข้อมูลทั้งหมด!)

---

## 🐛 Troubleshooting

### ปัญหา: Cannot connect to MySQL
```
Error: connect ECONNREFUSED 127.0.0.1:3306
```
**แก้ไข:**
1. ตรวจสอบว่า MySQL service ทำงานอยู่
2. ตรวจสอบ username/password ใน `.env`
3. ตรวจสอบว่าฐานข้อมูล `implant_db` ถูกสร้างแล้ว

### ปัญหา: Upload failed
```
Error: ENOENT: no such file or directory
```
**แก้ไข:**
- Folder `backend/uploads/implants/` จะถูกสร้างอัตโนมัติ
- ตรวจสอบ permissions ของ folder

### ปัญหา: Image not found (404)
```
GET http://localhost:5000/uploads/implants/image.jpg 404
```
**แก้ไข:**
- ตรวจสอบว่าไฟล์อยู่ใน `backend/uploads/implants/`
- ตรวจสอบว่า path ใน database ถูกต้อง
- ตรวจสอบว่า Express serve static files: `app.use('/uploads', express.static(...))`

---

## 📝 Notes

- ✅ Backend รองรับ MySQL แล้ว (ใช้ Sequelize ORM)
- ✅ Image upload ใช้ Multer + Disk Storage
- ✅ Auto-create uploads directory
- ✅ Auto-delete old images on update/delete
- ✅ CORS enabled for frontend development
- ✅ JWT authentication ready

---

## 🔗 Related Files
- [Frontend Admin Pages](../frontend/src/admin/pages/)
- [MySQL Migration Guide](../MYSQL_MIGRATION_GUIDE.md)
- [API Testing Guide](../test-api.sh)
