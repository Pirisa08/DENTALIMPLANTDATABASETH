import React, { useMemo, useState, useEffect, useCallback } from "react";
import "./ManageImplants.css";
import { useNavigate, useLocation } from "react-router-dom";
import AdminSearchBar from "../components/AdminSearchBar.jsx";
import Breadcrumb from "../components/Breadcrumb.jsx";
import { implantsAPI, masterDataAPI } from "../../services/api.js";
import { mockImplants } from "../data/implantsMockData.js";

const IMPLANTS_KEY = "admin_implants_v1";

const buildImplantKey = (implant) => {
  if (!implant) return "";
  const slug = (implant.slug || "").trim().toLowerCase();
  if (slug) return `slug:${slug}`;
  const brand = (implant.brand || "").trim().toLowerCase();
  const name = (implant.name || "").trim().toLowerCase();
  if (brand && name) return `brandname:${brand}::${name}`;
  const id = String(implant.id || "").trim();
  if (id) return `id:${id}`;
  return `tmp:${Math.random()}`;
};

const dedupeImplants = (lists) => {
  const map = new Map();
  lists.forEach((list = []) => {
    (list || []).forEach((implant) => {
      const key = buildImplantKey(implant);
      if (!map.has(key)) {
        map.set(key, implant);
      }
    });
  });
  return Array.from(map.values());
};

// Load implants with localStorage fallback
function loadImplantsWithFallback() {
  const raw = localStorage.getItem(IMPLANTS_KEY);
  
  if (!raw) {
    // First-time seed: use mockImplants (already has all fields including images)
    const seed = mockImplants.map((imp) => ({
      ...imp,
      status: imp.status || "Active"
    }));
    
    localStorage.setItem(IMPLANTS_KEY, JSON.stringify(seed));
    return seed;
        return merged;
  }
  
  try {
        return [];
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) {
      // Invalid format, reset to mockImplants
      const seed = mockImplants.map((imp) => ({
        ...imp,
        status: imp.status || "Active"
      }));
      localStorage.setItem(IMPLANTS_KEY, JSON.stringify(seed));
      return seed;
    }
    return arr;
    
  } catch {
    // Parse error, reset to mockImplants
    const seed = mockImplants.map((imp) => ({
      ...imp,
      status: imp.status || "Active"
    }));
    localStorage.setItem(IMPLANTS_KEY, JSON.stringify(seed));
    return seed;
  }
}

export default function ManageImplants() {
  const navigate = useNavigate();
  const location = useLocation();
  const [q, setQ] = useState("");
  const [rows, setRows] = useState([]);
  const [master, setMaster] = useState({ companies: [], levels: [], countries: [] });
  const [loading, setLoading] = useState(true);
  // Pagination state
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Initialize rows on mount
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const storedBeforeFetch = loadImplantsWithFallback();
      let apiImplants = [];
      try {
        const fetched = await implantsAPI.getAll();
        if (Array.isArray(fetched)) {
          apiImplants = fetched;
          console.log("✅ Loaded implants from backend API:", fetched.length);
        }
      } catch (apiErr) {
        console.warn("API call failed, will use local data as fallback:", apiErr);
      }

      const merged = dedupeImplants([
        apiImplants,
        storedBeforeFetch,
        mockImplants,
      ]);

      if (merged.length === 0) {
        console.warn("No implant data available after merge; using mock data");
        setRows([]);
        return [];
      }

      localStorage.setItem(IMPLANTS_KEY, JSON.stringify(merged));
      setRows(merged);
      return merged;
    } catch (err) {
      console.error('Error loading implants:', err);
      setRows([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();

    const handleStorageChange = (e) => {
      if (e.key === IMPLANTS_KEY) {
        loadData();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [loadData]);

  useEffect(() => {
    const params = new URLSearchParams(location.search || "");
    const qp = params.get("q") || "";
    if (qp) setQ(qp);
  }, [location.search]);

  useEffect(() => {
    async function load() {
      try {
        const [companies, levels, countries] = await Promise.all([
          masterDataAPI.getCompanies().catch(() => []),
          masterDataAPI.getLevels().catch(() => []),
          masterDataAPI.getCountries().catch(() => []),
        ]);
        
        setMaster({ companies, levels, countries });
      } catch (err) {
        console.error('Error loading master data:', err);
        setMaster({ companies: [], levels: [], countries: [] });
      }
    }
    load();
  }, []);

  // Save to localStorage whenever rows change
  useEffect(() => {
    localStorage.setItem(IMPLANTS_KEY, JSON.stringify(rows));
  }, [rows]);

  const getName = (type, id) => {
    if (!id) return "-";
    const list = type === "company" ? master.companies : type === "level" ? master.levels : master.countries;
    const found = list?.find((x) => Number(x.id) === Number(id));
    return found?.name || "-";
  };

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter((r) => {
      const companyName = getName("company", r.companyId) || "";
      const levelName = getName("level", r.levelId) || "";
      const countryName = getName("country", r.countryId) || r.countryText || "";
      return (r.name + " " + companyName + " " + levelName + " " + countryName).toLowerCase().includes(s);
    });
  }, [q, rows, master]);

  // Pagination logic
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1;
  const pagedRows = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, page]);

  const toggleStatus = async (id, current) => {
    try {
      const next = current === "Active" ? "Inactive" : "Active";
      await implantsAPI.update(id, { status: next });
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status: next } : r)));
    } catch (err) {
      alert("Failed to update status: " + (err.message || ""));
    }
  };

  const delImplant = async (id) => {
    const implant = rows.find((r) => r.id === id);
    const name = implant ? implant.name : "this implant";
    if (!confirm(`Delete "${name}"? This action cannot be undone.`)) return;
    try {
      await implantsAPI.delete(id);
      setRows((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      alert("Failed to delete: " + (err.message || ""));
    }
  };

  const refreshData = async () => {
    const merged = await loadData();
    const count = Array.isArray(merged) ? merged.length : rows.length;
    alert(`Refreshed! Loaded ${count} implants`);
  };

  if (loading) return <div className="impWrap">Loading implants…</div>;
  if (!rows || rows.length === 0) {
    return (
      <div className="impWrap">
        <h2>No implants found</h2>
        <p>Loading from localStorage failed. Check console for errors.</p>
        <button onClick={refreshData}>Try Refresh</button>
      </div>
    );
  }

  return (
    <div className="impWrap">
      <AdminSearchBar
        placeholder="Search implants…"
        value={q}
        onChangeQ={setQ}
        onSearch={setQ}
      />

      <Breadcrumb
        items={[
          { label: "Home", href: "/admin" },
          { label: "Implants Management" },
        ]}
      />
      <h2 className="pageTitle">🦷 Implants Management</h2>

      <div className="panelImp">
        <div className="panelHeadImp">
          <h3>Recently Added Implants ({filtered.length} total)</h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="addBtnImp" onClick={() => navigate("/admin/implants/new")}>
              + Add new implant
            </button>
            <button className="addBtnImp" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }} onClick={refreshData}>
              ⟳ Refresh
            </button>
          </div>
        </div>

        <div className="table">
          <div className="thead">
            <div className="imgCol">Image</div>
            <div>Name</div>
            <div>Company</div>
            <div>Level</div>
            <div>Country</div>
            <div>Status</div>
            <div className="actionsCol">Actions</div>
          </div>

          {pagedRows.map((r) => (
            <div className="trow" key={r.id}>
              <div className="imgCol" data-label="Image">
                {r.image1 ? (
                  <img 
                    src={r.image1.startsWith('data:') ? r.image1 : `http://localhost:5000${r.image1}`} 
                    alt={r.name} 
                    className="thumbImg"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                {!r.image1 || r.image1 === '' ? (
                  <div className="thumbPlaceholder">🖼️</div>
                ) : (
                  <div className="thumbPlaceholder" style={{ display: 'none' }}>🖼️</div>
                )}
              </div>
              <div
                className="nameCol cell"
                data-label="Implant"
                onClick={() => navigate(`/admin/implants/edit/${r.id}`)}
                style={{ cursor: "pointer" }}
              >
                {r.name}
              </div>
              <div className="cell" data-label="Company">
                {r.company || getName("company", r.companyId) || "-"}
              </div>
              <div className="cell" data-label="Level">
                {r.level || getName("level", r.levelId) || "-"}
              </div>
              <div className="cell" data-label="Country">
                {r.countryText || r.country || getName("country", r.countryId) || "-"}
              </div>
              <div className="statusCell cell" data-label="Status">
                <button
                  className={`pill status ${r.status === "Active" ? "on" : "off"}`}
                  onClick={() => toggleStatus(r.id, r.status)}
                >
                  {r.status === "Active" ? "Open" : "Closed"}
                </button>
              </div>
              <div className="actionsCol cell" data-label="Actions">
                <button className="btn edit" onClick={() => navigate(`/admin/implants/edit/${r.id}`)}>Edit</button>
                <button className="btn del" onClick={() => delImplant(r.id)}>Delete</button>
              </div>
            </div>
          ))}

          {filtered.length === 0 && <div className="empty">No implants found.</div>}
        </div>
        {/* Pagination */}
        {filtered.length > ITEMS_PER_PAGE && (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 16, marginTop: 20 }}>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{
                padding: "8px 20px",
                borderRadius: "999px",
                border: "none",
                background: page === 1 ? "#e5e7eb" : "linear-gradient(90deg, #6366f1 0%, #3b82f6 100%)",
                color: page === 1 ? "#9ca3af" : "#fff",
                fontWeight: 600,
                fontSize: "16px",
                boxShadow: page === 1 ? "none" : "0 2px 8px rgba(59,130,246,0.10)",
                cursor: page === 1 ? "not-allowed" : "pointer",
                transition: "all 0.2s"
              }}
              onMouseOver={e => { if (page !== 1) e.currentTarget.style.background = 'linear-gradient(90deg, #818cf8 0%, #2563eb 100%)'; }}
              onMouseOut={e => { if (page !== 1) e.currentTarget.style.background = 'linear-gradient(90deg, #6366f1 0%, #3b82f6 100%)'; }}
            >
              ← Previous
            </button>
            <span style={{ fontWeight: 500, fontSize: "16px", color: "#374151", letterSpacing: 0.5 }}>
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              style={{
                padding: "8px 20px",
                borderRadius: "999px",
                border: "none",
                background: page === totalPages ? "#e5e7eb" : "linear-gradient(90deg, #6366f1 0%, #3b82f6 100%)",
                color: page === totalPages ? "#9ca3af" : "#fff",
                fontWeight: 600,
                fontSize: "16px",
                boxShadow: page === totalPages ? "none" : "0 2px 8px rgba(59,130,246,0.10)",
                cursor: page === totalPages ? "not-allowed" : "pointer",
                transition: "all 0.2s"
              }}
              onMouseOver={e => { if (page !== totalPages) e.currentTarget.style.background = 'linear-gradient(90deg, #818cf8 0%, #2563eb 100%)'; }}
              onMouseOut={e => { if (page !== totalPages) e.currentTarget.style.background = 'linear-gradient(90deg, #6366f1 0%, #3b82f6 100%)'; }}
            >
              Next →
            </button>
          </div>
        )}
        </div>
      </div>
    
  );
}
