# 🚀 Quick Start Guide

## Prerequisites
- Node.js 14+ (already installed)
- npm (already installed)
- Web browser (Chrome, Firefox, Safari, Edge)

## ⚡ 30-Second Setup

### Step 1: Start Backend (Terminal 1)
```bash
cd backend
npm run dev
```
✅ Wait for: "Server running on http://localhost:5000/api/health"

### Step 2: Start Frontend (Terminal 2)
```bash
cd frontend
npm run dev
```
✅ Wait for: "Local: http://localhost:3000"

### Step 3: Open Browser
Go to: **http://localhost:3000/admin**

---

## 📝 Creating Your First Implant with Images

### Method 1: Via Admin Panel (Easy)

1. **Go to Admin**: http://localhost:3000/admin
2. **Click**: "Implants Management"
3. **Click**: "+ Add new implant"
4. **Fill Form**:
   - Name: "Test Implant"
   - Brand: Select one
   - Company: Select one
   - Level: Select one
   - Country: Select one
5. **Add Images**:
   - Click 📷 box for "Image 1"
   - Select a JPG or PNG file
   - Repeat for Image 2 and Image 3
6. **Save**: Click "Create Implant"

✅ Done! Implant created with images.

### Method 2: Via API (Advanced)

```bash
curl -X POST http://localhost:5000/api/implants \
        -F "name=Test Implant" \
        -F "companyId=1" \
        -F "levelId=1" \
        -F "countryId=1" \
        -F "image1=@/path/to/image1.jpg" \
        -F "image2=@/path/to/image2.jpg" \
        -F "image3=@/path/to/image3.jpg"
# Images will be saved as files, DB stores URLs (no base64)
```

---

## 👁️ Viewing Implants

### Admin View
**URL**: http://localhost:3000/admin/implants

Shows:
- Table of all implants
- Thumbnail preview of Image 1
- Edit/Delete buttons
- Status toggle

### User View
**URL**: http://localhost:3000/implants

Shows:
- Brand cards
- Click to view detail
- Full implant info with all 3 images

---

## 🖼️ Image Upload Details

### Supported Formats
- ✅ JPEG (.jpg)
- ✅ PNG (.png)
- ✅ GIF (.gif)
- ✅ WebP (.webp)

### Size Limits
- **Per image**: Max 10 MB
- **Total for 3**: Max 30 MB
- **Recommended**: 2-5 MB for fast loading

### Image Positions
1. **Image 1 - Main Product**: Front/primary view
2. **Image 2 - Detail View**: Close-up/detail
3. **Image 3 - Application**: In-use/application

---

## 🔄 Data Sync Explained

### Create Flow
```
Admin uploads image
        ↓
Sends FormData (files) to backend API
        ↓
Backend saves files to /uploads/implants, DB stores URLs (no base64)
        ↓
Frontend saves to localStorage (auto-refresh)
        ↓
User side auto-syncs (gallery, id master-xxx/custom)
```

### View Flow
```
User loads implant detail
        ↓
Fetches from backend API (image URLs)
        ↓
Falls back to localStorage if offline
        ↓
Displays 3 images with thumbnails (gallery, slider)
```

---

## 🌐 URLs Quick Reference

| Page | URL |
|------|-----|
| Home | http://localhost:3000 |
| User Implants | http://localhost:3000/implants |
| Admin Home | http://localhost:3000/admin |
| Manage Implants | http://localhost:3000/admin/implants |
| New Implant | http://localhost:3000/admin/implants/new |
| Edit Implant | http://localhost:3000/admin/implants/edit/1 |
| Blog | http://localhost:3000/blogs |
| Contact | http://localhost:3000/contact |

---

## 🛠️ Common Tasks

### Create Implant
1. Go to http://localhost:3000/admin/implants/new
2. Fill form
3. Upload 3 images
4. Click "Create Implant"

### Edit Implant
1. Go to http://localhost:3000/admin/implants
2. Find implant, click "Edit" (master/custom, id master-xxx)
3. Change any field or images (replace/delete, auto-delete old images)
4. Click "Save Changes"

### View Implant (User Side)
1. Go to http://localhost:3000/implants
2. Click on any implant card
3. View detail page with all 3 images
4. Click thumbnails to switch images

### Test Offline Mode
1. Open DevTools: F12
2. Network tab → Offline checkbox
3. Create/edit implant
4. Works from localStorage!

### Clear All Data
1. Stop backend: Ctrl+C
2. Drop MySQL database or run migration reset (see MYSQL_MIGRATION_GUIDE.md)
3. Start backend again: `npm run dev`
4. Fresh database created!

---

## 🐛 Troubleshooting

### Backend won't start
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Try again
npm start
```

### Frontend won't start
```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9

# Try again
npm run dev
```

### Images not uploading
- ✅ Check file size < 10MB
- ✅ Check file is actual image (not PDF, ZIP, etc)
- ✅ Check DevTools Network tab for errors
- ✅ Try different image

### Images not showing
- ✅ Refresh page (Ctrl+Shift+R)
- ✅ Clear cache (DevTools → Storage → Clear)
- ✅ Check backend is running
- ✅ Check browser console for errors

### Data not syncing
- ✅ Check both servers running
- ✅ Check network connection
- ✅ Refresh page
- ✅ Clear localStorage: Open DevTools → Storage → localStorage → Clear

---

## 📊 Testing Checklist

**First Time**
- [ ] Backend starts
- [ ] Frontend starts
- [ ] Admin page loads
- [ ] Can add new implant
- [ ] Can upload image

**Images**
- [ ] Image 1 uploads successfully
- [ ] Image 2 uploads successfully  
- [ ] Image 3 uploads successfully
- [ ] Images show in admin list
- [ ] Images show in user detail page

**Functionality**
- [ ] Can edit implant
- [ ] Can delete implant
- [ ] Can change images
- [ ] Can remove images
- [ ] Data persists after reload

**User Side**
- [ ] Can see implant in list
- [ ] Can click to view detail
- [ ] All 3 images display
- [ ] Can switch between images
- [ ] Specifications show correctly

**Offline**
- [ ] Works without internet
- [ ] localStorage fallback works
- [ ] Data syncs when online again

---

## 📚 Documentation

- 📖 **QUICK_REFERENCE.md** - Command reference
- 📖 **TESTING_GUIDE.md** - How to test
- 📖 **TECHNICAL_DETAILS.md** - Architecture
- 📖 **IMPLEMENTATION_SUMMARY.md** - What changed

---

## 🎉 You're Ready!

**Backend**: ✅ Running
**Frontend**: ✅ Running
**Database**: ✅ Ready

### Next Steps:
1. Open http://localhost:3000/admin
2. Create a test implant with 3 images
3. View it on user side
4. Try editing and deleting
5. Test offline mode

---

## 💡 Pro Tips

### Upload Large Images
- Compress images first (Photoshop, online tools)
- Recommended: 2-5MB per image
- Faster uploads and better performance

### Test Multiple Implants
- Create 3-5 implants with different images
- Test search functionality
- Verify data consistency

### Test Offline
- Use DevTools Offline mode
- Make changes offline
- Verify they sync when online

### Monitor Performance
- Use DevTools Performance tab
- Check upload times
- Monitor memory usage

---

## ❓ FAQ

**Q: Where are images stored?**
A: Files in `/uploads/implants`, database stores URLs (no base64)

**Q: Can I use my own images?**
A: Yes! Any JPG, PNG, GIF, WebP, or SVG under 10MB

**Q: What if I lose connection?**
A: Changes saved to localStorage, synced when online

**Q: Can I edit images later?**
A: Yes! Go to Implants Management, click Edit, upload new images

**Q: How many implants can I create?**
A: Unlimited (limited by disk space for database)

**Q: Can I delete images but keep implant?**
A: Yes! Edit implant and remove specific images

---

## 📞 Support

For issues, check:
1. Browser console (F12 → Console)
2. Backend logs (terminal output)
3. TESTING_GUIDE.md (detailed testing)
4. TECHNICAL_DETAILS.md (architecture)

---

**Version**: 1.1
**Last Updated**: April 24, 2026
**Status**: ✅ Ready to Use

---
## 🆕 Major Changes from Previous Version
- SQLite → MySQL (Sequelize), images now stored as files, DB stores URLs (not base64)
- Static uploads: /uploads/implants, /uploads/blogs (auto-create dir, auto-delete old images)
- Blogs, master data, feedback: CRUD, admin/user side
- id รองรับ master-xxx/custom, slug, auto-refresh ทุกหน้า (localStorage sync)
- JWT, CORS, health check, error handler, troubleshooting docs
- Documentation, README_BACKEND.md, README_FRONTEND.md, CHECKLIST.md อัปเดตใหม่
