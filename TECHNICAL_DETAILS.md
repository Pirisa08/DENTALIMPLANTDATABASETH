# Technical Implementation Details

## Architecture Overview (2026)

```
┌─────────────────────────────────────────────────────────────┐
│                    React Frontend (Vite 18)                 │
│                      http://localhost:3000                  │
├─────────────────────────────────────────────────────────────┤
│  Admin Panel (NewImplant.jsx, ManageImplants.jsx, etc.)     │
│  ├─ Form with 3 image inputs (master/custom, id master-xxx) │
│  ├─ Sends FormData (files) to backend                       │
│  ├─ Uses resolveImageUrl, auto-refresh, localStorage sync   │
│  └─ CRUD for implants, blogs, master data, feedback         │
└──────────────┬──────────────────────────────────────────────┘
               │ HTTP POST/PUT multipart/form-data
               │
┌──────────────▼──────────────────────────────────────────────┐
│                Express.js Backend (Node.js)                 │
│              http://localhost:5000/api/health               │
├─────────────────────────────────────────────────────────────┤
│  POST /api/implants (multer, static uploads, MySQL)         │
│  ├─ Multer middleware extracts files                        │
│  ├─ Saves files to /uploads/implants                        │
│  ├─ Stores image URLs in MySQL (no base64)                  │
│  └─ Returns implant object with image URLs                  │
│  ...                                                        │
│  CRUD: /api/blogs, /api/master-data, /api/feedback          │
│  Static file serving: /uploads/implants, /uploads/blogs      │
│  JWT, CORS, health check, error handler                     │
└──────────────┬──────────────────────────────────────────────┘
               │ Sequelize queries
               │
┌──────────────▼──────────────────────────────────────────────┐
│              MySQL Database (Sequelize ORM)                 │
├─────────────────────────────────────────────────────────────┤
│  Tables: implants, implant_master, blogs, companies, etc.   │
│  ├─ id, name, brand, ...                                    │
│  ├─ image1Url, image2Url, image3Url (file URLs)             │
│  └─ ... other fields                                        │
└─────────────────────────────────────────────────────────────┘
```

## Image Processing Flow (2026)

### Upload Flow
```
User selects image (JPG/PNG/GIF/WebP, ≤10MB)
  ↓
FormData appends files (no base64)
  ↓
User clicks Save
  ↓
POST /api/implants (multipart/form-data)
  ↓
Backend: multer extracts files
  ↓
Save files to /uploads/implants
  ↓
Store image URLs in MySQL (image1Url, image2Url, image3Url)
  ↓
Return implant object (with image URLs) to frontend
  ↓
Frontend stores in localStorage (auto-refresh)
  ↓
Display confirmation
```

### Retrieval Flow
```
User views implant detail page
  ↓
GET /api/implants or GET /api/implants/:id
  ↓
Backend retrieves image URLs from database
  ↓
Return implant object with image1Url, image2Url, image3Url
  ↓
Frontend receives image URLs
  ↓
<img src="/uploads/implants/xxx.jpg" />
  ↓
Browser renders images directly
```

## Key Files Modified

### 1. Backend Files

**[backend/src/routes/implants.js](backend/src/routes/implants.js)**
```javascript
// Key additions:
- import multer from 'multer'
- Upload middleware config with memory storage
- bufferToDataUrl() helper function
- POST/PUT handlers with file upload support
```

**[backend/src/config/database.js](backend/src/config/database.js)**
```javascript
// Changed from MySQL to SQLite for development
- Uses sqlite dialect
- Storage file: implant_db.sqlite
- Maintains compatibility with MySQL in production
```

### 2. Frontend Files

**[frontend/src/services/api.js](frontend/src/services/api.js)**
```javascript
// Key additions:
- dataUrlToFile() helper to convert base64 back to File
- implantsAPI.create() - sends FormData with files
- implantsAPI.update() - sends FormData with files
- 10-second timeout for file uploads
```

**[frontend/src/admin/pages/NewImplant.jsx](frontend/src/admin/pages/NewImplant.jsx)**
```javascript
// Modified save() function:
- Tries backend API first (primary storage)
- Falls back to localStorage if API fails
- Syncs data between both storage methods
- Dispatches storage events for cross-tab sync
```

**[frontend/src/admin/pages/ManageImplants.jsx](frontend/src/admin/pages/ManageImplants.jsx)**
```javascript
// Enhanced initialization:
- Loads from backend API first
- Falls back to localStorage
- Seeds from mockImplants if needed
- Listens for cross-tab storage changes
```

## Data Structure

### Implant Object (Database)
```json
{
  "id": 1,
  "name": "Implant Name",
  "brand": "Brand Name",
  "slug": "implant-name",
  "companyId": 1,
  "levelId": 1,
  "countryId": 1,
  "countryText": "Switzerland",
  "website": "https://example.com",
  "brandDescription": "Description here",
  "connectionType": "Internal Hex",
  "connectionShape": "Conical",
  "screwdriverShape": "Hex",
  "headShape": "Conical",
  "bodyShape": "Cylindrical",
  "apexShape": "Tapered",
  "officialDistributor": "Distributor Name",
  "status": "Active",
  "image1Url": "/uploads/implants/xxx1.jpg",
  "image2Url": "/uploads/implants/xxx2.jpg",
  "image3Url": "/uploads/implants/xxx3.jpg",
  "createdAt": "2024-01-31T10:00:00.000Z",
  "updatedAt": "2024-01-31T10:00:00.000Z"
}
```

## Error Handling

### Backend (Express)
```javascript
try {
  // Process upload
  const implant = await Implant.create(data);
  res.status(201).json(implant);
} catch (err) {
  res.status(400).json({ error: err.message });
}
```

### Frontend (React)
```javascript
try {
  setSaving(true);
  let apiResult = await implantsAPI.create(form);
  if (apiResult) {
    // Success - sync to localStorage
    localStorage.setItem(...);
  } else {
    // API failed - use localStorage only
    localStorage.setItem(...);
  }
} catch (err) {
  alert("Save failed: " + err.message);
} finally {
  setSaving(false);
}
```

## Performance Optimizations

### Client-Side
- FileReader for local image conversion
- Lazy loading images in tables
- Thumbnail preview without full image render
- localStorage caching for offline access

### Server-Side
- Memory storage (no disk I/O for uploads)
- SQLite (lightweight, file-based)
- Single-pass image encoding
- Connection pooling ready

### Network
- FormData for efficient multipart transfer
- 10-second timeout for large files
- No unnecessary re-fetches
- ETag/Last-Modified support ready

## Security Considerations

### File Upload Security
```javascript
// Multer configuration in routes/implants.js
fileFilter: (req, file, cb) => {
  if (file.mimetype.match(/^image\/(jpeg|png|gif|webp)$/)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, GIF, WebP allowed'), false);
  }
},
limits: {
  fileSize: 10 * 1024 * 1024, // 10MB
}
```

### Recommendations for Production
1. **File validation**: Check magic bytes, not just MIME type
2. **Virus scanning**: Integrate with ClamAV or similar
3. **Rate limiting**: Limit uploads per user/IP
4. **Authentication**: Require login for uploads
5. **HTTPS**: Use TLS for all connections
6. **CORS**: Restrict to trusted domains
7. **Storage**: Consider external service (S3, Azure Blob)
8. **Compression**: Compress images before storage

## Database Queries

### Create Implant
```sql
INSERT INTO implants 
(name, brand, slug, companyId, levelId, countryId, 
 connectionType, connectionShape, image1, image2, image3, status, 
 createdAt, updatedAt)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
```

### Get Implant with Images
```sql
SELECT * FROM implants 
WHERE id = ? 
LIMIT 1
```

### Get All Implants
```sql
SELECT * FROM implants 
WHERE status = 'Active' 
ORDER BY createdAt DESC
```

## Dependencies Added

### Backend
```json
"multer": "^1.x" - File upload handling
```

### Frontend
- No new dependencies (uses built-in FileReader API)

## Browser Compatibility

### Supported Browsers
- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Opera 76+

### Required Features
- FileReader API (for base64 conversion)
- FormData API (for multipart uploads)
- Fetch API (for HTTP requests)
- localStorage (for offline support)

## Development vs Production

### Development Setup
```
Database: MySQL (Sequelize, .env config)
Port: 5000 (Backend), 3001 (Frontend)
CORS: Enabled for localhost
Static uploads: /uploads/implants, /uploads/blogs
JWT: Enabled for authentication (optional)
```

### Production Setup
```
Database: MySQL (recommended)
Port: 80/443 (HTTPS)
CORS: Restricted to domain
Image Storage: /uploads/implants, /uploads/blogs (or S3/Azure Blob)
JWT: Required for authentication
```

## Testing Scenarios

1. **Happy Path**: Upload 3 images → View on user side
2. **Partial Data**: Upload 1-2 images → Verify handling
3. **Large Files**: 9.9MB image → Verify limit enforcement
4. **Invalid Format**: PDF/ZIP → Verify rejection
5. **Network Failure**: Offline mode → Verify localStorage fallback
6. **Concurrent Uploads**: Multiple implants → Verify sync
7. **Edit Existing**: Change images → Verify update
8. **Delete Image**: Remove one image → Verify partial update

## Future Enhancements

1. **Image Compression**: Reduce file size
2. **Image Optimization**: Auto-optimize dimensions
3. **CDN Integration**: Faster image delivery
4. **Thumbnail Generation**: Auto-create thumbnails
5. **Image Cropping**: User-selectable crop area
6. **Batch Upload**: Multiple implants at once
7. **Drag & Drop**: Improved UX
8. **Progress Bar**: Show upload progress
9. **External Storage**: S3/Azure Blob for images
10. **Advanced Auth**: JWT, roles, permissions

---
## 🆕 Major Changes from Previous Version
- SQLite → MySQL (Sequelize), images now stored as files, DB stores URLs (not base64)
- Static uploads: /uploads/implants, /uploads/blogs (auto-create dir, auto-delete old images)
- Blogs, master data, feedback: CRUD, admin/user side
- id รองรับ master-xxx/custom, slug, auto-refresh ทุกหน้า (localStorage sync)
- JWT, CORS, health check, error handler, troubleshooting docs
- Documentation, README_BACKEND.md, README_FRONTEND.md, CHECKLIST.md อัปเดตใหม่
