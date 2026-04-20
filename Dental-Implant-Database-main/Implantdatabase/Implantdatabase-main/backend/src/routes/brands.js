import express from 'express';
import Brand from '../models/brand.js';
import CompanyMaster from '../models/CompanyMaster.js';

const router = express.Router();

const normalizeStatus = (value) =>
  value === 'Inactive' ? 'Inactive' : 'Active';

const mapBrand = (row, company = null) => ({
  id: row.idbrand,
  idbrand: row.idbrand,
  name: row.brand_name,
  brand_name: row.brand_name,
  companyId: row.manufacturer_id,
  manufacturer_id: row.manufacturer_id,
  companyName: company?.company_name || null,
  website: row.website || '',
  status: row.status || 'Active',
  createdAt: row.created_at || null,
  updatedAt: row.updated_at || null,
});

router.get('/', async (req, res) => {
  try {
    const rows = await Brand.findAll({
      order: [['brand_name', 'ASC']],
    });

    const companyIds = rows
      .map((row) => row.manufacturer_id)
      .filter((id) => id !== null && id !== undefined);

    const companies = companyIds.length
      ? await CompanyMaster.findAll({
          where: { id: companyIds },
        })
      : [];

    const companyMap = new Map(
      companies.map((company) => [Number(company.id), company])
    );

    res.json(
      rows.map((row) =>
        mapBrand(row, companyMap.get(Number(row.manufacturer_id)) || null)
      )
    );
  } catch (err) {
    console.error('Error fetching brands:', err);
    res.status(500).json({ error: err.message || 'Failed to fetch brands' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const row = await Brand.findByPk(req.params.id);

    if (!row) {
      return res.status(404).json({ error: 'Brand not found' });
    }

    const company = row.manufacturer_id
      ? await CompanyMaster.findByPk(row.manufacturer_id)
      : null;

    res.json(mapBrand(row, company));
  } catch (err) {
    console.error('Error fetching brand:', err);
    res.status(500).json({ error: err.message || 'Failed to fetch brand' });
  }
});

router.post('/', async (req, res) => {
  try {
    const payload = {
      brand_name: (req.body?.brand_name || req.body?.name || '').trim(),
      manufacturer_id: req.body?.manufacturer_id ?? req.body?.companyId ?? null,
      website: req.body?.website?.trim?.() || null,
      status: normalizeStatus(req.body?.status),
    };

    if (!payload.brand_name) {
      return res.status(400).json({ error: 'brand_name is required' });
    }

    const existing = await Brand.findOne({
      where: { brand_name: payload.brand_name },
    });

    if (existing) {
      return res.status(409).json({ error: 'Brand already exists' });
    }

    const created = await Brand.create(payload);
    const company = created.manufacturer_id
      ? await CompanyMaster.findByPk(created.manufacturer_id)
      : null;

    res.status(201).json(mapBrand(created, company));
  } catch (err) {
    console.error('Error creating brand:', err);
    res.status(400).json({ error: err.message || 'Failed to create brand' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const row = await Brand.findByPk(req.params.id);

    if (!row) {
      return res.status(404).json({ error: 'Brand not found' });
    }

    const nextName =
      req.body?.brand_name !== undefined
        ? req.body.brand_name?.trim()
        : req.body?.name !== undefined
        ? req.body.name?.trim()
        : row.brand_name;

    if (!nextName) {
      return res.status(400).json({ error: 'brand_name is required' });
    }

    await row.update({
      brand_name: nextName,
      manufacturer_id:
        req.body?.manufacturer_id !== undefined
          ? req.body.manufacturer_id
          : req.body?.companyId !== undefined
          ? req.body.companyId
          : row.manufacturer_id,
      website:
        req.body?.website !== undefined
          ? req.body.website?.trim?.() || null
          : row.website,
      status: normalizeStatus(req.body?.status ?? row.status),
      updated_at: new Date(),
    });

    const company = row.manufacturer_id
      ? await CompanyMaster.findByPk(row.manufacturer_id)
      : null;

    res.json(mapBrand(row, company));
  } catch (err) {
    console.error('Error updating brand:', err);
    res.status(400).json({ error: err.message || 'Failed to update brand' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const row = await Brand.findByPk(req.params.id);

    if (!row) {
      return res.status(404).json({ error: 'Brand not found' });
    }

    await row.destroy();
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    console.error('Error deleting brand:', err);
    res.status(500).json({ error: err.message || 'Failed to delete brand' });
  }
});

export default router;