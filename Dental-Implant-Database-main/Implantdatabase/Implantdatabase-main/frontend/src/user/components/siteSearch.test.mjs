import test from 'node:test';
import assert from 'node:assert/strict';
import { searchSite } from './siteSearch.js';

const data = {
  companies: [{ id: 3, name: 'CAMLOG Biotechnologies AG', status: 'Active' }],
  brands: [{ id: 9, name: 'CAMLOG', companyName: 'CAMLOG Biotechnologies AG', status: 'Active' }],
  blogs: [
    { id: 7, title: 'CAMLOG news', description: 'New implant systems', status: 'Active' },
    { id: 8, title: 'CAMLOG draft', status: 'Inactive' },
  ],
  implants: [{ id: 1, name: 'CAMLOG Screw Line', slug: 'camlog-screw-line', status: 'Active' }],
};

test('search finds companies, brands, blogs, and implants together', () => {
  const groups = searchSite(data, ' camlog ');
  assert.deepEqual(groups.map(g => [g.label, g.items.length]), [
    ['Companies', 1], ['Brands', 1], ['Blog', 1], ['Implants', 1],
  ]);
});

test('results link to their own details, including company mode and blog slug', () => {
  const groups = searchSite(data, 'camlog');
  assert.equal(groups[0].items[0].to, '/implants/brand/CAMLOG%20Biotechnologies%20AG?company=CAMLOG%20Biotechnologies%20AG');
  assert.equal(groups[1].items[0].to, '/implants/brand/CAMLOG');
  assert.equal(groups[2].items[0].to, '/blog/camlog-news-7');
  assert.equal(groups[3].items[0].to, '/implants/camlog-screw-line');
});

test('blog search includes description and excludes unpublished posts', () => {
  assert.equal(searchSite(data, 'new implant')[2].items[0].title, 'CAMLOG news');
  assert.equal(searchSite(data, 'draft').flatMap(g => g.items).length, 0);
});

test('blank and unmatched queries return no results', () => {
  assert.equal(searchSite(data, ' ').flatMap(g => g.items).length, 0);
  assert.equal(searchSite(data, 'unknown').flatMap(g => g.items).length, 0);
});
