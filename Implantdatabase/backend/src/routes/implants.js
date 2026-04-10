import express from 'express';
import { Implant } from '../models/index.js';
import { uploadImplantImages, deleteImplantImages } from '../middleware/upload.js';

const router = express.Router();

const toNullableInt = (value) => {
  if (value === undefined || value === null) return null;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const parsed = Number(trimmed);
    return Number.isNaN(parsed) ? null : parsed;
  }
  if (typeof value === 'number') {
    return Number.isNaN(value) ? null : value;
  }
  return null;
};

const normalizeImplantPayload = (incoming = {}) => {
  const data = { ...incoming };

  data.companyId = toNullableInt(data.companyId);
  data.levelId = toNullableInt(data.levelId);
  data.countryId = toNullableInt(data.countryId);

  if (!data.status || !['Active', 'Inactive'].includes(data.status)) {
    data.status = 'Active';
  }

  ['image1', 'image2', 'image3'].forEach((key) => {
    if (data[key] === '' || data[key] === 'null') {
      data[key] = null;
    }
  });

  return data;
};

// GET all implants
router.get('/', async (req, res) => {
  try {
    const implants = await Implant.findAll({
      include: ['company', 'level', 'country'],
    });
    res.json(implants);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single implant
router.get('/:id', async (req, res) => {
  try {
    const implant = await Implant.findByPk(req.params.id, {
      include: ['company', 'level', 'country'],
    });
    if (!implant) return res.status(404).json({ error: 'Not found' });
    res.json(implant);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE implant with images
router.post('/', uploadImplantImages, async (req, res) => {
  try {
    console.log('📸 Creating implant');
    console.log('📝 Files:', req.files);
    console.log('📝 Body fields:', Object.keys(req.body));

    const bodyData = normalizeImplantPayload(req.body);

    // Process uploaded images - save paths instead of base64
    if (req.files) {
      if (req.files.image1 && req.files.image1[0]) {
        bodyData.image1 = `/uploads/implants/${req.files.image1[0].filename}`;
        console.log(`✅ image1 saved: ${bodyData.image1}`);
      }
      if (req.files.image2 && req.files.image2[0]) {
        bodyData.image2 = `/uploads/implants/${req.files.image2[0].filename}`;
        console.log(`✅ image2 saved: ${bodyData.image2}`);
      }
      if (req.files.image3 && req.files.image3[0]) {
        bodyData.image3 = `/uploads/implants/${req.files.image3[0].filename}`;
        console.log(`✅ image3 saved: ${bodyData.image3}`);
      }
    }

    console.log('💾 Creating implant with:', {
      name: bodyData.name,
      brand: bodyData.brand,
      companyId: bodyData.companyId,
      image1: bodyData.image1 || 'no',
      image2: bodyData.image2 || 'no',
      image3: bodyData.image3 || 'no'
    });

    const implant = await Implant.create(bodyData);
    const withRelations = await Implant.findByPk(implant.id, {
      include: ['company', 'level', 'country'],
    });
    console.log('✅ Implant created:', implant.id);
    res.status(201).json(withRelations || implant);
  } catch (err) {
    console.error('❌ Create error:', err.message);
    res.status(400).json({ error: err.message });
  }
});

// UPDATE implant with images
router.put('/:id', uploadImplantImages, async (req, res) => {
  try {
    console.log('📸 Updating implant', req.params.id);
    console.log('📝 Files:', req.files);
    console.log('📝 Body fields:', Object.keys(req.body));

    const implant = await Implant.findByPk(req.params.id);
    if (!implant) return res.status(404).json({ error: 'Not found' });

    const bodyData = normalizeImplantPayload(req.body);

    // Process uploaded images and delete old ones if replaced
    if (req.files) {
      if (req.files.image1 && req.files.image1[0]) {
        // Delete old image if exists
        if (implant.image1) {
          deleteImplantImages([implant.image1]);
        }
        bodyData.image1 = `/uploads/implants/${req.files.image1[0].filename}`;
        console.log(`✅ image1 updated: ${bodyData.image1}`);
      }
      if (req.files.image2 && req.files.image2[0]) {
        if (implant.image2) {
          deleteImplantImages([implant.image2]);
        }
        bodyData.image2 = `/uploads/implants/${req.files.image2[0].filename}`;
        console.log(`✅ image2 updated: ${bodyData.image2}`);
      }
      if (req.files.image3 && req.files.image3[0]) {
        if (implant.image3) {
          deleteImplantImages([implant.image3]);
        }
        bodyData.image3 = `/uploads/implants/${req.files.image3[0].filename}`;
        console.log(`✅ image3 updated: ${bodyData.image3}`);
      }
    }

    console.log('💾 Updating implant:', {
      id: implant.id,
      name: bodyData.name,
      image1: bodyData.image1 || 'unchanged',
      image2: bodyData.image2 || 'unchanged',
      image3: bodyData.image3 || 'unchanged'
    });

    await implant.update(bodyData);
    const withRelations = await Implant.findByPk(implant.id, {
      include: ['company', 'level', 'country'],
    });
    console.log('✅ Implant updated:', implant.id);
    res.json(withRelations || implant);
  } catch (err) {
    console.error('❌ Update error:', err.message);
    res.status(400).json({ error: err.message });
  }
});

// DELETE implant
router.delete('/:id', async (req, res) => {
  try {
    const implant = await Implant.findByPk(req.params.id);
    if (!implant) return res.status(404).json({ error: 'Not found' });
    
    // Delete associated images
    const imagesToDelete = [implant.image1, implant.image2, implant.image3].filter(Boolean);
    if (imagesToDelete.length > 0) {
      deleteImplantImages(imagesToDelete);
    }
    
    await implant.destroy();
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
