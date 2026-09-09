import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./MasterData.css";
import AdminSearchBar from "../components/AdminSearchBar.jsx";
import Breadcrumb from "../components/Breadcrumb.jsx";
import { masterDataAPI } from "../../services/api.js";
import { loadMaster, saveMaster } from "./masterDataStore.js";

export default function DistributorsByCountry() {
  const navigate = useNavigate();
  const { countryId } = useParams();

  const [q, setQ] = useState("");
  const [master, setMaster] = useState(loadMaster());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAll = async () => {
    try {
      setLoading(true);
      setError("");

      const [countries, distributors] = await Promise.all([
        masterDataAPI.getCountries(),
        masterDataAPI.getDistributors(),
      ]);

      const nextMaster = {
        ...loadMaster(),
        country: Array.isArray(countries) ? countries : [],
        officialDistributor: Array.isArray(distributors) ? distributors : [],
      };

      saveMaster(nextMaster);
      setMaster(nextMaster);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load distributors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, [countryId]);

  const countryName = useMemo(() => {
    const countries = Array.isArray(master.country) ? master.country : [];
    const found = countries.find((x) => String(x.id) === String(countryId));
    return found?.name || "N/A";
  }, [master, countryId]);

  const allDistributors = Array.isArray(master.officialDistributor)
    ? master.officialDistributor
    : [];

  const list = useMemo(() => {
    return allDistributors.filter(
      (x) => Number(x.countryId) === Number(countryId)
    );
  }, [allDistributors, countryId]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return list;
    return list.filter((x) =>
      `${x.name || ""} ${x.countryName || ""}`.toLowerCase().includes(s)
    );
  }, [q, list]);

  const delItem = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;

    try {
      await masterDataAPI.deleteDistributor(id);
      await loadAll();
      window.dispatchEvent(new Event("storage"));
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to delete distributor");
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      await masterDataAPI.updateDistributor(id, {
        countryId: Number(countryId),
        status: currentStatus === "Active" ? "Inactive" : "Active",
      });
      await loadAll();
      window.dispatchEvent(new Event("storage"));
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to update distributor status");
    }
  };

  if (loading) {
    return (
      <div className="mdWrap">
        <div className="empty">Loading...</div>
      </div>
    );
  }

  return (
    <div className="mdWrap">
      <AdminSearchBar
        placeholder="Search distributors…"
        value={q}
        onChangeQ={setQ}
        onSearch={setQ}
      />

      <Breadcrumb
        items={[
          { label: "Home", href: "/admin" },
          { label: "Master Data", href: "/admin/master" },
          { label: "Official Distributor", href: "/admin/master/officialDistributor" },
          { label: countryName },
        ]}
      />

      <h2 className="pageTitle">Official Distributors in {countryName}</h2>
      {error && <div className="empty" style={{ color: "#dc3545" }}>{error}</div>}

      <div className="panelMd">
        <div className="panelHeadRow">
          <h3 className="panelTitle">Distributors in {countryName}</h3>
          <button
            className="addBtnMd"
            onClick={() => navigate(`/admin/master/officialDistributor/${countryId}/new`)}
          >
            + Add Distributor
          </button>
        </div>

        <div className="mdTable">
          <div className="mdHead detail">
            <div>ID</div>
            <div>Distributor Name</div>
            <div>Status</div>
            <div className="actionsCol">Actions</div>
          </div>

          {filtered.map((x, idx) => (
            <div className="mdRow detail" key={x.id}>
              <div>{idx + 1}</div>
              <div className="nameCell">{x.name}</div>
              <div className="statusCell">
                <button
                  className={`statusPill ${x.status === "Active" ? "on" : "off"}`}
                  onClick={() => toggleStatus(x.id, x.status)}
                  title={x.status === "Active" ? "Click to close" : "Click to open"}
                >
                  <span className="statusDot" />
                  {x.status === "Active" ? "Open" : "Closed"}
                </button>
              </div>
              <div className="actionsCol">
                <button
                  className="btn edit"
                  onClick={() =>
                    navigate(`/admin/master/officialDistributor/${countryId}/edit/${x.id}`)
                  }
                >
                  Edit
                </button>
                <button
                  className="btn del"
                  onClick={() => delItem(x.id, x.name)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="empty">No distributors found in this country.</div>
          )}
        </div>
      </div>
    </div>
  );
}