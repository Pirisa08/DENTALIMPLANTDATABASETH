import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./MasterData.css";
import {
  getTypeLabel,
  loadMaster,
  saveMaster,
  upsertMasterType,
} from "./masterDataStore.js";
import AdminSearchBar from "../components/AdminSearchBar.jsx";
import Breadcrumb from "../components/Breadcrumb.jsx";
import { implantsAPI, masterDataAPI, brandAPI } from "../../services/api.js";

const PaginationArrow = ({ direction }) => (
  <svg viewBox="0 0 20 20" aria-hidden="true" className="paginationIcon">
    <path d={direction === "prev" ? "M12.5 4.5 7 10l5.5 5.5" : "M7.5 4.5 13 10l-5.5 5.5"} />
  </svg>
);

export default function MasterDataList() {
  const ITEMS_PER_PAGE = 10;
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const { type } = useParams();
  const label = getTypeLabel(type);

  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [master, setMaster] = useState(loadMaster());

  const [companies, setCompanies] = useState([]);
  const [brands, setBrands] = useState([]);
  const [countries, setCountries] = useState([]);
  const [levels, setLevels] = useState([]);
  const [distributors, setDistributors] = useState([]);
  const [connectionTypes, setConnectionTypes] = useState([]);
  const [connectionShapes, setConnectionShapes] = useState([]);
  const [screwdriverShapes, setScrewdriverShapes] = useState([]);
  const [headShapes, setHeadShapes] = useState([]);
  const [bodyShapes, setBodyShapes] = useState([]);
  const [apexShapes, setApexShapes] = useState([]);
  const [implants, setImplants] = useState([]);

  const [openCompanies, setOpenCompanies] = useState({});
  const [openBrands, setOpenBrands] = useState({});
  const [openCountries, setOpenCountries] = useState({});

  const refreshLocalMaster = () => {
    setMaster(loadMaster());
  };

  useEffect(() => {
    const refresh = () => refreshLocalMaster();
    refresh();
    window.addEventListener("focus", refresh);
    window.addEventListener("storage", refresh);

    return () => {
      window.removeEventListener("focus", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const syncTypeToLocal = (typeKey, items) => {
    const current = loadMaster();
    const next = {
      ...current,
      [typeKey]: Array.isArray(items) ? items : [],
    };
    saveMaster(next);
    setMaster(next);
    return next;
  };

  const loadCompanies = async () => {
    const data = await masterDataAPI.getCompanies();
    const normalized = Array.isArray(data) ? data : [];
    setCompanies(normalized);
    upsertMasterType("company", normalized);
    setMaster(loadMaster());
  };

  const loadImplants = async () => {
    const data = await implantsAPI.getAll();
    const normalized = Array.isArray(data) ? data : [];
    setImplants(normalized);
    syncTypeToLocal("implant", normalized);
  };

  const loadBrands = async () => {
    const data = await brandAPI.getAll();
    const normalized = Array.isArray(data)
      ? data.map((item) => ({
          id: item.id ?? item.idbrand,
          name: item.name ?? item.brand_name,
          companyId: item.companyId ?? item.manufacturer_id ?? null,
          companyName: item.companyName || null,
          website: item.website || "",
          status: item.status || "Active",
        }))
      : [];

    setBrands(normalized);
    upsertMasterType("brand", normalized);
    setMaster(loadMaster());
  };

  const loadCountries = async () => {
    const data = await masterDataAPI.getCountries();
    const normalized = Array.isArray(data) ? data : [];
    setCountries(normalized);
    syncTypeToLocal("country", normalized);
  };

  const loadLevels = async () => {
    const data = await masterDataAPI.getLevels();
    const normalized = Array.isArray(data) ? data : [];
    setLevels(normalized);
    syncTypeToLocal("level", normalized);
  };

  const loadDistributors = async () => {
    const data = await masterDataAPI.getDistributors();
    const normalized = Array.isArray(data) ? data : [];
    setDistributors(normalized);
    syncTypeToLocal("officialDistributor", normalized);
  };

  const loadConnectionTypes = async () => {
    const data = await masterDataAPI.getConnectionTypes();
    const normalized = Array.isArray(data) ? data : [];
    setConnectionTypes(normalized);
    syncTypeToLocal("connectionType", normalized);
    setMaster(loadMaster());
  };

  const loadConnectionShapes = async () => {
    const data = await masterDataAPI.getConnectionShapes();
    const normalized = Array.isArray(data) ? data : [];
    setConnectionShapes(normalized);
    syncTypeToLocal("connectionShape", normalized);
    setMaster(loadMaster());
  };

  const loadScrewdriverShapes = async () => {
    const data = await masterDataAPI.getScrewdriverShapes();
    const normalized = Array.isArray(data) ? data : [];
    setScrewdriverShapes(normalized);
    syncTypeToLocal("screwdriverShape", normalized);
    setMaster(loadMaster());
  };

  const loadHeadShapes = async () => {
    const data = await masterDataAPI.getHeadShapes();
    const normalized = Array.isArray(data) ? data : [];
    setHeadShapes(normalized);
    syncTypeToLocal("headShape", normalized);
    setMaster(loadMaster());
  };

  const loadBodyShapes = async () => {
    const data = await masterDataAPI.getBodyShapes();
    const normalized = Array.isArray(data) ? data : [];
    setBodyShapes(normalized);
    syncTypeToLocal("bodyShape", normalized);
    setMaster(loadMaster());
  };

  const loadApexShapes = async () => {
    const data = await masterDataAPI.getApexShapes();
    const normalized = Array.isArray(data) ? data : [];
    setApexShapes(normalized);
    syncTypeToLocal("apexShape", normalized);
    setMaster(loadMaster());
  };

  useEffect(() => {
    async function boot() {
      setLoading(true);
      setError("");

      try {
        if (type === "implant") {
          await loadImplants();
        } else if (type === "company") {
          await loadCompanies();
        } else if (type === "brand") {
          await Promise.all([loadCompanies(), loadBrands()]);
        } else if (type === "country") {
          await loadCountries();
        } else if (type === "level") {
          await loadLevels();
        } else if (type === "officialDistributor") {
          await Promise.all([loadCountries(), loadDistributors()]);
        } else if (type === "connectionType") {
          await loadConnectionTypes();
        } else if (type === "connectionShape") {
          await loadConnectionShapes();
        } else if (type === "screwdriverShape") {
          await loadScrewdriverShapes();
        } else if (type === "headShape") {
          await loadHeadShapes();
        } else if (type === "bodyShape") {
          await loadBodyShapes();
        } else if (type === "apexShape") {
          await loadApexShapes();
        } else {
          refreshLocalMaster();
        }
      } catch (err) {
        console.error(err);
        setError(`Failed to load ${type}`);
      } finally {
        setLoading(false);
      }
    }

    boot();
  }, [type]);

  const localList = useMemo(() => {
    if (!type) return [];
    return Array.isArray(master?.[type]) ? master[type] : [];
  }, [master, type]);

  const filteredCompanies = useMemo(() => {
    const s = q.trim().toLowerCase();
    const filtered = !s ? companies : companies.filter((x) =>
      String(x.name || "").toLowerCase().includes(s)
    );
    const start = (page - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [q, companies, page]);

  const filteredBrands = useMemo(() => {
    const s = q.trim().toLowerCase();
    const filtered = !s ? brands : brands.filter((x) =>
      `${x.name || ""} ${x.companyName || ""} ${x.website || ""}`
        .toLowerCase()
        .includes(s)
    );
    const start = (page - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [q, brands, page]);

  const filteredCountries = useMemo(() => {
    const source =
      countries.length > 0
        ? countries
        : Array.isArray(master?.country)
        ? master.country
        : [];
    const s = q.trim().toLowerCase();
    const filtered = !s ? source : source.filter((x) =>
      String(x.name || "").toLowerCase().includes(s)
    );
    const start = (page - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [q, countries, master, page]);

  const filteredLevels = useMemo(() => {
    const source =
      levels.length > 0
        ? levels
        : Array.isArray(master?.level)
        ? master.level
        : [];
    const s = q.trim().toLowerCase();
    const filtered = !s ? source : source.filter((x) =>
      String(x.name || "").toLowerCase().includes(s)
    );
    const start = (page - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [q, levels, master, page]);
  // Reset page to 1 when search or type changes
  useEffect(() => {
    setPage(1);
  }, [q, type]);

  const filteredConnectionTypes = useMemo(() => {
    const source =
      connectionTypes.length > 0
        ? connectionTypes
        : Array.isArray(master?.connectionType)
        ? master.connectionType
        : [];
    const s = q.trim().toLowerCase();
    if (!s) return source;
    return source.filter((x) =>
      String(x.name || "").toLowerCase().includes(s)
    );
  }, [q, connectionTypes, master]);

  const filteredConnectionShapes = useMemo(() => {
    const source =
      connectionShapes.length > 0
        ? connectionShapes
        : Array.isArray(master?.connectionShape)
        ? master.connectionShape
        : [];
    const s = q.trim().toLowerCase();
    if (!s) return source;
    return source.filter((x) =>
      String(x.name || "").toLowerCase().includes(s)
    );
  }, [q, connectionShapes, master]);

  const filteredScrewdriverShapes = useMemo(() => {
    const source =
      screwdriverShapes.length > 0
        ? screwdriverShapes
        : Array.isArray(master?.screwdriverShape)
        ? master.screwdriverShape
        : [];
    const s = q.trim().toLowerCase();
    if (!s) return source;
    return source.filter((x) =>
      String(x.name || "").toLowerCase().includes(s)
    );
  }, [q, screwdriverShapes, master]);

  const filteredHeadShapes = useMemo(() => {
    const source =
      headShapes.length > 0
        ? headShapes
        : Array.isArray(master?.headShape)
        ? master.headShape
        : [];
    const s = q.trim().toLowerCase();
    if (!s) return source;
    return source.filter((x) =>
      String(x.name || "").toLowerCase().includes(s)
    );
  }, [q, headShapes, master]);

  const filteredBodyShapes = useMemo(() => {
    const source =
      bodyShapes.length > 0
        ? bodyShapes
        : Array.isArray(master?.bodyShape)
        ? master.bodyShape
        : [];
    const s = q.trim().toLowerCase();
    if (!s) return source;
    return source.filter((x) =>
      String(x.name || "").toLowerCase().includes(s)
    );
  }, [q, bodyShapes, master]);

  const filteredApexShapes = useMemo(() => {
    const source =
      apexShapes.length > 0
        ? apexShapes
        : Array.isArray(master?.apexShape)
        ? master.apexShape
        : [];
    const s = q.trim().toLowerCase();
    if (!s) return source;
    return source.filter((x) =>
      String(x.name || "").toLowerCase().includes(s)
    );
  }, [q, apexShapes, master]);

  const filteredLocalList = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return localList;
    return localList.filter((x) =>
      String(x.name || "").toLowerCase().includes(s)
    );
  }, [q, localList]);

  const filteredImplants = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return implants;
    return implants.filter((item) =>
      [item.name, item.brand, item.company?.name, item.level?.name, item.status]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(s)
    );
  }, [q, implants]);

  const groupedDistributorCountries = useMemo(() => {
    const countrySource =
      countries.length > 0
        ? countries
        : Array.isArray(master?.country)
        ? master.country
        : [];

    const distributorSource =
      distributors.length > 0
        ? distributors
        : Array.isArray(master?.officialDistributor)
        ? master.officialDistributor
        : [];

    const mapped = countrySource.map((country) => {
      const child = distributorSource.filter(
        (d) => Number(d.countryId) === Number(country.id)
      );
      return { ...country, distributorCount: child.length, distributors: child };
    });

    const s = q.trim().toLowerCase();
    if (!s) return mapped;
    return mapped.filter((x) =>
      String(x.name || "").toLowerCase().includes(s)
    );
  }, [countries, distributors, master, q]);

  const updateLocalType = (nextItems) => {
    const current = loadMaster();
    const updated = { ...current, [type]: nextItems };
    saveMaster(updated);
    setMaster(updated);
  };

  const toggleLocalStatus = (id) => {
    const next = localList.map((item) =>
      item.id === id
        ? {
            ...item,
            status: item.status === "Active" ? "Inactive" : "Active",
          }
        : item
    );
    updateLocalType(next);
  };

  const deleteLocalItem = (id) => {
    if (!window.confirm("Delete this item?")) return;
    const next = localList.filter((item) => item.id !== id);
    updateLocalType(next);
  };

  const addCompany = async () => {
    const name = window.prompt("Enter new company name:");
    if (!name || !name.trim()) return;

    setLoading(true);
    setError("");
    try {
      await masterDataAPI.createCompany({ name: name.trim(), status: "Active" });
      await loadCompanies();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to add company");
    } finally {
      setLoading(false);
    }
  };

  const updateCompanyStatus = async (id, currentStatus) => {
    setLoading(true);
    setError("");
    try {
      await masterDataAPI.updateCompany(id, {
        status: currentStatus === "Active" ? "Inactive" : "Active",
      });
      await loadCompanies();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to update company");
    } finally {
      setLoading(false);
    }
  };

  const deleteCompany = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This action cannot be undone.`)) return;

    setLoading(true);
    setError("");
    try {
      await masterDataAPI.deleteCompany(id);
      await loadCompanies();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to delete company");
    } finally {
      setLoading(false);
    }
  };

  const addBrand = async () => {
    const name = window.prompt("Enter new brand name:");
    if (!name || !name.trim()) return;

    const companyIdText = window.prompt("Enter company ID for this brand (optional):", "");
    const website = window.prompt("Enter website (optional):", "") || "";
    const companyId = companyIdText && companyIdText.trim() ? Number(companyIdText) : null;

    setLoading(true);
    setError("");
    try {
      await brandAPI.create({
        name: name.trim(),
        companyId,
        website,
        status: "Active",
      });
      await loadBrands();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to add brand");
    } finally {
      setLoading(false);
    }
  };

  const editBrand = async (id, currentName, currentStatus, currentWebsite = "") => {
    const name = window.prompt("Edit brand name:", currentName);
    if (name === null) return;

    const trimmed = name.trim();
    if (!trimmed) {
      alert("Brand name is required");
      return;
    }

    const website = window.prompt("Edit website:", currentWebsite || "") ?? currentWebsite;

    setLoading(true);
    setError("");
    try {
      await brandAPI.update(id, {
        name: trimmed,
        website,
        status: currentStatus,
      });
      await loadBrands();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to edit brand");
    } finally {
      setLoading(false);
    }
  };

  const updateBrandStatus = async (id, currentStatus) => {
    setLoading(true);
    setError("");
    try {
      await brandAPI.update(id, {
        status: currentStatus === "Active" ? "Inactive" : "Active",
      });
      await loadBrands();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to update brand");
    } finally {
      setLoading(false);
    }
  };

  const deleteBrand = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This action cannot be undone.`)) return;

    setLoading(true);
    setError("");
    try {
      await brandAPI.delete(id);
      await loadBrands();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to delete brand");
    } finally {
      setLoading(false);
    }
  };

  const addCountry = async () => {
    const name = window.prompt("Enter new country name:");
    if (!name || !name.trim()) return;

    setLoading(true);
    setError("");
    try {
      await masterDataAPI.createCountry({
        name: name.trim(),
        status: "Active",
      });
      await loadCountries();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to add country");
    } finally {
      setLoading(false);
    }
  };

  const editCountry = async (id, currentName, currentStatus) => {
    const name = window.prompt("Edit country name:", currentName);
    if (name === null) return;

    const trimmed = name.trim();
    if (!trimmed) {
      alert("Country name is required");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await masterDataAPI.updateCountry(id, {
        name: trimmed,
        status: currentStatus,
      });
      await loadCountries();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to edit country");
    } finally {
      setLoading(false);
    }
  };

  const updateCountryStatus = async (id, currentStatus) => {
    setLoading(true);
    setError("");
    try {
      await masterDataAPI.updateCountry(id, {
        status: currentStatus === "Active" ? "Inactive" : "Active",
      });
      await loadCountries();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to update country");
    } finally {
      setLoading(false);
    }
  };

  const deleteCountry = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This action cannot be undone.`)) return;

    setLoading(true);
    setError("");
    try {
      await masterDataAPI.deleteCountry(id);
      await loadCountries();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to delete country");
    } finally {
      setLoading(false);
    }
  };

  const addLevel = async () => {
    const name = window.prompt("Enter new level name:");
    if (!name || !name.trim()) return;

    setLoading(true);
    setError("");
    try {
      await masterDataAPI.createLevel({
        name: name.trim(),
        status: "Active",
      });
      await loadLevels();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to add level");
    } finally {
      setLoading(false);
    }
  };

  const editLevel = async (id, currentName, currentStatus) => {
    const name = window.prompt("Edit level name:", currentName);
    if (name === null) return;

    const trimmed = name.trim();
    if (!trimmed) {
      alert("Level name is required");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await masterDataAPI.updateLevel(id, {
        name: trimmed,
        status: currentStatus,
      });
      await loadLevels();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to edit level");
    } finally {
      setLoading(false);
    }
  };

  const updateLevelStatus = async (id, currentStatus) => {
    setLoading(true);
    setError("");
    try {
      await masterDataAPI.updateLevel(id, {
        status: currentStatus === "Active" ? "Inactive" : "Active",
      });
      await loadLevels();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to update level");
    } finally {
      setLoading(false);
    }
  };

  const deleteLevel = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This action cannot be undone.`)) return;

    setLoading(true);
    setError("");
    try {
      await masterDataAPI.deleteLevel(id);
      await loadLevels();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to delete level");
    } finally {
      setLoading(false);
    }
  };

  const addConnectionType = async () => {
    const name = window.prompt("Enter new connection type name:");
    if (!name || !name.trim()) return;

    setLoading(true);
    setError("");
    try {
      await masterDataAPI.createConnectionType({
        name: name.trim(),
        status: "Active",
      });
      await loadConnectionTypes();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to add connection type");
    } finally {
      setLoading(false);
    }
  };

  const editConnectionType = async (id, currentName, currentStatus) => {
    const name = window.prompt("Edit connection type name:", currentName);
    if (name === null) return;

    const trimmed = name.trim();
    if (!trimmed) {
      alert("Connection type name is required");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await masterDataAPI.updateConnectionType(id, {
        name: trimmed,
        status: currentStatus,
      });
      await loadConnectionTypes();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to edit connection type");
    } finally {
      setLoading(false);
    }
  };

  const updateConnectionTypeStatus = async (id, currentStatus) => {
    setLoading(true);
    setError("");
    try {
      await masterDataAPI.updateConnectionType(id, {
        status: currentStatus === "Active" ? "Inactive" : "Active",
      });
      await loadConnectionTypes();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to update connection type");
    } finally {
      setLoading(false);
    }
  };

  const deleteConnectionType = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This action cannot be undone.`)) return;

    setLoading(true);
    setError("");
    try {
      await masterDataAPI.deleteConnectionType(id);
      await loadConnectionTypes();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to delete connection type");
    } finally {
      setLoading(false);
    }
  };

  const addConnectionShape = async () => {
    const name = window.prompt("Enter new connection shape name:");
    if (!name || !name.trim()) return;

    setLoading(true);
    setError("");
    try {
      await masterDataAPI.createConnectionShape({
        name: name.trim(),
        status: "Active",
      });
      await loadConnectionShapes();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to add connection shape");
    } finally {
      setLoading(false);
    }
  };

  const editConnectionShape = async (id, currentName, currentStatus) => {
    const name = window.prompt("Edit connection shape name:", currentName);
    if (name === null) return;

    const trimmed = name.trim();
    if (!trimmed) {
      alert("Connection shape name is required");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await masterDataAPI.updateConnectionShape(id, {
        name: trimmed,
        status: currentStatus,
      });
      await loadConnectionShapes();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to edit connection shape");
    } finally {
      setLoading(false);
    }
  };

  const updateConnectionShapeStatus = async (id, currentStatus) => {
    setLoading(true);
    setError("");
    try {
      await masterDataAPI.updateConnectionShape(id, {
        status: currentStatus === "Active" ? "Inactive" : "Active",
      });
      await loadConnectionShapes();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to update connection shape");
    } finally {
      setLoading(false);
    }
  };

  const deleteConnectionShape = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This action cannot be undone.`)) return;

    setLoading(true);
    setError("");
    try {
      await masterDataAPI.deleteConnectionShape(id);
      await loadConnectionShapes();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to delete connection shape");
    } finally {
      setLoading(false);
    }
  };

  const addScrewdriverShape = async () => {
    const name = window.prompt("Enter new screwdriver shape name:");
    if (!name || !name.trim()) return;

    setLoading(true);
    setError("");
    try {
      await masterDataAPI.createScrewdriverShape({
        name: name.trim(),
        status: "Active",
      });
      await loadScrewdriverShapes();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to add screwdriver shape");
    } finally {
      setLoading(false);
    }
  };

  const editScrewdriverShape = async (id, currentName, currentStatus) => {
    const name = window.prompt("Edit screwdriver shape name:", currentName);
    if (name === null) return;

    const trimmed = name.trim();
    if (!trimmed) {
      alert("Screwdriver shape name is required");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await masterDataAPI.updateScrewdriverShape(id, {
        name: trimmed,
        status: currentStatus,
      });
      await loadScrewdriverShapes();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to edit screwdriver shape");
    } finally {
      setLoading(false);
    }
  };

  const updateScrewdriverShapeStatus = async (id, currentStatus) => {
    setLoading(true);
    setError("");
    try {
      await masterDataAPI.updateScrewdriverShape(id, {
        status: currentStatus === "Active" ? "Inactive" : "Active",
      });
      await loadScrewdriverShapes();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to update screwdriver shape");
    } finally {
      setLoading(false);
    }
  };

  const deleteScrewdriverShape = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This action cannot be undone.`)) return;

    setLoading(true);
    setError("");
    try {
      await masterDataAPI.deleteScrewdriverShape(id);
      await loadScrewdriverShapes();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to delete screwdriver shape");
    } finally {
      setLoading(false);
    }
  };

  const addHeadShape = async () => {
    const name = window.prompt("Enter new head shape name:");
    if (!name || !name.trim()) return;

    setLoading(true);
    setError("");
    try {
      await masterDataAPI.createHeadShape({
        name: name.trim(),
        status: "Active",
      });
      await loadHeadShapes();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to add head shape");
    } finally {
      setLoading(false);
    }
  };

  const editHeadShape = async (id, currentName, currentStatus) => {
    const name = window.prompt("Edit head shape name:", currentName);
    if (name === null) return;

    const trimmed = name.trim();
    if (!trimmed) {
      alert("Head shape name is required");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await masterDataAPI.updateHeadShape(id, {
        name: trimmed,
        status: currentStatus,
      });
      await loadHeadShapes();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to edit head shape");
    } finally {
      setLoading(false);
    }
  };

  const updateHeadShapeStatus = async (id, currentStatus) => {
    setLoading(true);
    setError("");
    try {
      await masterDataAPI.updateHeadShape(id, {
        status: currentStatus === "Active" ? "Inactive" : "Active",
      });
      await loadHeadShapes();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to update head shape");
    } finally {
      setLoading(false);
    }
  };

  const deleteHeadShape = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This action cannot be undone.`)) return;

    setLoading(true);
    setError("");
    try {
      await masterDataAPI.deleteHeadShape(id);
      await loadHeadShapes();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to delete head shape");
    } finally {
      setLoading(false);
    }
  };

  const addBodyShape = async () => {
    const name = window.prompt("Enter new body shape name:");
    if (!name || !name.trim()) return;

    setLoading(true);
    setError("");
    try {
      await masterDataAPI.createBodyShape({
        name: name.trim(),
        status: "Active",
      });
      await loadBodyShapes();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to add body shape");
    } finally {
      setLoading(false);
    }
  };

  const editBodyShape = async (id, currentName, currentStatus) => {
    const name = window.prompt("Edit body shape name:", currentName);
    if (name === null) return;

    const trimmed = name.trim();
    if (!trimmed) {
      alert("Body shape name is required");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await masterDataAPI.updateBodyShape(id, {
        name: trimmed,
        status: currentStatus,
      });
      await loadBodyShapes();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to edit body shape");
    } finally {
      setLoading(false);
    }
  };

  const updateBodyShapeStatus = async (id, currentStatus) => {
    setLoading(true);
    setError("");
    try {
      await masterDataAPI.updateBodyShape(id, {
        status: currentStatus === "Active" ? "Inactive" : "Active",
      });
      await loadBodyShapes();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to update body shape");
    } finally {
      setLoading(false);
    }
  };

  const deleteBodyShape = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This action cannot be undone.`)) return;

    setLoading(true);
    setError("");
    try {
      await masterDataAPI.deleteBodyShape(id);
      await loadBodyShapes();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to delete body shape");
    } finally {
      setLoading(false);
    }
  };

  const addApexShape = async () => {
    const name = window.prompt("Enter new apex shape name:");
    if (!name || !name.trim()) return;

    setLoading(true);
    setError("");
    try {
      await masterDataAPI.createApexShape({
        name: name.trim(),
        status: "Active",
      });
      await loadApexShapes();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to add apex shape");
    } finally {
      setLoading(false);
    }
  };

  const editApexShape = async (id, currentName, currentStatus) => {
    const name = window.prompt("Edit apex shape name:", currentName);
    if (name === null) return;

    const trimmed = name.trim();
    if (!trimmed) {
      alert("Apex shape name is required");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await masterDataAPI.updateApexShape(id, {
        name: trimmed,
        status: currentStatus,
      });
      await loadApexShapes();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to edit apex shape");
    } finally {
      setLoading(false);
    }
  };

  const updateApexShapeStatus = async (id, currentStatus) => {
    setLoading(true);
    setError("");
    try {
      await masterDataAPI.updateApexShape(id, {
        status: currentStatus === "Active" ? "Inactive" : "Active",
      });
      await loadApexShapes();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to update apex shape");
    } finally {
      setLoading(false);
    }
  };

  const deleteApexShape = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This action cannot be undone.`)) return;

    setLoading(true);
    setError("");
    try {
      await masterDataAPI.deleteApexShape(id);
      await loadApexShapes();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to delete apex shape");
    } finally {
      setLoading(false);
    }
  };

  const updateImplantStatus = async (id, currentStatus) => {
    setLoading(true);
    setError("");
    try {
      await implantsAPI.update(id, {
        status: currentStatus === "Active" ? "Inactive" : "Active",
      });
      await loadImplants();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to update implant");
    } finally {
      setLoading(false);
    }
  };

  const deleteImplant = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This action cannot be undone.`)) return;

    setLoading(true);
    setError("");
    try {
      await implantsAPI.delete(id);
      await loadImplants();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to delete implant");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="mdWrap">
        <div className="empty">Loading...</div>
      </div>
    );
  }

  const renderSimpleTable = ({
    title,
    addLabel,
    items,
    onAdd,
    onEdit,
    onToggleStatus,
    onDelete,
    emptyText,
  }) => (
    <div className="mdWrap">
      <AdminSearchBar
        placeholder={`Search ${title.toLowerCase()}…`}
        value={q}
        onChangeQ={setQ}
        onSearch={setQ}
      />
      <Breadcrumb
        items={[
          { label: "Home", href: "/admin" },
          { label: "Master Data", href: "/admin/master" },
          { label: title },
        ]}
      />
      <h2 className="pageTitle">Master Data Management</h2>
      {error && <div className="empty" style={{ color: "#dc3545" }}>{error}</div>}

      <div className="panelMd">
        <div className="panelHeadRow">
          <h3 className="panelTitle">{title}</h3>
          <button className="addBtnMd" onClick={onAdd}>
            {addLabel}
          </button>
        </div>

        <div className="mdTable">
          <div className="mdHead detail">
            <div>ID</div>
            <div>Name</div>
            <div>Status</div>
            <div className="actionsCol">Actions</div>
          </div>

          {items.map((x, idx) => (
            <div className="mdRow detail" key={x.id}>
              <div>{idx + 1}</div>
              <div className="nameCell">{x.name}</div>
              <div className="statusCell">
                <button
                  className={`statusPill ${x.status === "Active" ? "on" : "off"}`}
                  onClick={() => onToggleStatus(x.id, x.status)}
                >
                  <span className="statusDot" />
                  {x.status === "Active" ? "Open" : "Closed"}
                </button>
              </div>
              <div className="actionsCol">
                <button className="btn edit" onClick={() => onEdit(x.id, x.name, x.status)}>
                  Edit
                </button>
                <button className="btn del" onClick={() => onDelete(x.id, x.name)}>
                  Delete
                </button>
              </div>
            </div>
          ))}

          {items.length === 0 && <div className="empty">{emptyText}</div>}
        </div>
      </div>
    </div>
  );

  if (type === "connectionType") {
    return renderSimpleTable({
      title: "Connection Type Data",
      addLabel: "+ Add Connection Type",
      items: filteredConnectionTypes,
      onAdd: addConnectionType,
      onEdit: editConnectionType,
      onToggleStatus: updateConnectionTypeStatus,
      onDelete: deleteConnectionType,
      emptyText: "No connection types found.",
    });
  }

  if (type === "implant") {
    return renderSimpleTable({
      title: "Implant Data",
      addLabel: "+ Add Implant",
      items: filteredImplants,
      onAdd: () => navigate("/admin/implants/new"),
      onEdit: (id) => navigate(`/admin/implants/edit/${id}`),
      onToggleStatus: updateImplantStatus,
      onDelete: deleteImplant,
      emptyText: "No implants found.",
    });
  }

  if (type === "connectionShape") {
    return renderSimpleTable({
      title: "Connection Shape Data",
      addLabel: "+ Add Connection Shape",
      items: filteredConnectionShapes,
      onAdd: addConnectionShape,
      onEdit: editConnectionShape,
      onToggleStatus: updateConnectionShapeStatus,
      onDelete: deleteConnectionShape,
      emptyText: "No connection shapes found.",
    });
  }

  if (type === "screwdriverShape") {
    return renderSimpleTable({
      title: "Screwdriver Shape Data",
      addLabel: "+ Add Screwdriver Shape",
      items: filteredScrewdriverShapes,
      onAdd: addScrewdriverShape,
      onEdit: editScrewdriverShape,
      onToggleStatus: updateScrewdriverShapeStatus,
      onDelete: deleteScrewdriverShape,
      emptyText: "No screwdriver shapes found.",
    });
  }

  if (type === "headShape") {
    return renderSimpleTable({
      title: "Head Shape Data",
      addLabel: "+ Add Head Shape",
      items: filteredHeadShapes,
      onAdd: addHeadShape,
      onEdit: editHeadShape,
      onToggleStatus: updateHeadShapeStatus,
      onDelete: deleteHeadShape,
      emptyText: "No head shapes found.",
    });
  }

  if (type === "bodyShape") {
    return renderSimpleTable({
      title: "Body Shape Data",
      addLabel: "+ Add Body Shape",
      items: filteredBodyShapes,
      onAdd: addBodyShape,
      onEdit: editBodyShape,
      onToggleStatus: updateBodyShapeStatus,
      onDelete: deleteBodyShape,
      emptyText: "No body shapes found.",
    });
  }

  if (type === "apexShape") {
    return renderSimpleTable({
      title: "Apex Shape Data",
      addLabel: "+ Add Apex Shape",
      items: filteredApexShapes,
      onAdd: addApexShape,
      onEdit: editApexShape,
      onToggleStatus: updateApexShapeStatus,
      onDelete: deleteApexShape,
      emptyText: "No apex shapes found.",
    });
  }

  if (type === "company") {
    return (
      <div className="mdWrap">
        <AdminSearchBar placeholder="Search companies…" value={q} onChangeQ={setQ} onSearch={setQ} />
        <Breadcrumb
          items={[
            { label: "Home", href: "/admin" },
            { label: "Master Data", href: "/admin/master" },
            { label: `${label} Data` },
          ]}
        />
        <h2 className="pageTitle">Master Data Management</h2>
        {error && <div className="empty" style={{ color: "#dc3545" }}>{error}</div>}

        <div className="panelMd">
          <div className="panelHeadRow">
            <h3 className="panelTitle">{label} Companies</h3>
            <button className="addBtnMd" onClick={addCompany}>+ Add Company</button>
          </div>

          {filteredCompanies.length === 0 ? (
            <div className="empty">No companies found</div>
          ) : (
            <>
            <div className="mdAccordion">
              {filteredCompanies.map((company) => {
                const isOpen = !!openCompanies[company.id];

                return (
                  <div key={company.id} className="mdAccItem">
                    <div
                      className="mdAccHeader"
                      role="button"
                      tabIndex={0}
                      onClick={() =>
                        setOpenCompanies((prev) => ({
                          ...prev,
                          [company.id]: !prev[company.id],
                        }))
                      }
                    >
                      <div>
                        <div className="mdAccTitle">{company.name}</div>
                        <div className="mdAccMeta">Status: {company.status}</div>
                      </div>

                      <div className="mdAccActions">
                        <button
                          className="pill ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateCompanyStatus(company.id, company.status);
                          }}
                        >
                          {company.status === "Active" ? "Deactivate" : "Activate"}
                        </button>

                        <button
                          className="pill del"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteCompany(company.id, company.name);
                          }}
                        >
                          Delete
                        </button>

                        <div className="mdChevron">{isOpen ? "−" : "+"}</div>
                      </div>
                    </div>

                    {isOpen && (
                      <div className="mdAccBody">
                        <div className="empty">Country Code: {company.countryCode || "-"}</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {/* Pagination */}
            {companies.length > ITEMS_PER_PAGE && (
              <div className="paginationWrap" style={{display:'flex',justifyContent:'center',alignItems:'center',gap:8,marginTop:16}}>
                <button
                  className="paginationBtn"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  aria-label="Previous Page"
                >
                  <PaginationArrow direction="prev" />
                  <span>Previous</span>
                </button>
                <span className="paginationText">
                  Page {page} of {Math.ceil(companies.length / ITEMS_PER_PAGE)}
                </span>
                <button
                  className="paginationBtn"
                  onClick={() => setPage((p) => Math.min(Math.ceil(companies.length / ITEMS_PER_PAGE), p + 1))}
                  disabled={page === Math.ceil(companies.length / ITEMS_PER_PAGE)}
                  aria-label="Next Page"
                >
                  <span>Next</span>
                  <PaginationArrow direction="next" />
                </button>
              </div>
            )}
            </>
          )}
        </div>
      </div>
    );
  }

  if (type === "brand") {
    return (
      <div className="mdWrap">
        <AdminSearchBar placeholder="Search brands…" value={q} onChangeQ={setQ} onSearch={setQ} />
        <Breadcrumb
          items={[
            { label: "Home", href: "/admin" },
            { label: "Master Data", href: "/admin/master" },
            { label: `${label} Data` },
          ]}
        />
        <h2 className="pageTitle">Master Data Management</h2>
        {error && <div className="empty" style={{ color: "#dc3545" }}>{error}</div>}

        <div className="panelMd">
          <div className="panelHeadRow">
            <h3 className="panelTitle">{label} Data</h3>
            <button className="addBtnMd" onClick={addBrand}>+ Add Brand</button>
          </div>

          {filteredBrands.length === 0 ? (
            <div className="empty">No brands found</div>
          ) : (
            <>
            <div className="mdAccordion">
              {filteredBrands.map((brand) => {
                const isOpen = !!openBrands[brand.id];

                return (
                  <div key={brand.id} className="mdAccItem">
                    <div
                      className="mdAccHeader"
                      role="button"
                      tabIndex={0}
                      onClick={() =>
                        setOpenBrands((prev) => ({
                          ...prev,
                          [brand.id]: !prev[brand.id],
                        }))
                      }
                    >
                      <div>
                        <div className="mdAccTitle">{brand.name}</div>
                        <div className="mdAccMeta">
                          Company: {brand.companyName || brand.companyId || "-"} | Status: {brand.status}
                        </div>
                      </div>

                      <div className="mdAccActions">
                        <button
                          className="pill ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateBrandStatus(brand.id, brand.status);
                          }}
                        >
                          {brand.status === "Active" ? "Deactivate" : "Activate"}
                        </button>

                        <button
                          className="btn edit"
                          onClick={(e) => {
                            e.stopPropagation();
                            editBrand(brand.id, brand.name, brand.status, brand.website);
                          }}
                        >
                          Edit
                        </button>

                        <button
                          className="pill del"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteBrand(brand.id, brand.name);
                          }}
                        >
                          Delete
                        </button>

                        <div className="mdChevron">{isOpen ? "−" : "+"}</div>
                      </div>
                    </div>

                    {isOpen && (
                      <div className="mdAccBody">
                        <div className="empty">Website: {brand.website || "-"}</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {/* Pagination */}
            {brands.length > ITEMS_PER_PAGE && (
              <div className="paginationWrap" style={{display:'flex',justifyContent:'center',alignItems:'center',gap:8,marginTop:16}}>
                <button
                  className="paginationBtn"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  aria-label="Previous Page"
                >
                  <PaginationArrow direction="prev" />
                  <span>Previous</span>
                </button>
                <span className="paginationText">
                  Page {page} of {Math.ceil(brands.length / ITEMS_PER_PAGE)}
                </span>
                <button
                  className="paginationBtn"
                  onClick={() => setPage((p) => Math.min(Math.ceil(brands.length / ITEMS_PER_PAGE), p + 1))}
                  disabled={page === Math.ceil(brands.length / ITEMS_PER_PAGE)}
                  aria-label="Next Page"
                >
                  <span>Next</span>
                  <PaginationArrow direction="next" />
                </button>
              </div>
            )}
            </>
          )}
        </div>
      </div>
    );
  }

  if (type === "level") {
    return (
      <div className="mdWrap">
        <AdminSearchBar placeholder={`Search ${label.toLowerCase()}…`} value={q} onChangeQ={setQ} onSearch={setQ} />
        <Breadcrumb
          items={[
            { label: "Home", href: "/admin" },
            { label: "Master Data", href: "/admin/master" },
            { label: `${label} Data` },
          ]}
        />
        <h2 className="pageTitle">Master Data Management</h2>
        {error && <div className="empty" style={{ color: "#dc3545" }}>{error}</div>}

        <div className="panelMd">
          <div className="panelHeadRow">
            <h3 className="panelTitle">{label} Data</h3>
            <button className="addBtnMd" onClick={addLevel}>+ Add Level</button>
          </div>

          {filteredLevels.length === 0 ? (
            <div className="empty">No levels found.</div>
          ) : (
            <div className="mdTable">
              <div className="mdHead detail">
                <div>ID</div>
                <div>Name</div>
                <div>Status</div>
                <div className="actionsCol">Actions</div>
              </div>
              {filteredLevels.map((x, idx) => (
                <div className="mdRow detail" key={x.id}>
                  <div>{idx + 1}</div>
                  <div className="nameCell">{x.name}</div>
                  <div className="statusCell">
                    <button
                      className={`statusPill ${x.status === "Active" ? "on" : "off"}`}
                      onClick={() => updateLevelStatus(x.id, x.status)}
                    >
                      <span className="statusDot" />
                      {x.status === "Active" ? "Open" : "Closed"}
                    </button>
                  </div>
                  <div className="actionsCol">
                    <button className="btn edit" onClick={() => editLevel(x.id, x.name, x.status)}>Edit</button>
                    <button className="btn del" onClick={() => deleteLevel(x.id, x.name)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {levels.length > ITEMS_PER_PAGE && (
            <div className="paginationWrap" style={{display:'flex',justifyContent:'center',alignItems:'center',gap:8,marginTop:16}}>
              <button
                className="paginationBtn"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                aria-label="Previous Page"
              >
                <PaginationArrow direction="prev" />
                <span>Previous</span>
              </button>
              <span className="paginationText">
                Page {page} of {Math.ceil(levels.length / ITEMS_PER_PAGE)}
              </span>
              <button
                className="paginationBtn"
                onClick={() => setPage((p) => Math.min(Math.ceil(levels.length / ITEMS_PER_PAGE), p + 1))}
                disabled={page === Math.ceil(levels.length / ITEMS_PER_PAGE)}
                aria-label="Next Page"
              >
                <span>Next</span>
                <PaginationArrow direction="next" />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (type === "country") {
    return (
      <div className="mdWrap">
        <AdminSearchBar placeholder={`Search ${label.toLowerCase()}…`} value={q} onChangeQ={setQ} onSearch={setQ} />
        <Breadcrumb
          items={[
            { label: "Home", href: "/admin" },
            { label: "Master Data", href: "/admin/master" },
            { label: `${label} Data` },
          ]}
        />
        <h2 className="pageTitle">Master Data Management</h2>
        {error && <div className="empty" style={{ color: "#dc3545" }}>{error}</div>}

        <div className="panelMd">
          <div className="panelHeadRow">
            <h3 className="panelTitle">{label} Data</h3>
            <button className="addBtnMd" onClick={addCountry}>+ Add Country</button>
          </div>

          {filteredCountries.length === 0 ? (
            <div className="empty">No countries found.</div>
          ) : (
            <div className="mdTable">
              <div className="mdHead detail">
                <div>ID</div>
                <div>Name</div>
                <div>Status</div>
                <div className="actionsCol">Actions</div>
              </div>
              {filteredCountries.map((x, idx) => (
                <div className="mdRow detail" key={x.id}>
                  <div>{idx + 1}</div>
                  <div className="nameCell">{x.name}</div>
                  <div className="statusCell">
                    <button
                      className={`statusPill ${x.status === "Active" ? "on" : "off"}`}
                      onClick={() => updateCountryStatus(x.id, x.status)}
                    >
                      <span className="statusDot" />
                      {x.status === "Active" ? "Open" : "Closed"}
                    </button>
                  </div>
                  <div className="actionsCol">
                    <button className="btn edit" onClick={() => editCountry(x.id, x.name, x.status)}>Edit</button>
                    <button className="btn del" onClick={() => deleteCountry(x.id, x.name)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {countries.length > ITEMS_PER_PAGE && (
            <div className="paginationWrap" style={{display:'flex',justifyContent:'center',alignItems:'center',gap:8,marginTop:16}}>
              <button
                className="paginationBtn"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                aria-label="Previous Page"
              >
                <PaginationArrow direction="prev" />
                <span>Previous</span>
              </button>
              <span className="paginationText">
                Page {page} of {Math.ceil(countries.length / ITEMS_PER_PAGE)}
              </span>
              <button
                className="paginationBtn"
                onClick={() => setPage((p) => Math.min(Math.ceil(countries.length / ITEMS_PER_PAGE), p + 1))}
                disabled={page === Math.ceil(countries.length / ITEMS_PER_PAGE)}
                aria-label="Next Page"
              >
                <span>Next</span>
                <PaginationArrow direction="next" />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

if (type === "officialDistributor") { 
  return (
    <div className="mdWrap">
      <AdminSearchBar
        placeholder="Search countries…"
        value={q}
        onChangeQ={setQ}
        onSearch={setQ}
     />
      <Breadcrumb
        items={[
          { label: "Home", href: "/admin" },
          { label: "Master Data", href: "/admin/master" },
          { label: `${label} Data` },
        ]}
      />
      <h2 className="pageTitle">Master Data Management</h2>
      {error && <div className="empty" style={{ color: "#dc3545" }}>{error}</div>}

      <div className="panelMd">
        <div className="panelHeadRow">
          <h3 className="panelTitle">{label} by Country</h3>
        </div>

        <div className="mdAccordion">
          {groupedDistributorCountries.map((x) => {
            const isOpen = !!openCountries[x.id];
            const child = x.distributors || [];

            return (
              <div className="mdAccItem" key={x.id}>
                <div
                  className="mdAccHeader"
                  role="button"
                  tabIndex={0}
                  onClick={() =>
                    setOpenCountries((prev) => ({
                      ...prev,
                      [x.id]: !prev[x.id],
                    }))
                  }
                >
                  <div>
                    <div className="mdAccTitle">{x.name}</div>
                    <div className="mdAccMeta">{child.length} distributor(s)</div>
                  </div>

                  <div className="mdAccActions">
                    <button
                      className="btn edit"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.location.href = `/admin/master/officialDistributor/${x.id}`;
                      }}
                    >
                      Manage
                    </button>
                    <div className="mdChevron">{isOpen ? "−" : "+"}</div>
                  </div>
                </div>

                {isOpen && (
                  <div className="mdAccBody">
                    {child.length === 0 && (
                      <div className="empty">No distributors yet.</div>
                    )}

                    {child.map((d) => (
                      <div className="mdSubRow" key={d.id}>
                        <div className="nameCell">{d.name}</div>
                        <div className="statusCell">
                          <button
                            className={`statusPill ${d.status === "Active" ? "on" : "off"}`}
                          >
                            <span className="statusDot" />
                            {d.status === "Active" ? "Open" : "Closed"}
                          </button>
                        </div>
                        <div className="actionsCol">
                          <button
                            className="btn edit"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.location.href = `/admin/master/officialDistributor/${x.id}/edit/${d.id}`;
                            }}
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                    ))}

                    <div style={{ marginTop: "12px" }}>
                      <button
                        className="addBtnMd"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.location.href = `/admin/master/officialDistributor/${x.id}/new`;
                        }}
                      >
                        + Add Distributor
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {groupedDistributorCountries.length === 0 && (
            <div className="empty">No countries found.</div>
          )}
        </div>
      </div>
    </div>
  );
}
  return (
    <div className="mdWrap">
      <AdminSearchBar placeholder="Search items…" value={q} onChangeQ={setQ} onSearch={setQ} />
      <Breadcrumb
        items={[
          { label: "Home", href: "/admin" },
          { label: "Master Data", href: "/admin/master" },
          { label: `${label} Data` },
        ]}
      />
      <h2 className="pageTitle">Master Data Management</h2>

      {error && <div className="empty" style={{ color: "#dc3545" }}>{error}</div>}

      <div className="panelMd">
        <div className="panelHeadRow">
          <h3 className="panelTitle">{label} Data</h3>
        </div>

        <div className="mdTable">
          <div className="mdHead detail">
            <div>ID</div>
            <div>Name</div>
            <div>Status</div>
            <div className="actionsCol">Actions</div>
          </div>

          {filteredLocalList.map((x, idx) => (
            <div className="mdRow detail" key={x.id}>
              <div>{idx + 1}</div>
              <div className="nameCell">{x.name}</div>
              <div className="statusCell">
                <button
                  className={`statusPill ${x.status === "Active" ? "on" : "off"}`}
                  onClick={() => toggleLocalStatus(x.id)}
                >
                  <span className="statusDot" />
                  {x.status === "Active" ? "Open" : "Closed"}
                </button>
              </div>
              <div className="actionsCol">
                <button className="btn edit" disabled>Edit</button>
                <button className="btn del" onClick={() => deleteLocalItem(x.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}

          {filteredLocalList.length === 0 && (
            <div className="empty">No items found.</div>
          )}
        </div>
      </div>
    </div>
  );
}
