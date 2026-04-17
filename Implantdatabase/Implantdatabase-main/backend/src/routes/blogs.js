import express from 'express';
import { Blog } from '../models/index.js';

const router = express.Router();

const serializeBlog = (row) => {
  if (!row) return null;

  const plain = typeof row.get === 'function' ? row.get({ plain: true }) : row;

  return {
    id: plain.id ?? null,
    title: plain.title ?? '',
    description: plain.description ?? '',
    content: plain.content ?? '',
    category: plain.category ?? '',
    author: plain.author ?? '',
    publishedDate: plain.publishedDate ?? null,
    readTime: plain.readTime ?? '',
    ctaLabel: plain.ctaLabel ?? '',
    ctaUrl: plain.ctaUrl ?? '',
    manualUrl: plain.manualUrl ?? '',
    referenceUrl: plain.referenceUrl ?? '',
    image: plain.image ?? '',
    imageDataUrl: plain.imageDataUrl ?? '',
    status: plain.status ?? 'Active',
    createdAt: plain.createdAt ?? null,
    updatedAt: plain.updatedAt ?? null,
  };
};

const normalizeDate = (value) => {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};

const buildPayload = (body = {}) => {
  return {
    title: String(body.title ?? '').trim(),
    description: body.description ?? '',
    content: body.content ?? '',
    category: String(body.category ?? '').trim(),
    author: String(body.author ?? '').trim(),
    publishedDate: normalizeDate(body.publishedDate),
    readTime: String(body.readTime ?? '').trim(),
    ctaLabel: String(body.ctaLabel ?? '').trim(),
    ctaUrl: String(body.ctaUrl ?? '').trim(),
    manualUrl: String(body.manualUrl ?? '').trim(),
    referenceUrl: String(body.referenceUrl ?? '').trim(),
    image: body.image ?? body.imageDataUrl ?? '',
    imageDataUrl: body.imageDataUrl ?? body.image ?? '',
    status:
      body.status === 'Inactive' || body.status === 'Active'
        ? body.status
        : 'Active',
  };
};

router.get('/', async (req, res) => {
  try {
    const blogs = await Blog.findAll({
      order: [
        ['publishedDate', 'DESC'],
        ['createdAt', 'DESC'],
      ],
    });

    res.json(blogs.map(serializeBlog));
  } catch (err) {
    console.error('GET /api/blogs failed:', err);
    res.status(500).json({ error: err.message || 'Failed to fetch blogs' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const blog = await Blog.findByPk(req.params.id);

    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    res.json(serializeBlog(blog));
  } catch (err) {
    console.error('GET /api/blogs/:id failed:', err);
    res.status(500).json({ error: err.message || 'Failed to fetch blog' });
  }
});

router.post('/', async (req, res) => {
  try {
    const payload = buildPayload(req.body);

    if (!payload.title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const blog = await Blog.create(payload);
    res.status(201).json(serializeBlog(blog));
  } catch (err) {
    console.error('POST /api/blogs failed:', err);
    res.status(400).json({ error: err.message || 'Failed to create blog' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const blog = await Blog.findByPk(req.params.id);

    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    const payload = buildPayload(req.body);

    if (!payload.title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    await blog.update(payload);
    res.json(serializeBlog(blog));
  } catch (err) {
    console.error('PUT /api/blogs/:id failed:', err);
    res.status(400).json({ error: err.message || 'Failed to update blog' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const blog = await Blog.findByPk(req.params.id);

    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    await blog.destroy();
    res.json({ message: 'Blog deleted successfully' });
  } catch (err) {
    console.error('DELETE /api/blogs/:id failed:', err);
    res.status(500).json({ error: err.message || 'Failed to delete blog' });
  }
});

export default router;