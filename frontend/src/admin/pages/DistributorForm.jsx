import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./MasterData.css";
import Breadcrumb from "../components/Breadcrumb.jsx";
import { masterDataAPI } from "../../services/api.js";
import { loadMaster, saveMaster } from "./masterDataStore.js";

export default function DistributorForm({ mode = "create" }) {
  const navigate = useNavigate();
  const { countryId, id } = useParams();
  const isEdit = mode === "edit" && !!id;

  const [master, setMaster] = useState(loadMaster());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    status: "Active",
  });

  const countryName = useMemo(() => {
    const countries = Array.isArray(master.country) ? master.country : [];
    const found = countries.find((x) => String(x.id) === String(countryId));
    return found?.name || "N/A";
  }, [master, countryId]);

  useEffect(() => {
    async function boot() {
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

        if (isEdit) {
          const item = (nextMaster.officialDistributor || []).find(
            (x) => String(x.id) === String(id)
          );

          if (item) {
            setForm({
              name: item.name || "",
              status: item.status || "Active",
            });
          }
        }
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to load distributor form");
      } finally {
        setLoading(false);
      }
    }

    boot();
  }, [id, isEdit, countryId]);

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const refreshDistributorsToLocal = async () => {
    const distributors = await masterDataAPI.getDistributors();
    const current = loadMaster();
    const nextMaster = {
      ...current,
      officialDistributor: Array.isArray(distributors) ? distributors : [],
    };
    saveMaster(nextMaster);
    setMaster(nextMaster);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      alert("Distributor name is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        name: form.name.trim(),
        status: form.status,
        countryId: Number(countryId),
      };

      if (isEdit) {
        await masterDataAPI.updateDistributor(id, payload);
      } else {
        await masterDataAPI.createDistributor(payload);
      }

      await refreshDistributorsToLocal();
      window.dispatchEvent(new Event("storage"));
      navigate(`/admin/master/officialDistributor/${countryId}`);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to save distributor");
      alert(err.message || "Failed to save distributor");
    } finally {
      setSaving(false);
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
      <Breadcrumb
        items={[
          { label: "Home", href: "/admin" },
          { label: "Master Data", href: "/admin/master" },
          { label: "Official Distributor", href: "/admin/master/officialDistributor" },
          { label: countryName, href: `/admin/master/officialDistributor/${countryId}` },
          { label: isEdit ? "Edit Distributor" : "New Distributor" },
        ]}
      />

      <h2 className="pageTitle">{isEdit ? "✏️ Edit" : "➕ Add"} Distributor</h2>

      {error && <div className="empty" style={{ color: "#dc3545" }}>{error}</div>}

      <div className="formCard">
        <div className="formGrid">
          <div className="formField">
            <label className="formLabel">Country</label>
            <input className="formInput" value={countryName} disabled />
          </div>

          <div className="formField">
            <label className="formLabel">Distributor Name</label>
            <input
              className="formInput"
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
              placeholder="Enter distributor name"
            />
          </div>

            <div className="formField">
              <label className="formLabel">Status</label>
              <div className="statusPick">
                <label className="check">
                  <input
                    type="radio"
                    name="status-radio"
                    value="Active"
                    checked={form.status === "Active"}
                    onChange={e => setField("status", e.target.value)}
                  />
                  Active
                </label>

                <label className="check">
                  <input
                    type="radio"
                    name="status-radio"
                    value="Inactive"
                    checked={form.status === "Inactive"}
                    onChange={e => setField("status", e.target.value)}
                  />
                  Inactive
                </label>
              </div>
            </div>

          <div className="formActions">
            <button className="btnSave" onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : isEdit ? "Update" : "Save"}
            </button>
            <button
              className="btnCancel"
              onClick={() => navigate(`/admin/master/officialDistributor/${countryId}`)}
              disabled={saving}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}