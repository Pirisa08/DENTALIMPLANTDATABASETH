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

router.get('/', async (req, res) => {
  try {
    const blogs = await Blog.findAll({
      where: { status: 'Active' },
      order: [
        ['publishedDate', 'DESC'],
        ['createdAt', 'DESC'],
      ],
    });

    res.json(blogs.map(serializeBlog));
  } catch (error) {
    console.error('GET /api/public/blogs failed:', error);
    res.status(500).json({
      error: 'Failed to fetch public blogs',
      details: error.message,
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const blog = await Blog.findOne({
      where: {
        id: req.params.id,
        status: 'Active',
      },
    });

    if (!blog) {
      return res.status(404).json({
        error: 'Blog not found',
      });
    }

    res.json(serializeBlog(blog));
  } catch (error) {
    console.error('GET /api/public/blogs/:id failed:', error);
    res.status(500).json({
      error: 'Failed to fetch blog',
      details: error.message,
    });
  }
});

export default router;