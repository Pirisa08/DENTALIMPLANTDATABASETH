export const resolveBrandCompany = (storedId, companies, legacyCompanies) => {
  if (storedId == null) return null;
  const direct = companies.find((company) => String(company.id) === String(storedId));
  if (direct) return direct;

  const legacy = legacyCompanies.find((company) => String(company.id) === String(storedId));
  if (!legacy) return null;
  const name = String(legacy.company_name || '').trim().toLowerCase();
  return companies.find((company) => String(company.name || '').trim().toLowerCase() === name) || null;
};
