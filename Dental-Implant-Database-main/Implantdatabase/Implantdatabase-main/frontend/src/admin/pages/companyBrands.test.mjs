import test from "node:test";
import assert from "node:assert/strict";
import { getCompanyBrands } from "./companyBrands.js";

test("CAMLOG and CONELOG match their company across legacy company ID tables", () => {
  const brands = [
    { id: 9, name: "CAMLOG", companyId: 1, companyName: "CAMLOG Biotechnologies AG" },
    { id: 10, name: "Conelog", companyId: 1, companyName: "CAMLOG Biotechnologies AG" },
    { id: 21, name: "Osstem", companyId: 4, companyName: "Dentium Co. Ltd." },
  ];
  assert.deepEqual(
    getCompanyBrands(brands, { id: 3, name: "CAMLOG Biotechnologies AG" }).map((b) => b.name),
    ["CAMLOG", "Conelog"]
  );
});

test("a legacy ID collision does not override the identified company name", () => {
  assert.deepEqual(getCompanyBrands([
    { companyId: 4, companyName: "Dentium Co. Ltd." },
  ], { id: 4, name: "Neobiotech Co., Ltd." }), []);
});

test("company name matching ignores surrounding spaces and letter case", () => {
  const brand = { companyId: 1, companyName: " CAMLOG BIOTECHNOLOGIES AG " };
  assert.deepEqual(getCompanyBrands([brand], { id: 3, name: "CAMLOG Biotechnologies AG" }), [brand]);
});

test("brands without a company name can match by ID, excluding unassigned brands", () => {
  const brand = { companyId: "3", companyName: null };
  assert.deepEqual(getCompanyBrands([brand, { companyId: null }], { id: 3, name: "CAMLOG" }), [brand]);
});
