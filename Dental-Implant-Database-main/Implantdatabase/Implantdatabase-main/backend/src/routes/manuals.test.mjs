import assert from 'node:assert/strict';
import { test } from 'node:test';
import express from 'express';
import { fileURLToPath } from 'node:url';
import { createManualRouter } from './manuals.js';

// Substitute only database-backed authentication; exercise real routing and file delivery.
const authenticate = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) return res.status(401).end();
  req.user = { role: token === 'Bearer admin' ? 'admin' : 'user' };
  next();
};

async function withServer(run, options) {
  const app = express();
  app.use('/api/manuals', createManualRouter(authenticate, options));
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  try {
    await run(`http://127.0.0.1:${server.address().port}/api/manuals/admin`);
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
}

test('admin manual denies unauthenticated and non-admin requests', async () => {
  await withServer(async url => {
    assert.equal((await fetch(url)).status, 401);
    assert.equal((await fetch(url, { headers: { Authorization: 'Bearer user' } })).status, 403);
  });
});

test('admin receives a PDF with private caching and range support', async () => {
  await withServer(async url => {
    const headers = { Authorization: 'Bearer admin' };
    const response = await fetch(url, { headers });
    assert.equal(response.status, 200);
    assert.match(response.headers.get('content-type'), /application\/pdf/);
    assert.match(response.headers.get('cache-control'), /no-store/);
    assert.match(response.headers.get('content-disposition'), /inline/);
    assert.equal(Buffer.from(await response.arrayBuffer()).subarray(0, 5).toString(), '%PDF-');
    const range = await fetch(url, { headers: { ...headers, Range: 'bytes=0-4' } });
    assert.equal(range.status, 206);
    assert.equal(await range.text(), '%PDF-');
  });
});

test('missing manual returns a useful 404 without exposing filesystem paths', async () => {
  await withServer(async url => {
    const response = await fetch(url, { headers: { Authorization: 'Bearer admin' } });
    assert.equal(response.status, 404);
    assert.deepEqual(await response.json(), { error: 'Manual not found' });
  }, { manualPath: fileURLToPath(new URL('../../manuals/missing-manual.pdf', import.meta.url)) });
});
