# Frontend Setup Guide - Implant Database

## 🎨 ภาพรวม Frontend

Frontend ประกอบด้วย 2 ส่วนหลัก:
1. **Admin Panel** - จัดการข้อมูล implants, blogs, master data
2. **User Interface** - แสดงข้อมูล implants, blogs สำหรับผู้ใช้ทั่วไป

---

## 🚀 การติดตั้งและใช้งาน

### 1. ติดตั้ง Dependencies
```bash
cd frontend
npm install
```

### 2. ตั้งค่า Environment Variables
สร้างไฟล์ `.env` ใน folder `frontend/`:

```env
VITE_API_URL=http://localhost:5000/api
```

### 3. เริ่ม Development Server
```bash
npm run dev
```

Frontend จะรันที่: `http://localhost:3000`

---

## 📁 โครงสร้าง Frontend

### Admin Side (`/admin/*`)

#### Pages:
- **Login.jsx** - หน้า login (admin@lamduan.mfu.ac.th / ilovedentalverymuch)
- **Dashboard.jsx** - หน้าแรกของ admin
- **ManageImplants.jsx** - จัดการ implants (list, edit, delete) ✨ รองรับ thumbnails
- **NewImplant.jsx** - เพิ่ม/แก้ไข implant ✨ รองรับ image upload
- **ManageBlog.jsx** - จัดการบทความ
- **BlogForm.jsx** - เพิ่ม/แก้ไขบทความ
- **MasterDataHome.jsx** - จัดการข้อมูลหลัก
- **MasterDataList.jsx** - รายการ master data
- **MasterDataForm.jsx** - เพิ่ม/แก้ไข master data
- **ContactFeedback.jsx** - ดู feedback จากผู้ใช้
- **Profile.jsx** - โปรไฟล์ admin

#### Components:
- **AdminLayout.jsx** - Layout wrapper สำหรับหน้า admin
- **AdminSearchBar.jsx** - Search bar component
- **Breadcrumb.jsx** - Breadcrumb navigation
- **CustomSelect.jsx** - Custom select dropdown

### User Side (`/`)

#### Pages:
- **Home.jsx** - หน้าแรก
- **ImplantDatabase.jsx** - รายการ brands พร้อม filter ✨ แสดงรูปจาก backend
- **ImplantDetail.jsx** - รายละเอียด implant พร้อม image gallery ✨ แสดงรูปจาก backend
- **BrandDetail.jsx** - รายละเอียดของ brand
- **Blog.jsx** - รายการบทความ
- **BlogDetail.jsx** - รายละเอียดบทความ
- **Contact.jsx** - หน้าติดต่อ
- **Dashboard.jsx** - Dashboard สำหรับผู้ใช้

#### Components:
- **Navbar.jsx** - Navigation bar
- **Footer.jsx** - Footer
- **ImplantCard.jsx** - Card แสดง implant แต่ละรายการ ✨ รองรับรูปภาพ
- **FilterSidebar.jsx** - Sidebar สำหรับ filter
- **Breadcrumb.jsx** - Breadcrumb navigation

#### Hooks:
- **useMergedImplants.js** - Hook สำหรับดึงข้อมูล implants ✨ แปลง URL อัตโนมัติ

#### Utils:
- **imageHelpers.js** - Helper functions สำหรับจัดการรูปภาพ ✨ ใหม่!

---

## 🖼️ Image Upload Features (Admin)

### NewImplant.jsx - เพิ่ม/แก้ไข Implant

#### Features:
- ✅ อัพโหลดรูปได้ 3 รูป (image1, image2, image3)
- ✅ Preview รูปก่อนบันทึก
- ✅ Drag-and-drop support (คลิกที่ image box)
- ✅ ลบรูปได้ด้วยปุ่ม "Remove"
- ✅ ส่งไฟล์ไป backend ผ่าน FormData
- ✅ Edit mode: แสดงรูปเก่าที่มีอยู่แล้ว
- ✅ Validation: ขนาดไฟล์ไม่เกิน 10MB, รองรับเฉพาะ image/*

#### การใช้งาน:
1. กด "+ Add new implant" ในหน้า Manage Implants
2. คลิกที่ image box เพื่อเลือกไฟล์
3. กรอกข้อมูล implant
4. กด "Create Implant" เพื่อบันทึก

### ManageImplants.jsx - จัดการ Implants

#### Features:
- ✅ แสดง thumbnail รูปแรก (image1)
- ✅ รองรับทั้ง base64 และ URL จาก backend
- ✅ Error handling: ถ้ารูปโหลดไม่ได้จะแสดง placeholder
- ✅ Real-time refresh: กด "⟳ Refresh" เพื่ออัพเดทข้อมูล
- ✅ Auto-refresh: เมื่อ localStorage มีการเปลี่ยนแปลง
- ✅ CRUD operations: Edit, Delete, Toggle status

#### การใช้งาน:
1. ดูรายการ implants พร้อม thumbnail
2. กด "Edit" เพื่อแก้ไข
3. กด "Delete" เพื่อลบ (รูปจะถูกลบจาก server อัตโนมัติ)
4. กด "⟳ Refresh" เพื่อดึงข้อมูลใหม่

---

## 👁️ Image Display (User Side)

### ImplantDetail.jsx - หน้ารายละเอียด Implant

#### Features:
- ✅ Image gallery: แสดงรูปทั้ง 3 รูป (ถ้ามี)
- ✅ Image slider: คลิก thumbnail เพื่อเปลี่ยนรูป
- ✅ Responsive: รองรับทุกขนาดหน้าจอ
- ✅ Fallback: แสดง placeholder ถ้าไม่มีรูป
- ✅ Auto-load: ดึงรูปจาก backend อัตโนมัติ

#### URL:
```
http://localhost:3000/implants/{slug}
```

### ImplantCard.jsx - Card Component

#### Features:
- ✅ แสดงรูป implant (หรือ placeholder)
- ✅ รองรับทั้ง base64 และ URL
- ✅ Responsive design
- ✅ Click to view detail

---

## 🔧 Helper Functions

### imageHelpers.js

#### `getApiBaseUrl()`
ดึง base URL ของ backend API

```javascript
import { getApiBaseUrl } from './utils/imageHelpers';
const baseUrl = getApiBaseUrl(); // "http://localhost:5000"
```

#### `resolveImageUrl(imageUrl)`
แปลง relative path เป็น full URL

```javascript
import { resolveImageUrl } from './utils/imageHelpers';

const url1 = resolveImageUrl('/uploads/implants/image.jpg');
// → "http://localhost:5000/uploads/implants/image.jpg"

const url2 = resolveImageUrl('data:image/jpeg;base64,...');
// → "data:image/jpeg;base64,..." (unchanged)
```

#### `getImplantImages(implant)`
ดึงรูปทั้ง 3 รูปจาก implant object

```javascript
import { getImplantImages } from './utils/imageHelpers';

const images = getImplantImages(implant);
// [
//   { id: 1, url: "http://localhost:5000/uploads/implants/img1.jpg" },
//   { id: 2, url: "http://localhost:5000/uploads/implants/img2.jpg" },
//   { id: 3, url: null }
// ]
```

#### `getImplantThumbnail(implant)`
ดึงรูปแรกที่มีอยู่

```javascript
import { getImplantThumbnail } from './utils/imageHelpers';

const thumb = getImplantThumbnail(implant);
// "http://localhost:5000/uploads/implants/img1.jpg"
```

---

## 🔄 Real-time Data Sync

### Admin Side:
- ใช้ `localStorage` events เพื่อ sync ระหว่างแท็บ
- Auto-refresh เมื่อกลับมาที่แท็บ (focus event)
- Manual refresh ด้วยปุ่ม "⟳ Refresh"

### User Side:
- ใช้ `useMergedImplants` hook
- ผสมข้อมูลจาก: API + localStorage + seed data
- Auto-refresh on storage changes

---

## 🎯 Workflow ตัวอย่าง

### สร้าง Implant ใหม่:

1. **Admin เข้าสู่ระบบ**
   ```
   http://localhost:3000/admin/login
   Email: admin@lamduan.mfu.ac.th
   Password: ilovedentalverymuch
   ```

2. **ไปที่ Manage Implants**
   ```
   http://localhost:3000/admin/implants
   ```

3. **กด "+ Add new implant"**
   ```
   http://localhost:3000/admin/implants/new
   ```

4. **เลือกรูปและกรอกข้อมูล:**
   - คลิกที่ image box → เลือกไฟล์รูป (3 รูป)
   - กรอก Name, Brand, Company, Level, etc.
   - กด "Create Implant"

5. **ระบบจะ:**
   - อัพโหลดรูปไปที่ `backend/uploads/implants/`
   - บันทึกข้อมูลใน MySQL
   - Refresh หน้า Manage Implants
   - แสดง thumbnail ในรายการ

6. **User เห็นข้อมูลใหม่ทันที:**
   ```
   http://localhost:3000/implants
   http://localhost:3000/implants/{slug}
   ```

---

## 🐛 Troubleshooting

### ปัญหา: รูปไม่แสดง (404)
```
GET http://localhost:5000/uploads/implants/image.jpg 404
```

**แก้ไข:**
1. ตรวจสอบว่า backend รัน และ serve static files:
   ```javascript
   app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
   ```
2. ตรวจสอบว่าไฟล์อยู่ใน `backend/uploads/implants/`
3. ตรวจสอบ CORS settings ใน backend

### ปัญหา: CORS error
```
Access to fetch at 'http://localhost:5000/api/implants' from origin 'http://localhost:3000' has been blocked by CORS policy
```

**แก้ไข:**
ใน `backend/src/index.js`:
```javascript
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
}));
```

### ปัญหา: Image upload ล้มเหลว
```
Error: File too large
```

**แก้ไข:**
1. ตรวจสอบขนาดไฟล์ (ต้องไม่เกิน 10MB)
2. ตรวจสอบ file type (รองรับเฉพาะ: JPEG, PNG, GIF, WebP)
3. ตรวจสอบ permissions ของ folder `backend/uploads/implants/`

### ปัญหา: แสดงรูปเป็น base64 แทน URL
**สาเหตุ:** ข้อมูลเก่าใน localStorage ยังเป็น base64

**แก้ไข:**
1. Clear localStorage: `localStorage.clear()`
2. Refresh หน้า
3. ข้อมูลใหม่จะดึงจาก backend และใช้ URL แทน

---

## 📸 รูปแบบ Image URL

### Backend URL (แนะนำ):
```
/uploads/implants/straumann-1234567890.jpg
```

### Full URL:
```
http://localhost:5000/uploads/implants/straumann-1234567890.jpg
```

### Base64 (เก่า - ยังรองรับอยู่):
```
data:image/jpeg;base64,/9j/4AAQSkZJRg...
```

---

## 🔑 Admin Credentials

```
Email: admin@lamduan.mfu.ac.th
Password: ilovedentalverymuch
```

---

## 🌐 URLs

### Admin:
- Login: `http://localhost:3000/admin/login`
- Dashboard: `http://localhost:3000/admin/dashboard`
- Implants: `http://localhost:3000/admin/implants`
- Add Implant: `http://localhost:3000/admin/implants/new`
- Edit Implant: `http://localhost:3000/admin/implants/edit/:id`
- Blogs: `http://localhost:3000/admin/blog`
- Master Data: `http://localhost:3000/admin/master`
- Feedback: `http://localhost:3000/admin/feedback`

### User:
- Home: `http://localhost:3000/`
- Implants: `http://localhost:3000/implants`
- Implant Detail: `http://localhost:3000/implants/:slug`
- Brand Detail: `http://localhost:3000/implants/brand/:brand`
- Blog: `http://localhost:3000/blog`
- Contact: `http://localhost:3000/contact`

---

## 🎨 การใช้งาน Image Helpers

### ใน Component:

```jsx
import { resolveImageUrl, getImplantThumbnail } from '../utils/imageHelpers';

function MyComponent({ implant }) {
  const thumbnail = getImplantThumbnail(implant);
  
  return (
    <img 
      src={thumbnail || '/placeholder.jpg'} 
      alt={implant.name}
      onError={(e) => {
        e.target.src = '/placeholder.jpg'; // Fallback
      }}
    />
  );
}
```

### แสดงรูปที่ 1:
```jsx
<img src={resolveImageUrl(implant.image1)} alt={implant.name} />
```

### แสดงทุกรูปแบบ gallery:
```jsx
import { getImplantImages } from '../utils/imageHelpers';

function ImageGallery({ implant }) {
  const images = getImplantImages(implant);
  
  return (
    <div>
      {images.map((img) => 
        img.url && <img key={img.id} src={img.url} alt={`Image ${img.id}`} />
      )}
    </div>
  );
}
```

---

## 📦 Dependencies

### Main:
- **React 18** - UI library
- **React Router DOM** - Routing
- **Vite** - Build tool
- **Axios** (optional) - HTTP client

### Styling:
- **CSS Modules** - Component-scoped CSS
- **Plain CSS** - Global styles

---

## 🔐 Authentication Flow

1. User เข้าสู่ระบบที่ `/admin/login`
2. Frontend ส่ง email + password ไป `POST /api/auth/login`
3. Backend ตรวจสอบและส่ง JWT token กลับมา
4. Frontend เก็บ token ใน `localStorage.getItem('admin_token')`
5. ทุก request ต่อไปจะส่ง header: `Authorization: Bearer {token}`
6. Protected routes จะตรวจสอบ token ก่อนเข้าหน้า

---

## 🎯 Key Features Summary

### ✅ Admin Side:
1. **Image Upload** - อัพโหลดรูป 3 รูปพร้อมกัน
2. **Image Preview** - ดูรูปก่อนบันทึก
3. **Thumbnail Display** - แสดง thumbnail ในรายการ
4. **Real-time Sync** - อัพเดทข้อมูลทันทีหลัง CRUD
5. **Auto Delete** - ลบรูปเก่าอัตโนมัติเมื่อ update/delete

### ✅ User Side:
1. **Image Gallery** - แสดงรูปทั้ง 3 แบบ slider
2. **Responsive Images** - ปรับขนาดตามหน้าจอ
3. **Lazy Loading** - โหลดรูปแบบ progressive
4. **Filter & Search** - กรองตาม brand, company, country, etc.
5. **Brand Linking** - Link ไปยัง brand detail และ implant detail

---

## 🔗 Related Files

### Backend:
- [Backend README](../backend/README_BACKEND.md)
- [MySQL Schema](../backend/database/schema.sql)
- [Upload Middleware](../backend/src/middleware/upload.js)
- [Implants Routes](../backend/src/routes/implants.js)

### Frontend:
- [NewImplant.jsx](src/admin/pages/NewImplant.jsx)
- [ManageImplants.jsx](src/admin/pages/ManageImplants.jsx)
- [ImplantDetail.jsx](src/user/pages/ImplantDetail.jsx)
- [useMergedImplants Hook](src/user/hooks/useMergedImplants.js)
- [Image Helpers](src/utils/imageHelpers.js)

---

## 🏗️ ขั้นตอนการพัฒนาต่อ

### เพิ่มฟีเจอร์ที่แนะนำ:
1. **WebSocket** - Real-time updates แบบ instant
2. **Image Optimization** - Compress รูปก่อนอัพโหลด
3. **Lazy Loading** - โหลดรูปเมื่อ scroll ถึง
4. **CDN Integration** - ใช้ CDN เพื่อเร่งความเร็ว
5. **Progress Bar** - แสดง progress ขณะอัพโหลด
6. **Multiple Upload** - เลือกหลายรูปพร้อมกัน
7. **Crop Tool** - ตัดแต่งรูปก่อนบันทึก

---

ทำเสร็จแล้ว! 🎉
