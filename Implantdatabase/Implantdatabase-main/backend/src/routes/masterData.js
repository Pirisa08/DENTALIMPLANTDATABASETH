import express from 'express';
import {
  Country,
  Level,
  OfficialDistributor,
  Blog,
  RefConnectionType,
  Company,
} from '../models/index.js';

import RefConnectionShape from '../models/RefConnectionShape.js';
import RefHeadShape from '../models/RefHeadShape.js';
import RefBodyShape from '../models/RefBodyShape.js';
import RefApexShape from '../models/RefApexShape.js';
import RefDriverShape from '../models/RefDriverShape.js';

const router = express.Router();

const normalizeStatus = (value) =>
  value === 'Inactive' ? 'Inactive' : 'Active';

const defaultBlogSeeds = [
  {
    title: 'Dental Implant Basics',
    description: 'Introduction to dental implant systems and components.',
    published_date: '2026-04-10',
    content:
      'Dental implants are used to replace missing teeth and provide long-term stability.',
    image_url: '/uploads/blogs/implant-basic.jpg',
    status: 'Active',
  },
  {
    title: 'Immediate Implant Placement',
    description: 'Clinical overview of immediate implant placement after extraction.',
    published_date: '2026-04-11',
    content:
      'Immediate implant placement can reduce treatment time and preserve bone architecture.',
    image_url: '/uploads/blogs/immediate-placement.jpg',
    status: 'Active',
  },
  {
    title: 'Implant Surface Technology',
    description: 'How implant surface treatment affects osseointegration.',
    published_date: '2026-04-12',
    content:
      'Modern surfaces such as SLA and RBM improve bone-to-implant contact.',
    image_url: '/uploads/blogs/surface-tech.jpg',
    status: 'Active',
  },
];

const mapCompany = (row) => ({
  id: row.id,
  name: row.name,
  countryCode: row.countryCode || null,
  status: row.status || 'Active',
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
});

const mapRefItem = (row) => ({
  id: row.id,
  name: row.name,
  status: row.status || 'Active',
});

// ===== connection types =====
router.get('/connection-types', async (req, res) => {
  try {
    const items = await RefConnectionType.findAll({
      order: [['name', 'ASC']],
    });
    res.json(items.map(mapRefItem));
  } catch (err) {
    console.error('GET /master-data/connection-types error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/connection-types', async (req, res) => {
  try {
    const name = req.body?.name?.trim();

    if (!name) {
      return res.status(400).json({ error: 'Connection type name is required' });
    }

    const existing = await RefConnectionType.findOne({ where: { name } });
    if (existing) {
      return res.status(409).json({ error: 'Connection type already exists' });
    }

    const item = await RefConnectionType.create({
      name,
      status: normalizeStatus(req.body?.status),
    });

    res.status(201).json(mapRefItem(item));
  } catch (err) {
    console.error('POST /master-data/connection-types error:', err);
    res.status(400).json({ error: err.message });
  }
});

router.put('/connection-types/:id', async (req, res) => {
  try {
    const item = await RefConnectionType.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });

    const nextName =
      req.body?.name !== undefined ? req.body.name?.trim() : item.name;

    if (!nextName) {
      return res.status(400).json({ error: 'Connection type name is required' });
    }

    await item.update({
      name: nextName,
      status: normalizeStatus(req.body?.status ?? item.status),
    });

    res.json(mapRefItem(item));
  } catch (err) {
    console.error('PUT /master-data/connection-types/:id error:', err);
    res.status(400).json({ error: err.message });
  }
});

router.delete('/connection-types/:id', async (req, res) => {
  try {
    const item = await RefConnectionType.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });

    await item.destroy();
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('DELETE /master-data/connection-types/:id error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ===== connection shapes =====
router.get('/connection-shapes', async (req, res) => {
  try {
    const items = await RefConnectionShape.findAll({
      order: [['name', 'ASC']],
    });
    res.json(items.map(mapRefItem));
  } catch (err) {
    console.error('GET /master-data/connection-shapes error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/connection-shapes', async (req, res) => {
  try {
    const name = req.body?.name?.trim();

    if (!name) {
      return res.status(400).json({ error: 'Connection shape name is required' });
    }

    const existing = await RefConnectionShape.findOne({ where: { name } });
    if (existing) {
      return res.status(409).json({ error: 'Connection shape already exists' });
    }

    const item = await RefConnectionShape.create({
      name,
      status: normalizeStatus(req.body?.status),
    });

    res.status(201).json(mapRefItem(item));
  } catch (err) {
    console.error('POST /master-data/connection-shapes error:', err);
    res.status(400).json({ error: err.message });
  }
});

router.put('/connection-shapes/:id', async (req, res) => {
  try {
    const item = await RefConnectionShape.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });

    const nextName =
      req.body?.name !== undefined ? req.body.name?.trim() : item.name;

    if (!nextName) {
      return res.status(400).json({ error: 'Connection shape name is required' });
    }

    const duplicate = await RefConnectionShape.findOne({
      where: { name: nextName },
    });

    if (duplicate && Number(duplicate.id) !== Number(item.id)) {
      return res.status(409).json({ error: 'Connection shape already exists' });
    }

    await item.update({
      name: nextName,
      status: normalizeStatus(req.body?.status ?? item.status),
    });

    res.json(mapRefItem(item));
  } catch (err) {
    console.error('PUT /master-data/connection-shapes/:id error:', err);
    res.status(400).json({ error: err.message });
  }
});

router.delete('/connection-shapes/:id', async (req, res) => {
  try {
    const item = await RefConnectionShape.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });

    await item.destroy();
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('DELETE /master-data/connection-shapes/:id error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ===== head shapes =====
router.get('/head-shapes', async (req, res) => {
  try {
    const items = await RefHeadShape.findAll({ order: [['name', 'ASC']] });
    res.json(items.map(mapRefItem));
  } catch (err) {
    console.error('GET /master-data/head-shapes error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/head-shapes', async (req, res) => {
  try {
    const name = req.body?.name?.trim();
    if (!name) {
      return res.status(400).json({ error: 'Head shape name is required' });
    }

    const existing = await RefHeadShape.findOne({ where: { name } });
    if (existing) {
      return res.status(409).json({ error: 'Head shape already exists' });
    }

    const item = await RefHeadShape.create({
      name,
      status: normalizeStatus(req.body?.status),
    });

    res.status(201).json(mapRefItem(item));
  } catch (err) {
    console.error('POST /master-data/head-shapes error:', err);
    res.status(400).json({ error: err.message });
  }
});

router.put('/head-shapes/:id', async (req, res) => {
  try {
    const item = await RefHeadShape.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });

    const nextName =
      req.body?.name !== undefined ? req.body.name?.trim() : item.name;

    if (!nextName) {
      return res.status(400).json({ error: 'Head shape name is required' });
    }

    const duplicate = await RefHeadShape.findOne({ where: { name: nextName } });
    if (duplicate && Number(duplicate.id) !== Number(item.id)) {
      return res.status(409).json({ error: 'Head shape already exists' });
    }

    await item.update({
      name: nextName,
      status: normalizeStatus(req.body?.status ?? item.status),
    });

    res.json(mapRefItem(item));
  } catch (err) {
    console.error('PUT /master-data/head-shapes/:id error:', err);
    res.status(400).json({ error: err.message });
  }
});

router.delete('/head-shapes/:id', async (req, res) => {
  try {
    const item = await RefHeadShape.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });

    await item.destroy();
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('DELETE /master-data/head-shapes/:id error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ===== body shapes =====
router.get('/body-shapes', async (req, res) => {
  try {
    const items = await RefBodyShape.findAll({ order: [['name', 'ASC']] });
    res.json(items.map(mapRefItem));
  } catch (err) {
    console.error('GET /master-data/body-shapes error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/body-shapes', async (req, res) => {
  try {
    const name = req.body?.name?.trim();
    if (!name) {
      return res.status(400).json({ error: 'Body shape name is required' });
    }

    const existing = await RefBodyShape.findOne({ where: { name } });
    if (existing) {
      return res.status(409).json({ error: 'Body shape already exists' });
    }

    const item = await RefBodyShape.create({
      name,
      status: normalizeStatus(req.body?.status),
    });

    res.status(201).json(mapRefItem(item));
  } catch (err) {
    console.error('POST /master-data/body-shapes error:', err);
    res.status(400).json({ error: err.message });
  }
});

router.put('/body-shapes/:id', async (req, res) => {
  try {
    const item = await RefBodyShape.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });

    const nextName =
      req.body?.name !== undefined ? req.body.name?.trim() : item.name;

    if (!nextName) {
      return res.status(400).json({ error: 'Body shape name is required' });
    }

    const duplicate = await RefBodyShape.findOne({ where: { name: nextName } });
    if (duplicate && Number(duplicate.id) !== Number(item.id)) {
      return res.status(409).json({ error: 'Body shape already exists' });
    }

    await item.update({
      name: nextName,
      status: normalizeStatus(req.body?.status ?? item.status),
    });

    res.json(mapRefItem(item));
  } catch (err) {
    console.error('PUT /master-data/body-shapes/:id error:', err);
    res.status(400).json({ error: err.message });
  }
});

router.delete('/body-shapes/:id', async (req, res) => {
  try {
    const item = await RefBodyShape.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });

    await item.destroy();
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('DELETE /master-data/body-shapes/:id error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ===== apex shapes =====
router.get('/apex-shapes', async (req, res) => {
  try {
    const items = await RefApexShape.findAll({ order: [['name', 'ASC']] });
    res.json(items.map(mapRefItem));
  } catch (err) {
    console.error('GET /master-data/apex-shapes error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/apex-shapes', async (req, res) => {
  try {
    const name = req.body?.name?.trim();
    if (!name) {
      return res.status(400).json({ error: 'Apex shape name is required' });
    }

    const existing = await RefApexShape.findOne({ where: { name } });
    if (existing) {
      return res.status(409).json({ error: 'Apex shape already exists' });
    }

    const item = await RefApexShape.create({
      name,
      status: normalizeStatus(req.body?.status),
    });

    res.status(201).json(mapRefItem(item));
  } catch (err) {
    console.error('POST /master-data/apex-shapes error:', err);
    res.status(400).json({ error: err.message });
  }
});

router.put('/apex-shapes/:id', async (req, res) => {
  try {
    const item = await RefApexShape.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });

    const nextName =
      req.body?.name !== undefined ? req.body.name?.trim() : item.name;

    if (!nextName) {
      return res.status(400).json({ error: 'Apex shape name is required' });
    }

    const duplicate = await RefApexShape.findOne({ where: { name: nextName } });
    if (duplicate && Number(duplicate.id) !== Number(item.id)) {
      return res.status(409).json({ error: 'Apex shape already exists' });
    }

    await item.update({
      name: nextName,
      status: normalizeStatus(req.body?.status ?? item.status),
    });

    res.json(mapRefItem(item));
  } catch (err) {
    console.error('PUT /master-data/apex-shapes/:id error:', err);
    res.status(400).json({ error: err.message });
  }
});

router.delete('/apex-shapes/:id', async (req, res) => {
  try {
    const item = await RefApexShape.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });

    await item.destroy();
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('DELETE /master-data/apex-shapes/:id error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ===== screwdriver shapes =====
router.get('/screwdriver-shapes', async (req, res) => {
  try {
    const items = await RefDriverShape.findAll({ order: [['name', 'ASC']] });
    res.json(items.map(mapRefItem));
  } catch (err) {
    console.error('GET /master-data/screwdriver-shapes error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/screwdriver-shapes', async (req, res) => {
  try {
    const name = req.body?.name?.trim();
    if (!name) {
      return res.status(400).json({ error: 'Screwdriver shape name is required' });
    }

    const existing = await RefDriverShape.findOne({ where: { name } });
    if (existing) {
      return res.status(409).json({ error: 'Screwdriver shape already exists' });
    }

    const item = await RefDriverShape.create({
      name,
      status: normalizeStatus(req.body?.status),
    });

    res.status(201).json(mapRefItem(item));
  } catch (err) {
    console.error('POST /master-data/screwdriver-shapes error:', err);
    res.status(400).json({ error: err.message });
  }
});

router.put('/screwdriver-shapes/:id', async (req, res) => {
  try {
    const item = await RefDriverShape.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });

    const nextName =
      req.body?.name !== undefined ? req.body.name?.trim() : item.name;

    if (!nextName) {
      return res.status(400).json({ error: 'Screwdriver shape name is required' });
    }

    const duplicate = await RefDriverShape.findOne({ where: { name: nextName } });
    if (duplicate && Number(duplicate.id) !== Number(item.id)) {
      return res.status(409).json({ error: 'Screwdriver shape already exists' });
    }

    await item.update({
      name: nextName,
      status: normalizeStatus(req.body?.status ?? item.status),
    });

    res.json(mapRefItem(item));
  } catch (err) {
    console.error('PUT /master-data/screwdriver-shapes/:id error:', err);
    res.status(400).json({ error: err.message });
  }
});

router.delete('/screwdriver-shapes/:id', async (req, res) => {
  try {
    const item = await RefDriverShape.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });

    await item.destroy();
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('DELETE /master-data/screwdriver-shapes/:id error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ===== companies =====
// IMPORTANT: use Company model / companies table, not CompanyMaster
router.get('/companies', async (req, res) => {
  try {
    const companies = await Company.findAll({
      order: [['name', 'ASC']],
    });
    res.json(companies.map(mapCompany));
  } catch (err) {
    console.error('GET /master-data/companies error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/companies/:id', async (req, res) => {
  try {
    const company = await Company.findByPk(req.params.id);
    if (!company) return res.status(404).json({ error: 'Not found' });

    res.json(mapCompany(company));
  } catch (err) {
    console.error('GET /master-data/companies/:id error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/companies', async (req, res) => {
  try {
    const name = req.body?.name?.trim();
    const countryCode = req.body?.countryCode?.trim?.() || null;
    const status = normalizeStatus(req.body?.status);

    if (!name) {
      return res.status(400).json({ error: 'Company name is required' });
    }

    const existing = await Company.findOne({
      where: { name },
    });

    if (existing) {
      return res.status(409).json({ error: 'Company already exists' });
    }

    const company = await Company.create({
      name,
      countryCode,
      status,
    });

    res.status(201).json(mapCompany(company));
  } catch (err) {
    console.error('POST /master-data/companies error:', err);
    res.status(400).json({ error: err.message });
  }
});

router.put('/companies/:id', async (req, res) => {
  try {
    const company = await Company.findByPk(req.params.id);
    if (!company) return res.status(404).json({ error: 'Not found' });

    const nextName =
      req.body?.name !== undefined ? req.body.name?.trim() : company.name;

    if (!nextName) {
      return res.status(400).json({ error: 'Company name is required' });
    }

    await company.update({
      name: nextName,
      countryCode:
        req.body?.countryCode !== undefined
          ? req.body.countryCode?.trim?.() || null
          : company.countryCode,
      status: normalizeStatus(req.body?.status ?? company.status),
    });

    res.json(mapCompany(company));
  } catch (err) {
    console.error('PUT /master-data/companies/:id error:', err);
    res.status(400).json({ error: err.message });
  }
});

router.delete('/companies/:id', async (req, res) => {
  try {
    const company = await Company.findByPk(req.params.id);
    if (!company) return res.status(404).json({ error: 'Not found' });

    await company.destroy();
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('DELETE /master-data/companies/:id error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ===== levels =====
router.get('/levels', async (req, res) => {
  try {
    const levels = await Level.findAll({ order: [['name', 'ASC']] });
    res.json(levels);
  } catch (err) {
    console.error('GET /master-data/levels error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/levels', async (req, res) => {
  try {
    const name = req.body?.name?.trim();
    if (!name) {
      return res.status(400).json({ error: 'Level name is required' });
    }

    const existing = await Level.findOne({ where: { name } });
    if (existing) {
      return res.status(409).json({ error: 'Level already exists' });
    }

    const level = await Level.create({
      name,
      status: normalizeStatus(req.body?.status),
    });

    res.status(201).json(level);
  } catch (err) {
    console.error('POST /master-data/levels error:', err);
    res.status(400).json({ error: err.message });
  }
});

router.put('/levels/:id', async (req, res) => {
  try {
    const level = await Level.findByPk(req.params.id);
    if (!level) return res.status(404).json({ error: 'Not found' });

    const nextName =
      req.body?.name !== undefined ? req.body.name?.trim() : level.name;

    if (!nextName) {
      return res.status(400).json({ error: 'Level name is required' });
    }

    await level.update({
      name: nextName,
      status: normalizeStatus(req.body?.status ?? level.status),
    });

    res.json(level);
  } catch (err) {
    console.error('PUT /master-data/levels/:id error:', err);
    res.status(400).json({ error: err.message });
  }
});

router.delete('/levels/:id', async (req, res) => {
  try {
    const level = await Level.findByPk(req.params.id);
    if (!level) return res.status(404).json({ error: 'Not found' });

    await level.destroy();
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('DELETE /master-data/levels/:id error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ===== countries =====
router.get('/countries', async (req, res) => {
  try {
    const countries = await Country.findAll({
      order: [['name', 'ASC']],
    });
    res.json(countries);
  } catch (err) {
    console.error('GET /master-data/countries error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/countries', async (req, res) => {
  try {
    const name = req.body?.name?.trim();

    if (!name) {
      return res.status(400).json({ error: 'Country name is required' });
    }

    const existing = await Country.findOne({ where: { name } });
    if (existing) {
      return res.status(409).json({ error: 'Country already exists' });
    }

    const country = await Country.create({
      name,
      status: normalizeStatus(req.body?.status),
    });

    res.status(201).json(country);
  } catch (err) {
    console.error('POST /master-data/countries error:', err);
    res.status(400).json({ error: err.message });
  }
});

router.put('/countries/:id', async (req, res) => {
  try {
    const country = await Country.findByPk(req.params.id);
    if (!country) return res.status(404).json({ error: 'Not found' });

    const nextName =
      req.body?.name !== undefined ? req.body.name?.trim() : country.name;

    if (!nextName) {
      return res.status(400).json({ error: 'Country name is required' });
    }

    await country.update({
      name: nextName,
      status: normalizeStatus(req.body?.status ?? country.status),
    });

    res.json(country);
  } catch (err) {
    console.error('PUT /master-data/countries/:id error:', err);
    res.status(400).json({ error: err.message });
  }
});

router.delete('/countries/:id', async (req, res) => {
  try {
    const country = await Country.findByPk(req.params.id);
    if (!country) return res.status(404).json({ error: 'Not found' });

    await country.destroy();
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('DELETE /master-data/countries/:id error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ===== distributors =====
const normalizeCountryName = (value = "") => {
  const raw = String(value || "").trim().toLowerCase();

  if (!raw) return "";

  if (
    raw === "korea" ||
    raw === "south korea" ||
    raw.includes("republic of korea")
  ) {
    return "South Korea";
  }

  if (
    raw === "usa" ||
    raw === "u.s.a." ||
    raw.includes("united states")
  ) {
    return "USA";
  }

  if (raw.includes("switzerland")) return "Switzerland";
  if (raw.includes("germany")) return "Germany";
  if (raw.includes("japan")) return "Japan";
  if (raw.includes("france")) return "France";
  if (raw.includes("italy")) return "Italy";
  if (raw.includes("brazil")) return "Brazil";
  if (raw.includes("israel")) return "Israel";
  if (raw.includes("sweden")) return "Sweden";

  return String(value || "").trim();
};

const mapDistributor = (row) => ({
  id: row.id,
  name: row.name,
  countryId: row.countryId,
  countryName: row.country?.name || "",
  status: row.status || "Active",
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
});

const resolveCountryId = async (payload = {}) => {
  if (
    payload.countryId !== undefined &&
    payload.countryId !== null &&
    String(payload.countryId).trim() !== ""
  ) {
    return Number(payload.countryId);
  }

  const incomingCountryName =
    payload.countryName ||
    payload.country ||
    payload.countryText ||
    "";

  const normalizedName = normalizeCountryName(incomingCountryName);

  if (!normalizedName) return null;

  const countries = await Country.findAll();
  const existing = countries.find(
    (item) => normalizeCountryName(item.name) === normalizedName
  );

  if (existing) {
    if (existing.status !== "Active") {
      await existing.update({ status: "Active" });
    }
    return Number(existing.id);
  }

  const created = await Country.create({
    name: normalizedName,
    status: "Active",
  });

  return Number(created.id);
};

router.get('/distributors', async (req, res) => {
  try {
    const distributors = await OfficialDistributor.findAll({
      include: [{ model: Country, as: 'country' }],
      order: [['name', 'ASC']],
    });

    res.json(distributors.map(mapDistributor));
  } catch (err) {
    console.error('GET /master-data/distributors error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/distributors/:id', async (req, res) => {
  try {
    const distributor = await OfficialDistributor.findByPk(req.params.id, {
      include: [{ model: Country, as: 'country' }],
    });

    if (!distributor) {
      return res.status(404).json({ error: 'Not found' });
    }

    res.json(mapDistributor(distributor));
  } catch (err) {
    console.error('GET /master-data/distributors/:id error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/distributors', async (req, res) => {
  try {
    const name = req.body?.name?.trim();

    if (!name) {
      return res.status(400).json({ error: 'Distributor name is required' });
    }

    const countryId = await resolveCountryId(req.body);

    if (!countryId) {
      return res.status(400).json({ error: 'Country is required' });
    }

    const duplicate = await OfficialDistributor.findOne({
      where: {
        name,
        countryId,
      },
    });

    if (duplicate) {
      return res
        .status(409)
        .json({ error: 'Distributor already exists in this country' });
    }

    const distributor = await OfficialDistributor.create({
      name,
      countryId,
      status: normalizeStatus(req.body?.status),
    });

    const withCountry = await OfficialDistributor.findByPk(distributor.id, {
      include: [{ model: Country, as: 'country' }],
    });

    res.status(201).json(mapDistributor(withCountry || distributor));
  } catch (err) {
    console.error('POST /master-data/distributors error:', err);
    res.status(400).json({ error: err.message });
  }
});

router.put('/distributors/:id', async (req, res) => {
  try {
    const distributor = await OfficialDistributor.findByPk(req.params.id, {
      include: [{ model: Country, as: 'country' }],
    });

    if (!distributor) {
      return res.status(404).json({ error: 'Not found' });
    }

    const nextName =
      req.body?.name !== undefined ? req.body.name?.trim() : distributor.name;

    if (!nextName) {
      return res.status(400).json({ error: 'Distributor name is required' });
    }

    const nextCountryId = await resolveCountryId({
      ...req.body,
      countryId:
        req.body?.countryId !== undefined
          ? req.body.countryId
          : distributor.countryId,
      countryName:
        req.body?.countryName !== undefined
          ? req.body.countryName
          : distributor.country?.name || "",
    });

    if (!nextCountryId) {
      return res.status(400).json({ error: 'Country is required' });
    }

    const duplicate = await OfficialDistributor.findOne({
      where: {
        name: nextName,
        countryId: nextCountryId,
      },
    });

    if (duplicate && Number(duplicate.id) !== Number(distributor.id)) {
      return res
        .status(409)
        .json({ error: 'Distributor already exists in this country' });
    }

    await distributor.update({
      name: nextName,
      countryId: nextCountryId,
      status: normalizeStatus(req.body?.status ?? distributor.status),
    });

    const withCountry = await OfficialDistributor.findByPk(distributor.id, {
      include: [{ model: Country, as: 'country' }],
    });

    res.json(mapDistributor(withCountry || distributor));
  } catch (err) {
    console.error('PUT /master-data/distributors/:id error:', err);
    res.status(400).json({ error: err.message });
  }
});

router.delete('/distributors/:id', async (req, res) => {
  try {
    const distributor = await OfficialDistributor.findByPk(req.params.id);

    if (!distributor) {
      return res.status(404).json({ error: 'Not found' });
    }

    await distributor.destroy();
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('DELETE /master-data/distributors/:id error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ===== seed blogs =====
router.post('/seed-blogs', async (req, res) => {
  try {
    const count = await Blog.count();
    if (count > 0) {
      return res.json({ message: 'Blogs already exist', count });
    }

    const created = await Blog.bulkCreate(defaultBlogSeeds);
    res.status(201).json({
      message: 'Blogs seeded successfully',
      count: created.length,
      blogs: created,
    });
  } catch (err) {
    console.error('POST /master-data/seed-blogs failed:', err);
    res.status(400).json({ error: err.message });
  }
});

export default router;