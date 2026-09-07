import dotenv from 'dotenv';
import sequelize from '../config/database.js';
import {
  Brand,
  Company,
  Country,
  Level,
  Implant,
  OfficialDistributor,
  RefApexShape,
  RefBodyShape,
  RefConnectionShape,
  RefConnectionType,
  RefDriverShape,
  RefHeadShape,
} from '../models/index.js';
import CompanyMaster from '../models/CompanyMaster.js';
import { implants as sourceImplants } from '../../../frontend/src/user/data/implants.js';

dotenv.config();

// Normalize country string to a single canonical name
function normalizeCountry(country) {
  if (!country) return '';
  const normalized = country.toLowerCase().trim();
  if (normalized.includes('korea')) return 'South Korea';
  if (normalized.includes('united states') || normalized === 'usa') return 'USA';
  if (normalized.includes('switzerland')) return 'Switzerland';
  if (normalized.includes('germany')) return 'Germany';
  if (normalized.includes('brazil')) return 'Brazil';
  if (normalized.includes('japan')) return 'Japan';
  if (normalized.includes('sweden')) return 'Sweden';
  if (normalized.includes('israel')) return 'Israel';
  if (normalized.includes('france')) return 'France';
  if (normalized.includes('italy')) return 'Italy';
  if (normalized.includes('katella') || normalized.includes('cypress')) return 'USA';
  const words = country.split(/[\s,/]/).filter(Boolean);
  return words[0] || country;
}

async function upsertMaster(Model, name) {
  if (!name) return null;
  const trimmed = name.trim();
  if (!trimmed) return null;
  const [record] = await Model.findOrCreate({
    where: { name: trimmed },
    defaults: { name: trimmed, status: 'Active' },
  });
  return record.id;
}

async function upsertBrand(name, companyName, website) {
  if (!name) return null;

  const [company] = companyName
    ? await CompanyMaster.findOrCreate({
        where: { company_name: companyName.trim() },
        defaults: { company_name: companyName.trim(), status: 'Active' },
      })
    : [null];

  const [brand] = await Brand.findOrCreate({
    where: { brand_name: name.trim() },
    defaults: {
      manufacturer_id: company?.id || null,
      website: website || null,
      status: 'Active',
    },
  });

  if (
    company?.id &&
    (brand.manufacturer_id !== company.id || brand.website !== (website || null))
  ) {
    await brand.update({
      manufacturer_id: company.id,
      website: website || null,
      status: 'Active',
    });
  }

  return brand.idbrand;
}

async function upsertDistributor(name, countryId) {
  if (!name || !countryId) return null;

  const [record] = await OfficialDistributor.findOrCreate({
    where: { name: name.trim(), countryId },
    defaults: { name: name.trim(), countryId, status: 'Active' },
  });

  return record.id;
}

async function importImplants() {
  await sequelize.sync({ alter: true });

  let created = 0;
  let updated = 0;

  for (const item of sourceImplants) {
    const companyId = await upsertMaster(Company, item.company);
    const levelId = await upsertMaster(Level, item.level);
    const countryName = normalizeCountry(item.country);
    const countryId = await upsertMaster(Country, countryName);
    await upsertBrand(item.brand, item.company, item.website);
    await upsertMaster(RefConnectionType, item.connectionType);
    await upsertMaster(RefConnectionShape, item.connectionShape);
    await upsertMaster(RefDriverShape, item.screwdriverShape);
    await upsertMaster(RefHeadShape, item.headShape);
    await upsertMaster(RefBodyShape, item.bodyShape);
    await upsertMaster(RefApexShape, item.apexShape);
    await upsertDistributor(item.officialDistributor, countryId);

    const lookupSlug = item.slug?.trim();
    const lookupName = item.name?.trim();

    const existing = await Implant.findOne({
      where: lookupSlug ? { slug: lookupSlug } : { name: lookupName },
    });

    const payload = {
      brand: item.brand || null,
      slug: lookupSlug || null,
      name: lookupName,
      website: item.website || null,
      brandDescription: item.brandDescription || null,
      connectionType: item.connectionType || null,
      connectionShape: item.connectionShape || null,
      screwdriverShape: item.screwdriverShape || null,
      headShape: item.headShape || null,
      bodyShape: item.bodyShape || null,
      apexShape: item.apexShape || null,
      officialDistributor: item.officialDistributor || null,
      companyId,
      levelId,
      countryId,
      countryText: item.country || null,
      status: 'Active',
    };

    if (existing) {
      await existing.update(payload);
      updated += 1;
    } else {
      await Implant.create(payload);
      created += 1;
    }
  }

  const usaId = await upsertMaster(Country, 'USA');
  const legacyCountry = await Country.findOne({ where: { name: 'Headquarters:' } });

  if (legacyCountry && Number(legacyCountry.id) !== Number(usaId)) {
    await Implant.update(
      { countryId: usaId },
      { where: { countryId: legacyCountry.id } }
    );
    await OfficialDistributor.update(
      { countryId: usaId },
      { where: { countryId: legacyCountry.id } }
    );
    await legacyCountry.destroy();
  }

  return { created, updated };
}

(async () => {
  try {
    const { created, updated } = await importImplants();
    console.log(`Import completed. Created: ${created}, Updated: ${updated}`);
    process.exit(0);
  } catch (err) {
    console.error('Import failed:', err);
    process.exit(1);
  }
})();
