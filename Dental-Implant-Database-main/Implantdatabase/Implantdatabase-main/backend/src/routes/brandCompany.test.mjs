import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveBrandCompany } from './brandCompany.js';

const companies = [
  { id: 3, name: 'CAMLOG Biotechnologies AG' },
  { id: 4, name: 'Neobiotech Co., Ltd.' },
  { id: 6, name: 'Dentium Co. Ltd.' },
];
const legacyCompanies = [
  { id: 1, company_name: 'CAMLOG Biotechnologies AG' },
  { id: 4, company_name: 'Dentium Co. Ltd.' },
];

test('Niobiotech uses the Company ID rather than the conflicting legacy ID', () => {
  assert.equal(resolveBrandCompany(4, companies, legacyCompanies), companies[1]);
});
test('CAMLOG and CONELOG legacy ID resolves to the current Company record', () => {
  assert.equal(resolveBrandCompany(1, companies, legacyCompanies), companies[0]);
});
test('SuperLine resolves to Dentium using the current Company ID', () => {
  assert.equal(resolveBrandCompany('6', companies, legacyCompanies), companies[2]);
});
test('missing, unassigned, and unmapped legacy IDs remain unassigned', () => {
  assert.equal(resolveBrandCompany(null, companies, legacyCompanies), null);
  assert.equal(resolveBrandCompany(99, companies, legacyCompanies), null);
  assert.equal(resolveBrandCompany(8, companies, [{ id: 8, company_name: 'Unknown' }]), null);
});
