import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./MasterData.css";
import { loadMaster, MASTER_TYPES } from "./masterDataStore.js";
import AdminSearchBar from "../components/AdminSearchBar.jsx";
import Breadcrumb from "../components/Breadcrumb.jsx";
import { masterDataAPI, brandAPI } from "../../services/api.js";

export default function MasterDataHome() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [master, setMaster] = useState(loadMaster());
  const [companyCount, setCompanyCount] = useState(0);
  const [brandCount, setBrandCount] = useState(0);
  const [countryCount, setCountryCount] = useState(0);
  const [distributorCount, setDistributorCount] = useState(0);
  const [showAddIntro, setShowAddIntro] = useState(false);
  const [addType, setAddType] = useState(null);

  useEffect(() => {
    const refresh = async () => {
      const localMaster = loadMaster();
      setMaster(localMaster);

      try {
        const [companies, brands, countries, distributors] = await Promise.all([
          masterDataAPI.getCompanies(),
          brandAPI.getAll(),
          masterDataAPI.getCountries(),
          masterDataAPI.getDistributors(),
        ]);

        setCompanyCount(Array.isArray(companies) ? companies.length : 0);
        setBrandCount(Array.isArray(brands) ? brands.length : 0);
        setCountryCount(Array.isArray(countries) ? countries.length : 0);
        setDistributorCount(Array.isArray(distributors) ? distributors.length : 0);
      } catch (err) {
        console.error(err);
        setCompanyCount(Array.isArray(localMaster.company) ? localMaster.company.length : 0);
        setBrandCount(Array.isArray(localMaster.brand) ? localMaster.brand.length : 0);
        setCountryCount(Array.isArray(localMaster.country) ? localMaster.country.length : 0);
        setDistributorCount(
          Array.isArray(localMaster.officialDistributor)
            ? localMaster.officialDistributor.length
            : 0
        );
      }
    };

    refresh();
    window.addEventListener("focus", refresh);
    window.addEventListener("storage", refresh);

    return () => {
      window.removeEventListener("focus", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();

    const list = MASTER_TYPES.map((t) => {
      let total = 0;

      if (t.key === "company") {
        total = companyCount;
      } else if (t.key === "brand") {
        total = brandCount;
      } else if (t.key === "country") {
        total = countryCount;
      } else if (t.key === "officialDistributor") {
        total = distributorCount;
      } else {
        total = Array.isArray(master[t.key]) ? master[t.key].length : 0;
      }

      return { ...t, total };
    });

    if (!s) return list;
    return list.filter((x) => x.label.toLowerCase().includes(s));
  }, [q, master, companyCount, brandCount, countryCount, distributorCount]);

  return (
    <div className="mdWrap">
      <AdminSearchBar
        placeholder="Search master data…"
        value={q}
        onChangeQ={setQ}
        onSearch={setQ}
      />

      <Breadcrumb
        items={[
          { label: "Home", href: "/admin" },
          { label: "Master Data Management" },
        ]}
      />

      <h2 className="pageTitle">Master Data Management</h2>

      <div className="panelMd">
        <h3 className="panelTitle">All Master Data Types</h3>

        <div className="mdTable">
          <div className="mdHead">
            <div>Name</div>
            <div>Total Items</div>
            <div className="actionsCol">Actions</div>
          </div>

          {rows.map((r) => (
            <div className="mdRow" key={r.key}>
              <div className="nameCell">{r.label}</div>
              <div className="totalCell">{r.total} item(s)</div>
              <div className="actionsCol">
                <button className="btn manage" onClick={() => navigate(`/admin/master/${r.key}`)}>
                  Manage
                </button>
                <button
                  className="btn ghost"
                  onClick={() => {
                    setAddType(r.key);
                    setShowAddIntro(true);
                  }}
                >
                  + Add
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showAddIntro && (
        <div className="modalOverlay" onClick={() => setShowAddIntro(false)}>
          <div className="modalCard" onClick={(e) => e.stopPropagation()}>
            <div className="modalHead">
              <h3 className="modalTitle">
                Add New {MASTER_TYPES.find((t) => t.key === addType)?.label || "Item"}
              </h3>
              <button className="modalClose" onClick={() => setShowAddIntro(false)}>×</button>
            </div>

            <div className="modalBody">
              <p className="modalText">Preview recent items to reduce duplicates before adding.</p>
              <div className="mdPreviewList">
                {(Array.isArray(master[addType]) ? master[addType].slice(0, 3) : []).map((x) => (
                  <div className="mdPreviewRow" key={x.id}>
                    <span className="dot" />
                    <div className="previewText">{x.name}</div>
                    <div className="statusTiny">{x.status === "Active" ? "Open" : "Closed"}</div>
                  </div>
                ))}
                {(!Array.isArray(master[addType]) || master[addType]?.length === 0) && (
                  <div className="empty">No items yet.</div>
                )}
              </div>
            </div>

            <div className="modalActions">
              <button
                className="btn save"
                onClick={() => navigate(`/admin/master/${addType}/new`)}
                disabled={!addType}
              >
                Continue
              </button>
              <button className="btn cancel" onClick={() => setShowAddIntro(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}