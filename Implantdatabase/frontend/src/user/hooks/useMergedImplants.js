import { useCallback, useEffect, useMemo, useState } from "react";
import { implants as seedImplants } from "../data/implants";
import { implantsAPI } from "../../services/api";

const ADMIN_IMPLANTS_KEY = "admin_implants_v1";

const buildImplantKey = (implant) => {
  if (!implant) return "";
  const slug = (implant.slug || "").trim().toLowerCase();
  if (slug) return `slug:${slug}`;
  const brand = (implant.brand || "").trim().toLowerCase();
  const name = (implant.name || "").trim().toLowerCase();
  if (brand && name) return `brandname:${brand}::${name}`;
  const id = String(implant.id || "").trim();
  if (id) return `id:${id}`;
  return `idx:${Math.random()}`;
};

const dedupeImplants = (lists) => {
  const map = new Map();
  lists.forEach((list) => {
    (list || []).forEach((implant) => {
      const key = buildImplantKey(implant);
      if (!map.has(key)) {
        map.set(key, implant);
      }
    });
  });
  return Array.from(map.values());
};

const readLocalImplants = () => {
  if (typeof window === "undefined" || !window.localStorage) return [];
  try {
    const raw = window.localStorage.getItem(ADMIN_IMPLANTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn("Failed to parse admin implants from storage", err);
    return [];
  }
};

const extractImage = (implant, key) => {
  if (!implant) return null;
  
  let imageUrl = null;
  
  // Try direct key
  if (implant[key]) imageUrl = implant[key];
  
  // Try alternative key
  if (!imageUrl) {
    const altKey = `${key}DataUrl`;
    if (implant[altKey]) imageUrl = implant[altKey];
  }
  
  // Try images array/object
  if (!imageUrl && implant.images) {
    if (Array.isArray(implant.images)) {
      const index = Number(key.replace("image", "")) - 1;
      if (!Number.isNaN(index) && implant.images[index]) {
        imageUrl = implant.images[index];
      }
    } else if (implant.images[key]) {
      imageUrl = implant.images[key];
    }
  }
  
  if (!imageUrl) return null;
  
  // Convert relative paths to full URLs
  if (typeof imageUrl === 'string') {
    // If it's already a data URL or full URL, return as is
    if (imageUrl.startsWith('data:') || imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    
    // If it's a relative path, convert to full URL
    if (imageUrl.startsWith('/uploads/')) {
      const apiBaseUrl = import.meta?.env?.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
      return `${apiBaseUrl}${imageUrl}`;
    }
  }
  
  return imageUrl;
};

export const pickImplantImages = (implant) => {
  return [0, 1, 2].map((_, index) => {
    const key = `image${index + 1}`;
    return {
      id: index + 1,
      dataUrl: extractImage(implant, key),
    };
  });
};

export default function useMergedImplants() {
  const [implants, setImplants] = useState(() => seedImplants);
  const [apiImplants, setApiImplants] = useState([]);
  const [localImplants, setLocalImplants] = useState(() => readLocalImplants());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadImplants = useCallback(async () => {
    setLoading(true);
    let apiData = [];
    let apiError = null;
    try {
      const fetched = await implantsAPI.getAll();
      apiData = Array.isArray(fetched) ? fetched : [];
    } catch (err) {
      apiError = err;
      apiData = [];
      console.warn("Failed to fetch implants from API", err);
    }

    const localData = readLocalImplants();

    setApiImplants(apiData);
    setLocalImplants(localData);
    setImplants(dedupeImplants([apiData, localData, seedImplants]));
    setError(apiError && apiData.length === 0 ? apiError : null);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadImplants();
  }, [loadImplants]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const handleStorage = (event) => {
      if (!event || !event.key || event.key === ADMIN_IMPLANTS_KEY) {
        loadImplants();
      }
    };

    const handleFocus = () => loadImplants();

    window.addEventListener("storage", handleStorage);
    window.addEventListener("focus", handleFocus);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("focus", handleFocus);
    };
  }, [loadImplants]);

  const implantsBySlug = useMemo(() => {
    const map = new Map();
    (apiImplants || []).forEach((implant) => {
      const slug = (implant.slug || "").trim().toLowerCase();
      if (slug) map.set(slug, implant);
    });
    (localImplants || []).forEach((implant) => {
      const slug = (implant.slug || "").trim().toLowerCase();
      if (slug && !map.has(slug)) map.set(slug, implant);
    });
    (implants || []).forEach((implant) => {
      const slug = (implant.slug || "").trim().toLowerCase();
      if (slug && !map.has(slug)) map.set(slug, implant);
    });
    return map;
  }, [apiImplants, implants, localImplants]);

  return {
    implants,
    loading,
    error,
    refresh: loadImplants,
    sources: {
      api: apiImplants,
      local: localImplants,
      seed: seedImplants,
    },
    bySlug: implantsBySlug,
  };
}
