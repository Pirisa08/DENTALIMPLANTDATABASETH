import React, { useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import "./MasterData.css";
import { getTypeLabel, loadMaster, saveMaster } from "./masterDataStore.js";
import AdminSearchBar from "../components/AdminSearchBar.jsx";
import Breadcrumb from "../components/Breadcrumb.jsx";

export default function MasterDataForm({ mode }) {
  const navigate = useNavigate();
  const { type, id } = useParams();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get("returnTo") || `/admin/master/${type}`;
  const brandId = searchParams.get("brandId");
  const label = getTypeLabel(type);

  const master = loadMaster();
  const list = Array.isArray(master[type]) ? master[type] : [];
  const editing = mode === "edit" ? list.find((x) => String(x.id) === String(id)) : null;

  const [name, setName] = useState(editing?.name || "");
  const [status, setStatus] = useState(editing?.status || "Active");
  const [modelCount, setModelCount] = useState(editing?.modelCount || 0);
  const [q, setQ] = useState("");

  const canSave = useMemo(() => name.trim().length > 0, [name]);

  const save = () => {
    if (!canSave) return;

    if (mode === "edit") {
      if (!editing) {
        alert("Item not found");
        navigate(`/admin/master/${type}`);
        return;
      }
      const next = list.map((x) => 
        String(x.id) === String(id) 
          ? { 
              ...x, 
              name: name.trim(), 
              status, 
              ...(type === 'brand' && { modelCount: parseInt(modelCount) || 0 }),
              ...(type === 'model' && brandId && { brandId: parseInt(brandId) })
            }
          : x
      );
      const nextMaster = { ...master, [type]: next };
      saveMaster(nextMaster);
      navigate(returnTo);
      return;
    }

    const newItem = { 
      id: Date.now(), 
      name: name.trim(), 
      status, 
      ...(type === 'brand' && { modelCount: parseInt(modelCount) || 0 }),
      ...(type === 'model' && brandId && { brandId: parseInt(brandId) })
    };
    const nextMaster = { ...master, [type]: [newItem, ...list] };
    saveMaster(nextMaster);
    
    // ✅ รีโหลดหน้า เพื่อให้เห็นข้อมูลใหม่ทันที
    setTimeout(() => {
      window.location.href = returnTo;
    }, 300);
  };

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
          { label: "Master Data", href: "/admin/master" },
          { label: `${label} Data`, href: returnTo },
          { label: mode === "edit" ? `Edit ${label}` : `New ${label}` },
        ]}
      />

      <h2 className="pageTitle">{mode === "edit" ? `Edit ${label} Data` : `New ${label} Data`}</h2>

      <div className="panelMd">
        <div className="formBox">
          <div className="field">
            <div className="label">Name</div>
            <input className="mdInput" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
          </div>

          <div className="field">
            <div className="label">Status</div>
            <div className="statusPick">
              <label className="check">
                <input
                  type="radio"
                  name="status"
                  checked={status === "Active"}
                  onChange={() => setStatus("Active")}
                />
                Active
              </label>

              <label className="check">
                <input
                  type="radio"
                  name="status"
                  checked={status === "Inactive"}
                  onChange={() => setStatus("Inactive")}
                />
                Inactive
              </label>
            </div>
          </div>

          {type === 'brand' && (
            <div className="field">
              <div className="label">Number of Models</div>
              <input 
                className="mdInput" 
                type="number" 
                min="0" 
                value={modelCount} 
                onChange={(e) => setModelCount(e.target.value)} 
                placeholder="e.g., 4"
              />
            </div>
          )}

          <div className="formActions">
            <button className="btn save" onClick={save} disabled={!canSave}>
              Save
            </button>
            <button className="btn cancel" onClick={() => navigate(returnTo)}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
