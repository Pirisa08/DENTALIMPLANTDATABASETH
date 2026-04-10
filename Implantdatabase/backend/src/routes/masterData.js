import express from 'express';
import { Country, Company, Level, OfficialDistributor, Blog } from '../models/index.js';
import blogSeeds from '../seeds/blogSeeds.js';

const router = express.Router();

// ===== SEED BLOGS (Public - for initial setup) =====
router.post('/seed-blogs', async (req, res) => {
  try {
    // Check if blogs already exist
    const count = await Blog.count();
    if (count > 0) {
      return res.json({ message: 'Blogs already exist', count });
    }

    // Create all seed blogs
    const created = await Blog.bulkCreate(blogSeeds);
    res.status(201).json({ message: 'Blogs seeded successfully', count: created.length, blogs: created });
  } catch (err) {
    res.status(400).json({ error: err.message });
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

router.post('/countries', async (req, res) => {
  try {
    const country = await Country.create(req.body);
    res.status(201).json(country);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/countries/:id', async (req, res) => {
  try {
    const country = await Country.findByPk(req.params.id);
    if (!country) return res.status(404).json({ error: 'Not found' });
    await country.update(req.body);
    res.json(country);
  } catch (err) {
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

router.post('/companies', async (req, res) => {
  try {
    const company = await Company.create(req.body);
    res.status(201).json(company);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/companies/:id', async (req, res) => {
  try {
    const company = await Company.findByPk(req.params.id);
    if (!company) return res.status(404).json({ error: 'Not found' });
    await company.update(req.body);
    res.json(company);
  } catch (err) {
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
    res.status(500).json({ error: err.message });
  }
});

// ===== LEVELS =====
router.get('/levels', async (req, res) => {
  try {
    const levels = await Level.findAll();
    res.json(levels);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/levels', async (req, res) => {
  try {
    const level = await Level.create(req.body);
    res.status(201).json(level);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/levels/:id', async (req, res) => {
  try {
    const level = await Level.findByPk(req.params.id);
    if (!level) return res.status(404).json({ error: 'Not found' });
    await level.update(req.body);
    res.json(level);
  } catch (err) {
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
