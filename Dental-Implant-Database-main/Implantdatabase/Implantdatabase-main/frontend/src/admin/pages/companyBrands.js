export const getCompanyBrands = (brands, company) => brands.filter((brand) => {
  const companyName = String(company.name || "").trim().toLowerCase();
  const brandCompanyName = String(brand.companyName || "").trim().toLowerCase();

  // The legacy brand API and company list use different company ID tables.
  if (brandCompanyName) return !!companyName && brandCompanyName === companyName;

  return brand.companyId != null && company.id != null &&
    String(brand.companyId) === String(company.id);
});
