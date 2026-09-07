# MySQL Migration Guide

## เปลี่ยนจาก SQLite ไป MySQL เรียบร้อย ✅

### สิ่งที่เปลี่ยนไป:
- `database.js` - Config เปลี่ยนจาก SQLite เป็น MySQL
- `package.json` - mysql2 อยู่แล้ว (ไม่ต้องเพิ่มเติม)
- `.env.example` - มี MySQL config แล้ว

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

# Install dependencies (ถ้ายังไม่ได้ทำ)
npm install

# Sync database schema
npm run db:sync

# Seed initial data
npm run db:seed

# หรือ seed blogs
npm run seed:implants

# Start development
npm run dev
```

---

## MySQL Connection Details

ปัจจุบันตั้งค่าเป็น:
- **Host**: localhost
- **Port**: 3306 (default)
- **User**: root
- **Password**: root (แก้ไขใน .env)
- **Database**: implant_db

---

## Test Connection
```bash
# ใน backend folder
npm run dev
```

ถ้าเห็น `Server running on http://localhost:5000` = สำเร็จ

---

## Deploy to Production

เปลี่ยนค่าใน `.env` production:
```env
DB_HOST=your_mysql_server.com
DB_PORT=3306
DB_USER=prod_user
DB_PASSWORD=strong_password
DB_NAME=implant_db_prod
NODE_ENV=production
```

---

## Troubleshooting

### Error: "connect ECONNREFUSED"
- MySQL ยังไม่เปิด → รัน `mysql.server start`

### Error: "Access denied for user 'root'@'localhost'"
- Check password ใน .env ให้ตรง

### Error: "Unknown database 'implant_db'"
- สร้าง database ในตัวอย่าง #4 ด้านบน

---

## ข้อดีของ MySQL:
✅ Scalable - รองรับ millions of records  
✅ Concurrent users - ไม่มีปัญหา locking  
✅ Backup & Recovery - ดีกว่า SQLite  
✅ Production-ready - ใช้ได้สำหรับระบบจริง  
✅ Easy migration - Code ไม่ต้องเปลี่ยน (Sequelize ทำให้ได้)
