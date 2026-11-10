import express from 'express';
import { fileURLToPath } from 'node:url';

const adminManualPath = fileURLToPath(new URL('../../manuals/admin-manual.pdf', import.meta.url));

export function createManualRouter(verifyToken, { manualPath = adminManualPath } = {}) {
  const router = express.Router();
  router.get('/admin', verifyToken, (req, res, next) => {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    res.setHeader('Cache-Control', 'private, no-store');
    res.setHeader('Content-Disposition', 'inline; filename="admin-manual.pdf"');
    res.sendFile(manualPath, { cacheControl: false }, error => {
      if (!error) return;
      if (res.headersSent) return next(error);
      if (error.status === 404 || error.code === 'ENOENT') {
        return res.status(404).json({ error: 'Manual not found' });
      }
      return next(error);
    });
  });
  return router;
}
