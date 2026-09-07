import { useCallback, useEffect, useMemo, useState } from "react";
import { implantsAPI, resolveImageUrl } from "../../services/api";

const IMPLANTS_UPDATED_EVENT = "implants:updated";

const buildImplantKey = (implant) => {
  if (!implant) return "";

  const slug = String(implant.slug || "").trim().toLowerCase();
  if (slug) return `slug:${slug}`;

  const id = String(implant.id || "").trim();
  if (id) return `id:${id}`;

  const brand = String(implant.brand || "").trim().toLowerCase();
  const name = String(implant.name || "").trim().toLowerCase();
  if (brand && name) return `brandname:${brand}::${name}`;

  return "";
};

const dedupeImplants = (list) => {
  const map = new Map();

  (Array.isArray(list) ? list : []).forEach((implant) => {
    const key = buildImplantKey(implant);
    if (!key) return;
    if (!map.has(key)) {
      map.set(key, implant);
    }
  });

  return Array.from(map.values());
};

export const pickImplantImages = (implant) => {
  return [0, 1, 2].map((_, index) => {
    const key = `image${index + 1}`;
    return {
      id: index + 1,
      dataUrl: resolveImageUrl(implant?.[key]),
    };
  });
};

const normalizeImplant = (implant) => {
  if (!implant) return null;

  return {
    ...implant,
    company:
      implant?.company?.name ||
      implant?.company?.company_name ||
      (typeof implant?.company === "string" ? implant.company : "") ||
      "",
    level:
      implant?.level?.name ||
      implant?.level?.level_name ||
      (typeof implant?.level === "string" ? implant.level : "") ||
      "",
    country:
      implant?.country?.name ||
      implant?.country?.country_name ||
      (typeof implant?.country === "string" ? implant.country : "") ||
      implant?.countryText ||
      "",
    image1: resolveImageUrl(implant.image1) || null,
    image2: resolveImageUrl(implant.image2) || null,
    image3: resolveImageUrl(implant.image3) || null,
  };
};

export default function useMergedImplants() {
  const [implants, setImplants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadImplants = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const fetched = await implantsAPI.getAll();
      const safeData = Array.isArray(fetched) ? fetched : [];
      const normalized = safeData.map(normalizeImplant).filter(Boolean);
      setImplants(dedupeImplants(normalized));
    } catch (err) {
      console.error("Failed to fetch implants from API", err);
      setError(err?.message || "Failed to fetch implants");
      setImplants([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadImplants();
  }, [loadImplants]);

  useEffect(() => {
    const handleRefresh = () => loadImplants();

    window.addEventListener(IMPLANTS_UPDATED_EVENT, handleRefresh);
    window.addEventListener("focus", handleRefresh);
    window.addEventListener("storage", handleRefresh);

    return () => {
      window.removeEventListener(IMPLANTS_UPDATED_EVENT, handleRefresh);
      window.removeEventListener("focus", handleRefresh);
      window.removeEventListener("storage", handleRefresh);
    };
  }, [loadImplants]);

  const bySlug = useMemo(() => {
    const map = new Map();
    (implants || []).forEach((implant) => {
      const slug = String(implant.slug || "").trim().toLowerCase();
      if (slug) map.set(slug, implant);
    });
    return map;
  }, [implants]);

  return {
    implants,
    loading,
    error,
    refresh: loadImplants,
    bySlug,
  };
}