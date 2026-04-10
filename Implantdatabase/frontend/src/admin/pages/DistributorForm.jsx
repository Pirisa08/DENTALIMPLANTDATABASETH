import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./MasterData.css";
import { loadMaster, saveMaster, getNameById } from "./masterDataStore.js";
import Breadcrumb from "../components/Breadcrumb.jsx";

export default function DistributorForm({ mode = "create" }) {
  const navigate = useNavigate();
  const { countryId, id } = useParams();
  const isEdit = mode === "edit" && !!id;

  const [master, setMaster] = useState(loadMaster());
  const [form, setForm] = useState(() => {
    if (isEdit) {
      const item = master.officialDistributor?.find((x) => String(x.id) === String(id));
      if (item) return { name: item.name, status: item.status };
    }
    return { name: "", status: "Active" };
  });

  const countryName = getNameById("country", Number(countryId));

  useEffect(() => {
    const refresh = () => setMaster(loadMaster());
    refresh();
  }, []);

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const save = () => {
    if (!form.name.trim()) {
      alert("Distributor name is required.");
      return;
    }

    let list = Array.isArray(master.officialDistributor) ? [...master.officialDistributor] : [];

    if (isEdit) {
      list = list.map((x) =>
        String(x.id) === String(id)
          ? { ...x, name: form.name.trim(), status: form.status }
          : x
      );
    } else {
      const nextId = list.reduce((max, x) => Math.max(max, Number(x.id) || 0), 0) + 1;
      const newItem = {
        id: nextId,
        countryId: Number(countryId),
        name: form.name.trim(),
        status: form.status,
      };
      list = [...list, newItem];
    }

    const nextMaster = { ...master, officialDistributor: list };
    saveMaster(nextMaster);
    navigate(`/admin/master/officialDistributor/${countryId}`);
  };

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
                  name="status"
                  checked={form.status === "Active"}
                  onChange={() => setField("status", "Active")}
                />
                Active
              </label>

              <label className="check">
                <input
                  type="radio"
                  name="status"
                  checked={form.status === "Inactive"}
                  onChange={() => setField("status", "Inactive")}
                />
                Inactive
              </label>
            </div>
          </div>

          <div className="formActions">
            <button className="btnSave" onClick={save}>
              {isEdit ? "Update" : "Save"}
            </button>
            <button className="btnCancel" onClick={() => navigate(`/admin/master/officialDistributor/${countryId}`)}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
