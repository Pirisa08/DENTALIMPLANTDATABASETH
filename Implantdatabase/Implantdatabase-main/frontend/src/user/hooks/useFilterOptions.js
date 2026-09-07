import { useCallback, useEffect, useState } from "react";
import { masterDataAPI } from "../../services/api.js";

const normalizeName = (item) => {
  if (!item) return "";
  return String(
    item.name ||
      item.company_name ||
      item.level_name ||
      item.country_name ||
      item.brand_name ||
      ""
  ).trim();
};

const isActiveItem = (item) => {
  if (!item) return false;
  if (!("status" in item)) return true;
  return item.status !== "Inactive";
};

const uniqueSorted = (items) => {
  return Array.from(new Set((items || []).filter(Boolean))).sort((a, b) =>
    String(a).localeCompare(String(b))
  );
};

export default function useFilterOptions() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [options, setOptions] = useState({
    company: [],
    level: [],
    connectionType: [],
    connectionShape: [],
    screwdriverShape: [],
    headShape: [],
    bodyShape: [],
    apexShape: [],
    country: [],
    officialDistributor: [],
  });

  const loadOptions = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [
        apiCompanies,
        apiLevels,
        apiCountries,
        apiConnectionTypes,
        apiConnectionShapes,
        apiHeadShapes,
        apiBodyShapes,
        apiApexShapes,
        apiScrewdriverShapes,
        apiDistributors,
      ] = await Promise.all([
        masterDataAPI.getCompanies().catch(() => []),
        masterDataAPI.getLevels().catch(() => []),
        masterDataAPI.getCountries().catch(() => []),
        masterDataAPI.getConnectionTypes().catch(() => []),
        masterDataAPI.getConnectionShapes().catch(() => []),
        masterDataAPI.getHeadShapes().catch(() => []),
        masterDataAPI.getBodyShapes().catch(() => []),
        masterDataAPI.getApexShapes().catch(() => []),
        masterDataAPI.getScrewdriverShapes().catch(() => []),
        masterDataAPI.getDistributors().catch(() => []),
      ]);

      setOptions({
        company: uniqueSorted((apiCompanies || []).filter(isActiveItem).map(normalizeName)),
        level: uniqueSorted((apiLevels || []).filter(isActiveItem).map(normalizeName)),
        country: uniqueSorted((apiCountries || []).filter(isActiveItem).map(normalizeName)),
        connectionType: uniqueSorted((apiConnectionTypes || []).filter(isActiveItem).map(normalizeName)),
        connectionShape: uniqueSorted((apiConnectionShapes || []).filter(isActiveItem).map(normalizeName)),
        screwdriverShape: uniqueSorted((apiScrewdriverShapes || []).filter(isActiveItem).map(normalizeName)),
        headShape: uniqueSorted((apiHeadShapes || []).filter(isActiveItem).map(normalizeName)),
        bodyShape: uniqueSorted((apiBodyShapes || []).filter(isActiveItem).map(normalizeName)),
        apexShape: uniqueSorted((apiApexShapes || []).filter(isActiveItem).map(normalizeName)),
        officialDistributor: uniqueSorted((apiDistributors || []).filter(isActiveItem).map(normalizeName)),
      });
    } catch (err) {
      console.error("Error loading filter options:", err);
      setError(err?.message || "Failed to load filter options");
      setOptions({
        company: [],
        level: [],
        connectionType: [],
        connectionShape: [],
        screwdriverShape: [],
        headShape: [],
        bodyShape: [],
        apexShape: [],
        country: [],
        officialDistributor: [],
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOptions();

    const handleRefresh = () => loadOptions();

    window.addEventListener("focus", handleRefresh);
    window.addEventListener("storage", handleRefresh);
    window.addEventListener("implants:updated", handleRefresh);

    return () => {
      window.removeEventListener("focus", handleRefresh);
      window.removeEventListener("storage", handleRefresh);
      window.removeEventListener("implants:updated", handleRefresh);
    };
  }, [loadOptions]);

  return {
    options,
    loading,
    error,
    refresh: loadOptions,
  };
}