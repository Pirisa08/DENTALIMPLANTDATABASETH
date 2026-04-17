import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./NewImplant.css";
import AdminSearchBar from "../components/AdminSearchBar.jsx";
import Breadcrumb from "../components/Breadcrumb.jsx";
import {
  implantsAPI,
  masterDataAPI,
  brandAPI,
  resolveImageUrl,
} from "../../services/api.js";
import { loadMaster, saveMaster } from "./masterDataStore.js";

const IMPLANTS_KEY = "admin_implants_v1";
const IMPLANTS_UPDATED_EVENT = "implants:updated";
const MASTER_DATA_UPDATED_EVENT = "master-data:updated";

export default function NewImplant() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const isMasterEdit = String(id || "").startsWith("master-");

  const [masterData, setMasterData] = useState({
    companies: [],
    brands: [],
    levels: [],
    countries: [],
    connectionTypes: [],
    connectionShapes: [],
    screwdriverShapes: [],
    headShapes: [],
    bodyShapes: [],
    apexShapes: [],
    officialDistributors: [],
  });

  const [, setMasterLocal] = useState(loadMaster());

  const [form, setForm] = useState({
    name: "",
    brand: "",
    slug: "",
    companyId: null,
    levelId: null,
    countryId: null,
    countryText: "",
    website: "",
    brandDescription: "",
    connectionType: "",
    connectionShape: "",
    screwdriverShape: "",
    headShape: "",
    bodyShape: "",
    apexShape: "",
    officialDistributor: "",
    status: "Active",
  });

  const [imageFiles, setImageFiles] = useState({
    image1: null,
    image2: null,
    image3: null,
  });

  const [imagePreviews, setImagePreviews] = useState({
    image1: "",
    image2: "",
    image3: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saveError, setSaveError] = useState("");
  const fileInputs = useRef({});

  const syncMasterLocal = (nextPartial) => {
    const current = loadMaster();
    const nextMaster = {
      ...current,
      ...nextPartial,
    };
    saveMaster(nextMaster);
    setMasterLocal(nextMaster);
    window.dispatchEvent(new Event("storage"));
    window.dispatchEvent(new Event(MASTER_DATA_UPDATED_EVENT));
    return nextMaster;
  };

  const sanitizeFkList = (arr) =>
    Array.isArray(arr)
      ? arr.filter(
          (item) => item && item.id && item.name && item.status !== "Inactive"
        )
      : [];

  const sanitizeBrandList = (arr) =>
    Array.isArray(arr)
      ? arr
          .map((item) => ({
            id: item.id ?? item.idbrand,
            name: item.name ?? item.brand_name ?? "",
            companyId: item.companyId ?? item.manufacturer_id ?? null,
            companyName: item.companyName || "",
            website: item.website || "",
            status: item.status || "Active",
          }))
          .filter(
            (item) =>
              item && item.id && item.name && item.status !== "Inactive"
          )
      : [];

  const sanitizeTextList = (arr) =>
    Array.isArray(arr)
      ? arr.filter(
          (item) => item && item.name && item.status !== "Inactive"
        )
      : [];

  const loadAllMasterData = async () => {
    const [
      apiCompanies,
      apiBrands,
      apiLevels,
      apiCountries,
      apiConnectionTypes,
      apiConnectionShapes,
      apiScrewdriverShapes,
      apiHeadShapes,
      apiBodyShapes,
      apiApexShapes,
      apiOfficialDistributors,
    ] = await Promise.all([
      masterDataAPI.getCompanies().catch(() => []),
      brandAPI.getAll().catch(() => []),
      masterDataAPI.getLevels().catch(() => []),
      masterDataAPI.getCountries().catch(() => []),
      masterDataAPI.getConnectionTypes().catch(() => []),
      masterDataAPI.getConnectionShapes().catch(() => []),
      masterDataAPI.getScrewdriverShapes().catch(() => []),
      masterDataAPI.getHeadShapes().catch(() => []),
      masterDataAPI.getBodyShapes().catch(() => []),
      masterDataAPI.getApexShapes().catch(() => []),
      masterDataAPI.getDistributors().catch(() => []),
    ]);

    const mergedMasterData = {
      companies: sanitizeFkList(apiCompanies),
      brands: sanitizeBrandList(apiBrands),
      levels: sanitizeFkList(apiLevels),
      countries: sanitizeFkList(apiCountries),
      connectionTypes: sanitizeTextList(apiConnectionTypes),
      connectionShapes: sanitizeTextList(apiConnectionShapes),
      screwdriverShapes: sanitizeTextList(apiScrewdriverShapes),
      headShapes: sanitizeTextList(apiHeadShapes),
      bodyShapes: sanitizeTextList(apiBodyShapes),
      apexShapes: sanitizeTextList(apiApexShapes),
      officialDistributors: sanitizeTextList(apiOfficialDistributors),
    };

    setMasterData(mergedMasterData);

    syncMasterLocal({
      company: mergedMasterData.companies,
      brand: mergedMasterData.brands,
      level: mergedMasterData.levels,
      country: mergedMasterData.countries,
      connectionType: mergedMasterData.connectionTypes,
      connectionShape: mergedMasterData.connectionShapes,
      screwdriverShape: mergedMasterData.screwdriverShapes,
      headShape: mergedMasterData.headShapes,
      bodyShape: mergedMasterData.bodyShapes,
      apexShape: mergedMasterData.apexShapes,
      officialDistributor: mergedMasterData.officialDistributors,
    });

    return mergedMasterData;
  };

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError("");

        await loadAllMasterData();

        if (isEdit) {
          const apiImplant = await implantsAPI.getById(id);

          if (apiImplant) {
            setForm({
              name: apiImplant.name || "",
              brand: apiImplant.brand || "",
              slug: apiImplant.slug || "",
              companyId: apiImplant.companyId || null,
              levelId: apiImplant.levelId || null,
              countryId: apiImplant.countryId || null,
              countryText: apiImplant.countryText || "",
              website: apiImplant.website || "",
              brandDescription: apiImplant.brandDescription || "",
              connectionType: apiImplant.connectionType || "",
              connectionShape: apiImplant.connectionShape || "",
              screwdriverShape: apiImplant.screwdriverShape || "",
              headShape: apiImplant.headShape || "",
              bodyShape: apiImplant.bodyShape || "",
              apexShape: apiImplant.apexShape || "",
              officialDistributor: apiImplant.officialDistributor || "",
              status: apiImplant.status || "Active",
            });

            setImagePreviews({
              image1: resolveImageUrl(apiImplant.image1),
              image2: resolveImageUrl(apiImplant.image2),
              image3: resolveImageUrl(apiImplant.image3),
            });
          }
        }
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to load form");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id, isEdit]);

  const setField = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));

  const canSave = useMemo(() => {
    return (
      form.name.trim() &&
      Number(form.companyId) > 0 &&
      Number(form.levelId) > 0 &&
      (Number(form.countryId) > 0 || form.countryText.trim())
    );
  }, [form]);

  const filteredBrands = useMemo(() => {
    if (!form.companyId || !masterData.brands) return [];
    return masterData.brands.filter(
      (b) =>
        Number(b.companyId) === Number(form.companyId) &&
        b.status !== "Inactive"
    );
  }, [form.companyId, masterData.brands]);

  const connectionTypes = useMemo(
    () => masterData.connectionTypes || [],
    [masterData.connectionTypes]
  );
  const connectionShapes = useMemo(
    () => masterData.connectionShapes || [],
    [masterData.connectionShapes]
  );
  const screwdriverShapes = useMemo(
    () => masterData.screwdriverShapes || [],
    [masterData.screwdriverShapes]
  );
  const headShapes = useMemo(
    () => masterData.headShapes || [],
    [masterData.headShapes]
  );
  const bodyShapes = useMemo(
    () => masterData.bodyShapes || [],
    [masterData.bodyShapes]
  );
  const apexShapes = useMemo(
    () => masterData.apexShapes || [],
    [masterData.apexShapes]
  );
  const officialDistributors = useMemo(
    () => masterData.officialDistributors || [],
    [masterData.officialDistributors]
  );

  const onPickImage = (key, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFiles((prev) => ({
      ...prev,
      [key]: file,
    }));

    const previewUrl = URL.createObjectURL(file);
    setImagePreviews((prev) => ({
      ...prev,
      [key]: previewUrl,
    }));
  };

  const openPicker = (key) => {
    const el = fileInputs.current[key];
    if (el) el.click();
  };

  const removeImage = (key) => {
    setImageFiles((prev) => ({
      ...prev,
      [key]: null,
    }));

    setImagePreviews((prev) => ({
      ...prev,
      [key]: "",
    }));

    const input = fileInputs.current[key];
    if (input) input.value = "";
  };

  const addFkOption = async (type) => {
    const labelMap = {
      levels: "Level",
      companies: "Company",
      countries: "Country",
    };

    const fieldMap = {
      levels: "levelId",
      companies: "companyId",
      countries: "countryId",
    };

    const apiMap = {
      levels: masterDataAPI.createLevel,
      companies: masterDataAPI.createCompany,
      countries: masterDataAPI.createCountry,
    };

    const value = window.prompt(`Enter new ${labelMap[type]} name:`);
    if (!value || !value.trim()) return;

    try {
      const created = await apiMap[type]({
        name: value.trim(),
        status: "Active",
      });

      if (!created?.id) {
        throw new Error(`Create ${labelMap[type]} failed`);
      }

      setMasterData((prev) => ({
        ...prev,
        [type]: [created, ...(prev[type] || [])],
      }));

      syncMasterLocal({
        [type === "levels"
          ? "level"
          : type === "companies"
          ? "company"
          : "country"]: [
          created,
          ...((loadMaster()?.[
            type === "levels"
              ? "level"
              : type === "companies"
              ? "company"
              : "country"
          ]) || []),
        ],
      });

      setField(fieldMap[type], Number(created.id));
      alert(`Added ${labelMap[type]} successfully`);
    } catch (err) {
      alert(`Failed to add ${labelMap[type]}: ${err.message}`);
    }
  };

  const addBrand = async () => {
    if (!form.companyId) {
      alert("Please select Company first");
      return;
    }

    const brandName = window.prompt("Enter new Brand name:");
    if (!brandName || !brandName.trim()) return;

    const website = window.prompt("Enter website (optional):", "") || "";

    try {
      const created = await brandAPI.create({
        name: brandName.trim(),
        companyId: Number(form.companyId),
        website,
        status: "Active",
      });

      const brandItem = {
        id: created?.id ?? created?.idbrand,
        name: created?.name ?? created?.brand_name ?? brandName.trim(),
        companyId:
          created?.companyId ??
          created?.manufacturer_id ??
          Number(form.companyId),
        companyName: created?.companyName || "",
        website: created?.website || website,
        status: created?.status || "Active",
      };

      setMasterData((prev) => ({
        ...prev,
        brands: [brandItem, ...(prev.brands || [])],
      }));

      syncMasterLocal({
        brand: [brandItem, ...((loadMaster()?.brand) || [])],
      });

      setField("brand", brandItem.name);
      alert(`Added Brand "${brandItem.name}" successfully`);
    } catch (err) {
      alert(`Failed to add Brand: ${err.message}`);
    }
  };

  const addTextMasterOption = async ({
    label,
    stateKey,
    localKey,
    fieldName,
    createApi,
  }) => {
    const value = window.prompt(`Enter new ${label} name:`);
    if (!value || !value.trim()) return;

    try {
      const created = await createApi({
        name: value.trim(),
        status: "Active",
      });

      if (!created?.id && !created?.name) {
        throw new Error(`Create ${label} failed`);
      }

      const item = {
        id: created.id,
        name: created.name,
        status: created.status || "Active",
      };

      setMasterData((prev) => ({
        ...prev,
        [stateKey]: [item, ...(prev[stateKey] || [])],
      }));

      syncMasterLocal({
        [localKey]: [item, ...((loadMaster()?.[localKey]) || [])],
      });

      setField(fieldName, item.name);
      alert(`Added ${label} successfully`);
    } catch (err) {
      alert(`Failed to add ${label}: ${err.message}`);
    }
  };

  const addConnectionType = () =>
    addTextMasterOption({
      label: "Connection Type",
      stateKey: "connectionTypes",
      localKey: "connectionType",
      fieldName: "connectionType",
      createApi: masterDataAPI.createConnectionType,
    });

  const addConnectionShape = () =>
    addTextMasterOption({
      label: "Connection Shape",
      stateKey: "connectionShapes",
      localKey: "connectionShape",
      fieldName: "connectionShape",
      createApi: masterDataAPI.createConnectionShape,
    });

  const addScrewdriverShape = () =>
    addTextMasterOption({
      label: "Screwdriver Shape",
      stateKey: "screwdriverShapes",
      localKey: "screwdriverShape",
      fieldName: "screwdriverShape",
      createApi: masterDataAPI.createScrewdriverShape,
    });

  const addHeadShape = () =>
    addTextMasterOption({
      label: "Head Shape",
      stateKey: "headShapes",
      localKey: "headShape",
      fieldName: "headShape",
      createApi: masterDataAPI.createHeadShape,
    });

  const addBodyShape = () =>
    addTextMasterOption({
      label: "Body Shape",
      stateKey: "bodyShapes",
      localKey: "bodyShape",
      fieldName: "bodyShape",
      createApi: masterDataAPI.createBodyShape,
    });

  const addApexShape = () =>
    addTextMasterOption({
      label: "Apex Shape",
      stateKey: "apexShapes",
      localKey: "apexShape",
      fieldName: "apexShape",
      createApi: masterDataAPI.createApexShape,
    });

  const addOfficialDistributor = () =>
    addTextMasterOption({
      label: "Official Distributor",
      stateKey: "officialDistributors",
      localKey: "officialDistributor",
      fieldName: "officialDistributor",
      createApi: masterDataAPI.createDistributor,
    });

  const save = async () => {
    if (isMasterEdit) {
      setSaveError("Master implant edit is still locked in this form");
      return;
    }

    if (!canSave) {
      setSaveError("Please fill all required fields");
      return;
    }

    const validCompany = masterData.companies.some(
      (c) => Number(c.id) === Number(form.companyId)
    );
    const validLevel = masterData.levels.some(
      (l) => Number(l.id) === Number(form.levelId)
    );
    const validCountry =
      !form.countryId ||
      masterData.countries.some((c) => Number(c.id) === Number(form.countryId));

    if (!validCompany) {
      setSaveError("Selected Company does not exist in companies table");
      return;
    }

    if (!validLevel) {
      setSaveError("Selected Level does not exist in levels table");
      return;
    }

    if (!validCountry) {
      setSaveError("Selected Country does not exist in countries table");
      return;
    }

    try {
      setSaving(true);
      setSaveError("");

      const payload = {
        ...form,
        companyId: Number(form.companyId),
        levelId: Number(form.levelId),
        countryId: form.countryId ? Number(form.countryId) : null,
        image1: imageFiles.image1,
        image2: imageFiles.image2,
        image3: imageFiles.image3,
      };

      const apiResult = isEdit
        ? await implantsAPI.update(id, payload)
        : await implantsAPI.create(payload);

      const localRaw = localStorage.getItem(IMPLANTS_KEY);
      let implants = [];

      try {
        implants = localRaw ? JSON.parse(localRaw) : [];
        if (!Array.isArray(implants)) implants = [];
      } catch {
        implants = [];
      }

      const updated = isEdit
        ? implants.map((imp) =>
            String(imp.id) === String(id) ? apiResult : imp
          )
        : [apiResult, ...implants];

      localStorage.setItem(IMPLANTS_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event(IMPLANTS_UPDATED_EVENT));
      navigate("/admin/implants");
    } catch (err) {
      console.error("Save failed:", err);
      setSaveError(err.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="newImpWrap">Loading…</div>;
  if (error) return <div className="newImpWrap">Error: {error}</div>;

  return (
    <div className="newImpWrap">
      <AdminSearchBar placeholder="Search implants…" />
      <Breadcrumb
        items={[
          { label: "Home", href: "/admin" },
          { label: "Implants", href: "/admin/implants" },
          { label: isEdit ? "Edit Implant" : "New Implant" },
        ]}
      />

      <h2 className="pageTitle">
        {isEdit ? "Edit" : "New"} Implant
        {isMasterEdit ? " (Master locked)" : ""}
      </h2>

      {saveError && (
        <div className="saveWarning" role="alert">
          {saveError}
        </div>
      )}

      <div className="newGrid">
        <div className="imgCard">
          {["image1", "image2", "image3"].map((key, idx) => {
            const current = imagePreviews[key];

            return (
              <div className="imgField" key={key}>
                <div
                  className="imgBox"
                  onClick={() => openPicker(key)}
                  style={{ cursor: "pointer", position: "relative" }}
                >
                  {current ? (
                    <img
                      className="preview"
                      src={current}
                      alt={`preview ${idx + 1}`}
                    />
                  ) : (
                    <div className="placeholder">
                      <div className="phIcon">🖼️</div>
                      <div className="phText">Add image {idx + 1}</div>
                    </div>
                  )}

                  <div className="imgActions">
                    <button
                      type="button"
                      className="imgBtn"
                      onClick={(e) => {
                        e.stopPropagation();
                        openPicker(key);
                      }}
                    >
                      Change
                    </button>

                    {current && (
                      <button
                        type="button"
                        className="imgBtn danger"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImage(key);
                        }}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>

                <input
                  ref={(el) => (fileInputs.current[key] = el)}
                  type="file"
                  accept="image/*"
                  onChange={(e) => onPickImage(key, e)}
                  hidden
                />
              </div>
            );
          })}
        </div>

        <div className="formCard">
          <div className="twoCol">
            <Field label="Name">
              <input
                className="input"
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
                placeholder="Name"
              />
            </Field>

            <Field label="Brand">
              {form.companyId ? (
                <div className="selectRow">
                  <select
                    className="input"
                    value={form.brand || ""}
                    onChange={(e) => setField("brand", e.target.value)}
                  >
                    <option value="">Choose Brand</option>
                    {filteredBrands.map((b) => (
                      <option key={b.id} value={b.name}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="btnAddOption"
                    onClick={addBrand}
                  >
                    + Add
                  </button>
                </div>
              ) : (
                <div className="note">⚠️ Please select Company first</div>
              )}
            </Field>

            <Field label="Slug">
              <input
                className="input"
                value={form.slug}
                onChange={(e) => setField("slug", e.target.value)}
                placeholder="Slug"
              />
            </Field>

            <Field label="Level">
              <div className="selectRow">
                <select
                  className="input"
                  value={form.levelId || ""}
                  onChange={(e) =>
                    setField(
                      "levelId",
                      e.target.value ? Number(e.target.value) : null
                    )
                  }
                >
                  <option value="">Choose Level</option>
                  {masterData.levels.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="btnAddOption"
                  onClick={() => addFkOption("levels")}
                >
                  + Add
                </button>
              </div>
            </Field>

            <Field label="Company">
              <div className="selectRow">
                <select
                  className="input"
                  value={form.companyId || ""}
                  onChange={(e) =>
                    setField(
                      "companyId",
                      e.target.value ? Number(e.target.value) : null
                    )
                  }
                >
                  <option value="">Choose Company</option>
                  {masterData.companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="btnAddOption"
                  onClick={() => addFkOption("companies")}
                >
                  + Add
                </button>
              </div>
            </Field>

            <Field label="Country (select)">
              <div className="selectRow">
                <select
                  className="input"
                  value={form.countryId || ""}
                  onChange={(e) =>
                    setField(
                      "countryId",
                      e.target.value ? Number(e.target.value) : null
                    )
                  }
                >
                  <option value="">Choose Country</option>
                  {masterData.countries.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="btnAddOption"
                  onClick={() => addFkOption("countries")}
                >
                  + Add
                </button>
              </div>
            </Field>

            <Field label="Country (text, optional)">
              <input
                className="input"
                value={form.countryText}
                onChange={(e) => setField("countryText", e.target.value)}
                placeholder="Headquarters / Manufacturer"
              />
            </Field>

            <Field label="Website">
              <input
                className="input"
                value={form.website}
                onChange={(e) => setField("website", e.target.value)}
                placeholder="https://"
              />
            </Field>

            <Field label="Brand Description">
              <textarea
                className="input"
                value={form.brandDescription}
                onChange={(e) => setField("brandDescription", e.target.value)}
                placeholder="Brand description"
              />
            </Field>

            <Field label="Connection Type">
              <div className="selectRow">
                <select
                  className="input"
                  value={form.connectionType || ""}
                  onChange={(e) => setField("connectionType", e.target.value)}
                >
                  <option value="">Choose Connection Type</option>
                  {connectionTypes.map((opt) => (
                    <option key={opt.id} value={opt.name}>
                      {opt.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="btnAddOption"
                  onClick={addConnectionType}
                >
                  + Add
                </button>
              </div>
            </Field>

            <Field label="Connection Shape">
              <div className="selectRow">
                <select
                  className="input"
                  value={form.connectionShape || ""}
                  onChange={(e) => setField("connectionShape", e.target.value)}
                >
                  <option value="">Choose Connection Shape</option>
                  {connectionShapes.map((opt) => (
                    <option key={opt.id} value={opt.name}>
                      {opt.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="btnAddOption"
                  onClick={addConnectionShape}
                >
                  + Add
                </button>
              </div>
            </Field>

            <Field label="Screwdriver Shape">
              <div className="selectRow">
                <select
                  className="input"
                  value={form.screwdriverShape || ""}
                  onChange={(e) => setField("screwdriverShape", e.target.value)}
                >
                  <option value="">Choose Screwdriver Shape</option>
                  {screwdriverShapes.map((opt) => (
                    <option key={opt.id} value={opt.name}>
                      {opt.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="btnAddOption"
                  onClick={addScrewdriverShape}
                >
                  + Add
                </button>
              </div>
            </Field>

            <Field label="Head Shape">
              <div className="selectRow">
                <select
                  className="input"
                  value={form.headShape || ""}
                  onChange={(e) => setField("headShape", e.target.value)}
                >
                  <option value="">Choose Head Shape</option>
                  {headShapes.map((opt) => (
                    <option key={opt.id} value={opt.name}>
                      {opt.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="btnAddOption"
                  onClick={addHeadShape}
                >
                  + Add
                </button>
              </div>
            </Field>

            <Field label="Body Shape">
              <div className="selectRow">
                <select
                  className="input"
                  value={form.bodyShape || ""}
                  onChange={(e) => setField("bodyShape", e.target.value)}
                >
                  <option value="">Choose Body Shape</option>
                  {bodyShapes.map((opt) => (
                    <option key={opt.id} value={opt.name}>
                      {opt.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="btnAddOption"
                  onClick={addBodyShape}
                >
                  + Add
                </button>
              </div>
            </Field>

            <Field label="Apex Shape">
              <div className="selectRow">
                <select
                  className="input"
                  value={form.apexShape || ""}
                  onChange={(e) => setField("apexShape", e.target.value)}
                >
                  <option value="">Choose Apex Shape</option>
                  {apexShapes.map((opt) => (
                    <option key={opt.id} value={opt.name}>
                      {opt.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="btnAddOption"
                  onClick={addApexShape}
                >
                  + Add
                </button>
              </div>
            </Field>

            <Field label="Official Distributor">
              <div className="selectRow">
                <select
                  className="input"
                  value={form.officialDistributor || ""}
                  onChange={(e) =>
                    setField("officialDistributor", e.target.value)
                  }
                >
                  <option value="">Choose Distributor</option>
                  {officialDistributors.map((opt) => (
                    <option key={opt.id} value={opt.name}>
                      {opt.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="btnAddOption"
                  onClick={addOfficialDistributor}
                >
                  + Add
                </button>
              </div>
            </Field>

            <Field label="Status">
              <select
                className="input"
                value={form.status}
                onChange={(e) => setField("status", e.target.value)}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </Field>
          </div>

          <div className="formActions">
            <button
              className="btnSave"
              onClick={save}
              disabled={!canSave || saving}
            >
              {saving ? "Saving…" : isEdit ? "Save Changes" : "Create Implant"}
            </button>
            <button
              className="btnCancel"
              onClick={() => navigate("/admin/implants")}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="field">
      <div className="label">{label}</div>
      {children}
    </div>
  );
}