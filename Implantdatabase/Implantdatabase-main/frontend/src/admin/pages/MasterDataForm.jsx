import React, { useMemo, useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import "./MasterData.css";
import { getTypeLabel } from "./masterDataStore.js";
import AdminSearchBar from "../components/AdminSearchBar.jsx";
import Breadcrumb from "../components/Breadcrumb.jsx";
import { masterDataAPI, brandAPI } from "../../services/api.js";

export default function MasterDataForm({ mode }) {
  const navigate = useNavigate();
  const { type, id } = useParams();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get("returnTo") || `/admin/master/${type}`;
  const label = getTypeLabel(type);

  const [name, setName] = useState("");
  const [status, setStatus] = useState("Active");
  const [loading, setLoading] = useState(false);

  const canSave = useMemo(() => name.trim().length > 0, [name]);

  // ✅ โหลดข้อมูลตอน edit
  useEffect(() => {
    if (mode !== "edit" || !id) return;

    async function load() {
      try {
        setLoading(true);

        let data = null;

        if (type === "company") data = await masterDataAPI.getCompanies();
        if (type === "country") data = await masterDataAPI.getCountries();
        if (type === "level") data = await masterDataAPI.getLevels();
        if (type === "connectionType") data = await masterDataAPI.getConnectionTypes();
        if (type === "connectionShape") data = await masterDataAPI.getConnectionShapes();
        if (type === "headShape") data = await masterDataAPI.getHeadShapes();
        if (type === "bodyShape") data = await masterDataAPI.getBodyShapes();
        if (type === "apexShape") data = await masterDataAPI.getApexShapes();
        if (type === "screwdriverShape") data = await masterDataAPI.getScrewdriverShapes();
        if (type === "officialDistributor") data = await masterDataAPI.getDistributors();

        if (type === "brand") data = await brandAPI.getAll();

        const item = data?.find((x) => String(x.id) === String(id));

        if (item) {
          setName(item.name || "");
          setStatus(item.status || "Active");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [mode, id, type]);

  // ✅ map API
  const apiMap = {
    company: {
      create: masterDataAPI.createCompany,
      update: masterDataAPI.updateCompany,
    },
    country: {
      create: masterDataAPI.createCountry,
      update: masterDataAPI.updateCountry,
    },
    level: {
      create: masterDataAPI.createLevel,
      update: masterDataAPI.updateLevel,
    },
    connectionType: {
      create: masterDataAPI.createConnectionType,
      update: masterDataAPI.updateConnectionType,
    },
    connectionShape: {
      create: masterDataAPI.createConnectionShape,
      update: masterDataAPI.updateConnectionShape,
    },
    screwdriverShape: {
      create: masterDataAPI.createScrewdriverShape,
      update: masterDataAPI.updateScrewdriverShape,
    },
    headShape: {
      create: masterDataAPI.createHeadShape,
      update: masterDataAPI.updateHeadShape,
    },
    bodyShape: {
      create: masterDataAPI.createBodyShape,
      update: masterDataAPI.updateBodyShape,
    },
    apexShape: {
      create: masterDataAPI.createApexShape,
      update: masterDataAPI.updateApexShape,
    },
    officialDistributor: {
      create: masterDataAPI.createDistributor,
      update: masterDataAPI.updateDistributor,
    },
    brand: {
      create: brandAPI.create,
      update: brandAPI.update,
    },
  };

  const save = async () => {
    if (!canSave) return;

    try {
      setLoading(true);

      const payload = {
        name: name.trim(),
        status,
      };

      if (mode === "edit") {
        await apiMap[type].update(id, payload);
      } else {
        await apiMap[type].create(payload);
      }

      // ✅ กลับหน้า + refresh
      navigate(returnTo);
    } catch (err) {
      alert("Save failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mdWrap">
      <AdminSearchBar />

      <Breadcrumb
        items={[
          { label: "Home", href: "/admin" },
          { label: "Master Data", href: "/admin/master" },
          { label: `${label} Data`, href: returnTo },
          { label: mode === "edit" ? `Edit ${label}` : `New ${label}` },
        ]}
      />

      <h2 className="pageTitle">
        {mode === "edit" ? `Edit ${label}` : `New ${label}`}
      </h2>

      <div className="panelMd">
        <div className="formBox">
          <div className="field">
            <div className="label">Name</div>
            <input
              className="mdInput"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="field">
            <div className="label">Status</div>
            <select
              className="mdInput"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div className="formActions">
            <button
              className="btn save"
              onClick={save}
              disabled={!canSave || loading}
            >
              {loading ? "Saving..." : "Save"}
            </button>

            <button
              className="btn cancel"
              onClick={() => navigate(returnTo)}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}