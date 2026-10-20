const text = (value) => String(value || '').trim();
const active = (item) => text(item.status || 'Active').toLowerCase() === 'active';
const slugify = (value) => text(value).toLowerCase()
  .replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');

export const searchSite = (data, query) => {
  const terms = text(query).toLowerCase().split(/\s+/).filter(Boolean);
  const matches = (...values) => {
    const haystack = values.map(text).join(' ').toLowerCase();
    return terms.length > 0 && terms.every(term => haystack.includes(term));
  };
  return [
    {
      label: 'Companies',
      items: (data.companies || []).filter(item => active(item) && matches(item.name)).map(item => ({
        id: item.id, title: item.name,
        to: `/implants/brand/${encodeURIComponent(item.name)}?company=${encodeURIComponent(item.name)}`,
      })),
    },
    {
      label: 'Brands',
      items: (data.brands || []).filter(item => active(item) && matches(item.name || item.brand_name, item.companyName)).map(item => ({
        id: item.id ?? item.idbrand, title: item.name || item.brand_name,
        subtitle: item.companyName,
        to: `/implants/brand/${encodeURIComponent(item.name || item.brand_name)}`,
      })),
    },
    {
      label: 'Blog',
      items: (data.blogs || []).filter(item => active(item) && matches(item.title, item.description, item.category)).map(item => ({
        id: item.id ?? item.blog_id, title: item.title, subtitle: item.description,
        to: `/blog/${slugify(item.title)}-${item.id ?? item.blog_id}`,
      })),
    },
    {
      label: 'Implants',
      items: (data.implants || []).filter(item => active(item) && item.slug && matches(item.name, item.brand, item.company)).map(item => ({
        id: item.id, title: item.name, subtitle: item.brand,
        to: `/implants/${encodeURIComponent(item.slug)}`,
      })),
    },
  ];
};
