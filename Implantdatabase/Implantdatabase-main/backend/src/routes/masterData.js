
import express from 'express';
import { Country, Company, Level, OfficialDistributor, Blog } from '../models/index.js';
import RefConnectionType from '../models/RefConnectionType.js';
import RefConnectionShape from '../models/RefConnectionShape.js';
import RefHeadShape from '../models/RefHeadShape.js';
import RefBodyShape from '../models/RefBodyShape.js';
import RefApexShape from '../models/RefApexShape.js';
import RefDriverShape from '../models/RefDriverShape.js';
import blogSeeds from '../seeds/blogSeeds.js';

const router = express.Router();

// ===== CONNECTION TYPES =====
router.get('/connection-types', async (req, res) => {
  try {
    const items = await RefConnectionType.findAll();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== CONNECTION SHAPES =====
router.get('/connection-shapes', async (req, res) => {
  try {
    const items = await RefConnectionShape.findAll();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== HEAD SHAPES =====
router.get('/head-shapes', async (req, res) => {
  try {
    const items = await RefHeadShape.findAll();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== BODY SHAPES =====
router.get('/body-shapes', async (req, res) => {
  try {
    const items = await RefBodyShape.findAll();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== APEX SHAPES =====
router.get('/apex-shapes', async (req, res) => {
  try {
    const items = await RefApexShape.findAll();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== SCREWDRIVER SHAPES =====
router.get('/screwdriver-shapes', async (req, res) => {
  try {
    const items = await RefDriverShape.findAll();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== COMPANIES =====
router.get('/companies', async (req, res) => {
  try {
    const companies = await Company.findAll();
    res.json(companies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== COUNTRIES =====
router.get('/countries', async (req, res) => {
  try {
    const countries = await Country.findAll();
    res.json(countries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== SEED BLOGS (Public - for initial setup) =====
router.post('/seed-blogs', async (req, res) => {
  try {
    const count = await Blog.count();
    if (count > 0) {
      return res.json({ message: 'Blogs already exist', count });
    }
    const created = await Blog.bulkCreate(blogSeeds);
    res.status(201).json({ message: 'Blogs seeded successfully', count: created.length, blogs: created });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ===== OFFICIAL DISTRIBUTORS =====
router.get('/distributors', async (req, res) => {
  try {
    const distributors = await OfficialDistributor.findAll({
      include: ['country'],
    });
    res.json(distributors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== DELETE DISTRIBUTOR =====
router.delete('/distributors/:id', async (req, res) => {
  try {
    const distributor = await OfficialDistributor.findByPk(req.params.id);
    if (!distributor) return res.status(404).json({ error: 'Not found' });
    await distributor.destroy();
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// ===== COMPANIES =====

router.get('/companies', async (req, res) => {
  try {
    const companies = await Company.findAll();
    res.json(companies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/levels/:id', async (req, res) => {
  try {
    const level = await Level.findByPk(req.params.id);
    if (!level) return res.status(404).json({ error: 'Not found' });
    await level.destroy();
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== OFFICIAL DISTRIBUTORS =====
router.get('/distributors', async (req, res) => {
  try {
    const distributors = await OfficialDistributor.findAll({
      include: ['country'],
    });
    res.json(distributors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/distributors', async (req, res) => {
  try {
    const distributor = await OfficialDistributor.create(req.body);
    res.status(201).json(distributor);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/distributors/:id', async (req, res) => {
  try {
    const distributor = await OfficialDistributor.findByPk(req.params.id);
    if (!distributor) return res.status(404).json({ error: 'Not found' });
    await distributor.update(req.body);
    res.json(distributor);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/distributors/:id', async (req, res) => {
  try {
    const distributor = await OfficialDistributor.findByPk(req.params.id);
    if (!distributor) return res.status(404).json({ error: 'Not found' });
    await distributor.destroy();
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
