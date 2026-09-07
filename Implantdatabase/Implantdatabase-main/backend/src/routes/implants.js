import express from 'express';
import {
  Implant,
  ImplantMaster,
  Brand,
  Company,
  Level,
  OfficialDistributor,
  RefConnectionType,
  RefConnectionShape,
  RefDriverShape,
  RefBodyShape,
  RefApexShape,
} from '../models/index.js';
import {
  uploadImplantImages,
  deleteImplantImages,
} from '../middleware/upload.js';

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

const normalizeStatus = (value) => {
  return value === 'Inactive' ? 'Inactive' : 'Active';
};

const normalizeImplantPayload = (incoming = {}) => {
  const data = { ...incoming };

  data.companyId = toNullableInt(data.companyId);
  data.levelId = toNullableInt(data.levelId);
  data.countryId = toNullableInt(data.countryId);
  data.status = normalizeStatus(data.status);

  [
    'name',
    'brand',
    'slug',
    'countryText',
    'website',
    'brandDescription',
    'connectionType',
    'connectionShape',
    'screwdriverShape',
    'headShape',
    'bodyShape',
    'apexShape',
    'officialDistributor',
  ].forEach((key) => {
    if (typeof data[key] === 'string') {
      data[key] = data[key].trim();
    }
  });

  ['image1', 'image2', 'image3'].forEach((key) => {
    if (data[key] === '' || data[key] === 'null') {
      data[key] = null;
    }
  });

  return data;
};

const toDisplayCompany = (row) =>
  row?.company
    ? {
        id: row.company.id,
        name: row.company.name,
      }
    : null;

const toDisplayLevel = (row) =>
  row?.level
    ? {
        id: row.level.id,
        name: row.level.name,
      }
    : null;

const mapMasterImplant = (row) => ({
  id: `master-${row.implant_id}`,
  masterId: row.implant_id,
  name: row.implant_name || '',
  brandId: row.brand_id || null,
  brand: row.brandInfo?.brand_name || '',
  slug:
    row.brandInfo?.brand_name && row.implant_name
      ? `${String(row.brandInfo.brand_name).trim().toLowerCase().replace(/\s+/g, '-')}-${String(row.implant_name).trim().toLowerCase().replace(/\s+/g, '-')}-${row.implant_id}`
      : `master-${row.implant_id}`,
  website: row.brandInfo?.website || null,
  brandDescription: row.brandInfo?.brand_name
    ? `${row.brandInfo.brand_name} implant system`
    : null,
  companyId: row.company_id || null,
  levelId: row.level_id || null,
  countryId: null,
  countryText: '',
  connectionType: row.connectionTypeInfo?.name || null,
  connectionShape: row.connectionShapeInfo?.name || null,
  screwdriverShape: row.driverShapeInfo?.name || null,
  headShape: null,
  bodyShape: row.bodyShapeInfo?.name || null,
  apexShape: row.apexShapeInfo?.name || null,
  officialDistributor: row.officialDistributorInfo?.name || null,
  status: row.status || 'Active',
  image1: row.image_url || null,
  image2: null,
  image3: null,
  createdAt: row.created_at || null,
  updatedAt: row.created_at || null,
  source: 'master',
  company: toDisplayCompany(row),
  level: toDisplayLevel(row),
  country: row.officialDistributorInfo?.country
    ? {
        id: row.officialDistributorInfo.country.id,
        name: row.officialDistributorInfo.country.name,
      }
    : null,
});

const mapCustomImplant = (row) => ({
  ...row.toJSON(),
  source: 'custom',
});

const sortByCreatedDesc = (a, b) => {
  const da = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
  const db = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
  return db - da;
};

// GET all implants
router.get('/', async (req, res) => {
  try {
    const [masterRows, customRows] = await Promise.all([
      ImplantMaster.findAll({
        include: [
          { model: Brand, as: 'brandInfo', attributes: ['idbrand', 'brand_name', 'website', 'status'], required: false },
          { model: Company, as: 'company', attributes: ['id', 'name'], required: false },
          { model: Level, as: 'level', attributes: ['id', 'name'], required: false },
          { model: RefConnectionType, as: 'connectionTypeInfo', attributes: ['id', 'name'], required: false },
          { model: RefConnectionShape, as: 'connectionShapeInfo', attributes: ['id', 'name'], required: false },
          { model: RefDriverShape, as: 'driverShapeInfo', attributes: ['id', 'name'], required: false },
          { model: RefBodyShape, as: 'bodyShapeInfo', attributes: ['id', 'name'], required: false },
          { model: RefApexShape, as: 'apexShapeInfo', attributes: ['id', 'name'], required: false },
          {
            model: OfficialDistributor,
            as: 'officialDistributorInfo',
            attributes: ['id', 'name', 'countryId'],
            required: false,
            include: [
              {
                association: 'country',
                attributes: ['id', 'name'],
                required: false,
              },
            ],
          },
        ],
        order: [['created_at', 'DESC']],
      }),
      Implant.findAll({
        include: ['company', 'level', 'country'],
        order: [['createdAt', 'DESC']],
      }),
    ]);

    const mappedMaster = masterRows.map(mapMasterImplant);
    const mappedCustom = customRows.map(mapCustomImplant);
    const merged = [...mappedCustom, ...mappedMaster].sort(sortByCreatedDesc);

    res.json(merged);
  } catch (err) {
    console.error('Error fetching merged implants:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET one implant
router.get('/:id', async (req, res) => {
  try {
    const rawId = String(req.params.id || '');

    if (rawId.startsWith('master-')) {
      const masterId = rawId.replace('master-', '');

      const masterItem = await ImplantMaster.findByPk(masterId, {
        include: [
          { model: Brand, as: 'brandInfo', attributes: ['idbrand', 'brand_name', 'website', 'status'], required: false },
          { model: Company, as: 'company', attributes: ['id', 'name'], required: false },
          { model: Level, as: 'level', attributes: ['id', 'name'], required: false },
          { model: RefConnectionType, as: 'connectionTypeInfo', attributes: ['id', 'name'], required: false },
          { model: RefConnectionShape, as: 'connectionShapeInfo', attributes: ['id', 'name'], required: false },
          { model: RefDriverShape, as: 'driverShapeInfo', attributes: ['id', 'name'], required: false },
          { model: RefBodyShape, as: 'bodyShapeInfo', attributes: ['id', 'name'], required: false },
          { model: RefApexShape, as: 'apexShapeInfo', attributes: ['id', 'name'], required: false },
          {
            model: OfficialDistributor,
            as: 'officialDistributorInfo',
            attributes: ['id', 'name', 'countryId'],
            required: false,
            include: [
              {
                association: 'country',
                attributes: ['id', 'name'],
                required: false,
              },
            ],
          },
        ],
      });

      if (!masterItem) {
        return res.status(404).json({ error: 'Not found' });
      }

      return res.json(mapMasterImplant(masterItem));
    }

    const implant = await Implant.findByPk(req.params.id, {
      include: ['company', 'level', 'country'],
    });

    if (!implant) {
      return res.status(404).json({ error: 'Not found' });
    }

    res.json(mapCustomImplant(implant));
  } catch (err) {
    console.error('Error fetching implant:', err);
    res.status(500).json({ error: err.message });
  }
});

// CREATE implant
router.post('/', uploadImplantImages, async (req, res) => {
  try {
    const bodyData = normalizeImplantPayload(req.body);

    if (req.files?.image1?.[0]) {
      bodyData.image1 = `/uploads/implants/${req.files.image1[0].filename}`;
    }

    if (req.files?.image2?.[0]) {
      bodyData.image2 = `/uploads/implants/${req.files.image2[0].filename}`;
    }

    if (req.files?.image3?.[0]) {
      bodyData.image3 = `/uploads/implants/${req.files.image3[0].filename}`;
    }

    const implant = await Implant.create(bodyData);

    const withRelations = await Implant.findByPk(implant.id, {
      include: ['company', 'level', 'country'],
    });

    return res.status(201).json(withRelations ? mapCustomImplant(withRelations) : implant);
  } catch (err) {
    console.error('Create implant error:', err);
    res.status(400).json({ error: err.message });
  }
});

// UPDATE implant
router.put('/:id', uploadImplantImages, async (req, res) => {
  try {
    const rawId = String(req.params.id || '');

    if (rawId.startsWith('master-')) {
      const masterId = rawId.replace('master-', '');
      const masterItem = await ImplantMaster.findByPk(masterId);

      if (!masterItem) {
        return res.status(404).json({ error: 'Not found' });
      }

      const nextName =
        req.body?.name !== undefined
          ? String(req.body.name || '').trim()
          : masterItem.implant_name;

      if (!nextName) {
        return res.status(400).json({ error: 'Implant name is required' });
      }

      const updateData = {
        implant_name: nextName,
        status: normalizeStatus(req.body?.status ?? masterItem.status),
      };

      if (req.body?.companyId !== undefined) updateData.company_id = toNullableInt(req.body.companyId);
      if (req.body?.levelId !== undefined) updateData.level_id = toNullableInt(req.body.levelId);
      if (req.body?.brandId !== undefined) updateData.brand_id = toNullableInt(req.body.brandId);

      if (req.files?.image1?.[0]) {
        if (masterItem.image_url) deleteImplantImages([masterItem.image_url]);
        updateData.image_url = `/uploads/implants/${req.files.image1[0].filename}`;
      }

      await masterItem.update(updateData);

      const refreshed = await ImplantMaster.findByPk(masterId, {
        include: [
          { model: Brand, as: 'brandInfo', attributes: ['idbrand', 'brand_name', 'website', 'status'], required: false },
          { model: Company, as: 'company', attributes: ['id', 'name'], required: false },
          { model: Level, as: 'level', attributes: ['id', 'name'], required: false },
          { model: RefConnectionType, as: 'connectionTypeInfo', attributes: ['id', 'name'], required: false },
          { model: RefConnectionShape, as: 'connectionShapeInfo', attributes: ['id', 'name'], required: false },
          { model: RefDriverShape, as: 'driverShapeInfo', attributes: ['id', 'name'], required: false },
          { model: RefBodyShape, as: 'bodyShapeInfo', attributes: ['id', 'name'], required: false },
          { model: RefApexShape, as: 'apexShapeInfo', attributes: ['id', 'name'], required: false },
          {
            model: OfficialDistributor,
            as: 'officialDistributorInfo',
            attributes: ['id', 'name', 'countryId'],
            required: false,
            include: [
              {
                association: 'country',
                attributes: ['id', 'name'],
                required: false,
              },
            ],
          },
        ],
      });

      return res.json(mapMasterImplant(refreshed));
    }

    const implant = await Implant.findByPk(req.params.id);

    if (!implant) {
      return res.status(404).json({ error: 'Not found' });
    }

    const bodyData = normalizeImplantPayload(req.body);

    if (req.files?.image1?.[0]) {
      if (implant.image1) deleteImplantImages([implant.image1]);
      bodyData.image1 = `/uploads/implants/${req.files.image1[0].filename}`;
    }

    if (req.files?.image2?.[0]) {
      if (implant.image2) deleteImplantImages([implant.image2]);
      bodyData.image2 = `/uploads/implants/${req.files.image2[0].filename}`;
    }

    if (req.files?.image3?.[0]) {
      if (implant.image3) deleteImplantImages([implant.image3]);
      bodyData.image3 = `/uploads/implants/${req.files.image3[0].filename}`;
    }

    await implant.update(bodyData);

    const withRelations = await Implant.findByPk(implant.id, {
      include: ['company', 'level', 'country'],
    });

    return res.json(withRelations ? mapCustomImplant(withRelations) : implant);
  } catch (err) {
    console.error('Update implant error:', err);
    res.status(400).json({ error: err.message });
  }
});

// DELETE implant
router.delete('/:id', async (req, res) => {
  try {
    const rawId = String(req.params.id || '');

    if (rawId.startsWith('master-')) {
      const masterId = rawId.replace('master-', '');
      const masterItem = await ImplantMaster.findByPk(masterId);

      if (!masterItem) {
        return res.status(404).json({ error: 'Not found' });
      }

      if (masterItem.image_url) {
        deleteImplantImages([masterItem.image_url]);
      }

      await masterItem.destroy();
      return res.json({ message: 'Deleted master implant' });
    }

    const implant = await Implant.findByPk(req.params.id);

    if (!implant) {
      return res.status(404).json({ error: 'Not found' });
    }

    const imagesToDelete = [implant.image1, implant.image2, implant.image3].filter(Boolean);
    if (imagesToDelete.length > 0) {
      deleteImplantImages(imagesToDelete);
    }

    await implant.destroy();

    return res.json({ message: 'Deleted custom implant' });
  } catch (err) {
    console.error('Delete implant error:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;