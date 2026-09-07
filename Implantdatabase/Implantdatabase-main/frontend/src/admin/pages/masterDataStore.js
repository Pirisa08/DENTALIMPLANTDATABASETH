export const MASTER_KEY = "admin_masterdata_v1";
export const MASTER_VERSION_KEY = "admin_masterdata_version";

export const MASTER_TYPES = [
  { key: "company", label: "Company" },
  { key: "brand", label: "Brand" },
  { key: "country", label: "Country" },
  { key: "level", label: "Level" },
  { key: "connectionType", label: "Connection Type" },
  { key: "connectionShape", label: "Connection Shape" },
  { key: "screwdriverShape", label: "Screwdriver Shape" },
  { key: "headShape", label: "Head Shape" },
  { key: "bodyShape", label: "Body Shape" },
  { key: "apexShape", label: "Apex Shape" },
  { key: "officialDistributor", label: "Official Distributor" },
];

const CURRENT_SEED_VERSION = "v11.0";

const seed = {
  company: [
    { id: 1, name: "CAMLOG Biotechnologies AG", status: "Active" },
    { id: 2, name: "Neobiotech Co., Ltd.", status: "Active" },
    { id: 3, name: "OSSTEM IMPLANT CO., LTD.", status: "Active" },
    { id: 4, name: "Dentium Co. Ltd.", status: "Active" },
  ],
  brand: [
    { id: 1, name: "CAMLOG", status: "Active", companyId: 1, modelCount: 4, website: "" },
    { id: 2, name: "CAMLOG SCREW", status: "Active", companyId: 1, modelCount: 4, website: "" },
    { id: 3, name: "CAMLOG PIONEER", status: "Active", companyId: 1, modelCount: 4, website: "" },
    { id: 4, name: "NEOBIOTECH", status: "Active", companyId: 2, modelCount: 5, website: "" },
    { id: 5, name: "NEOBIOTECH MAX", status: "Active", companyId: 2, modelCount: 5, website: "" },
    { id: 6, name: "NEOBIOTECH NURI", status: "Active", companyId: 2, modelCount: 5, website: "" },
    { id: 7, name: "OSSTEM TS", status: "Active", companyId: 3, modelCount: 5, website: "" },
    { id: 8, name: "OSSTEM TSX", status: "Active", companyId: 3, modelCount: 5, website: "" },
    { id: 9, name: "OSSTEM TUA", status: "Active", companyId: 3, modelCount: 5, website: "" },
    { id: 10, name: "DENTIUM IMPLANTIUM", status: "Active", companyId: 4, modelCount: 2, website: "" },
    { id: 11, name: "DENTIUM ASTRA", status: "Active", companyId: 4, modelCount: 2, website: "" },
    { id: 12, name: "DENTIUM XIVE", status: "Active", companyId: 4, modelCount: 2, website: "" },
  ],
  country: [],
  level: [],
  connectionType: [],
  connectionShape: [],
  screwdriverShape: [],
  headShape: [],
  bodyShape: [],
  apexShape: [],
  officialDistributor: [],
};

export function loadMaster() {
  const raw = localStorage.getItem(MASTER_KEY);
  const storedVersion = localStorage.getItem(MASTER_VERSION_KEY);

  if (!raw || storedVersion !== CURRENT_SEED_VERSION) {
    localStorage.setItem(MASTER_KEY, JSON.stringify(seed));
    localStorage.setItem(MASTER_VERSION_KEY, CURRENT_SEED_VERSION);
    return seed;
  }

  try {
    const obj = JSON.parse(raw);
    return obj && typeof obj === "object" ? obj : seed;
  } catch {
    return seed;
  }
}

export function saveMaster(obj) {
  localStorage.setItem(MASTER_KEY, JSON.stringify(obj));
}

export function getTypeLabel(typeKey) {
  return MASTER_TYPES.find((t) => t.key === typeKey)?.label || typeKey;
}

export function getIdByName(type, name) {
  const master = loadMaster();
  const item = master[type]?.find((x) => x.name === name);
  return item?.id || null;
}

export function getNameById(type, id) {
  const master = loadMaster();
  const item = master[type]?.find((x) => x.id === id);
  return item?.name || "N/A";
}

export function upsertMasterType(type, incomingItems) {
  const current = loadMaster();
  const existing = Array.isArray(current[type]) ? current[type] : [];
  const map = new Map();

  existing.forEach((item) => {
    map.set(String(item.id), item);
  });

  (incomingItems || []).forEach((item) => {
    map.set(String(item.id), item);
  });

  const updated = {
    ...current,
    [type]: Array.from(map.values()),
  };

  saveMaster(updated);
  return updated;
}