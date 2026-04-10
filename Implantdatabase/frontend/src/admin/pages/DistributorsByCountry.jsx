import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./MasterData.css";
import { loadMaster, saveMaster, getNameById } from "./masterDataStore.js";
import AdminSearchBar from "../components/AdminSearchBar.jsx";
import Breadcrumb from "../components/Breadcrumb.jsx";

export default function DistributorsByCountry() {
  const navigate = useNavigate();
  const { countryId } = useParams();
  const [q, setQ] = useState("");
  const [master, setMaster] = useState(loadMaster());

  useEffect(() => {
    const refresh = () => setMaster(loadMaster());
    refresh();
    window.addEventListener("focus", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("focus", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const countryName = getNameById("country", Number(countryId));
  const allDistributors = Array.isArray(master.officialDistributor) ? master.officialDistributor : [];
  
  const list = allDistributors.filter(x => x.countryId === Number(countryId));

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return list;
    return list.filter((x) => String(x.name || "").toLowerCase().includes(s));
  }, [q, list]);

  const delItem = (id) => {
    if (!confirm("Delete this distributor?")) return;
    const next = allDistributors.filter((x) => x.id !== id);
    const nextMaster = { ...master, officialDistributor: next };
    saveMaster(nextMaster);
    setMaster(nextMaster);
  };

  const toggleStatus = (id) => {
    const next = allDistributors.map((x) =>
      x.id === id
        ? { ...x, status: x.status === "Active" ? "Inactive" : "Active" }
        : x
    );
    const nextMaster = { ...master, officialDistributor: next };
    saveMaster(nextMaster);
    setMaster(nextMaster);
  };

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

      <div className="panelMd">
        <div className="panelHeadRow">
          <h3 className="panelTitle">Distributors in {countryName}</h3>
          <button className="addBtnMd" onClick={() => navigate(`/admin/master/officialDistributor/${countryId}/new`)}>
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
                  className={`pill status ${x.status === "Active" ? "on" : "off"}`}
                  onClick={() => toggleStatus(x.id)}
                  title={x.status === "Active" ? "Click to close" : "Click to open"}
                >
                  {x.status === "Active" ? "● Open" : "● Closed"}
                </button>
              </div>
              <div className="actionsCol">
                <button className="btn edit" onClick={() => navigate(`/admin/master/officialDistributor/${countryId}/edit/${x.id}`)}>
                  Edit
                </button>
                <button className="btn del" onClick={() => delItem(x.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}

          {filtered.length === 0 && <div className="empty">No distributors found in this country.</div>}
        </div>
      </div>
    </div>
  );
}
