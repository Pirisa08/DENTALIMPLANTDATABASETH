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

const ImageUploadIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="phSvg">
    <path d="M5 5.5h14v13H5v-13Z" />
    <path d="m7.5 16 3.4-4 2.5 2.8 1.4-1.6 1.8 2.8" />
    <path d="M15.7 9.3h.1" />
  </svg>
);

const toNumberOrNull = (value) => {
  if (value === undefined || value === null || value === "") return null;
  const num = Number(value);
  return Number.isNaN(num) ? null : num;
};

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
    brandId: null,
    slug: "",
    companyId: null,
    levelId: null,
    countryId: null,
    countryText: "",
    website: "",
    brandDescription: "",
    connectionType: "",
    connectionTypeId: null,
    connectionShape: "",
    connectionShapeId: null,
    screwdriverShape: "",
    screwdriverShapeId: null,
    headShape: "",
    headShapeId: null,
    bodyShape: "",
    bodyShapeId: null,
    apexShape: "",
    apexShapeId: null,
    officialDistributor: "",
    distributorId: null,
    status: "Active",
    image1Message: "",
    image2Message: "",
    image3Message: "",
  });

  const [currentLabels, setCurrentLabels] = useState({
    companyName: "",
    levelName: "",
    countryName: "",
    brandName: "",
    connectionTypeName: "",
    connectionShapeName: "",
    screwdriverShapeName: "",
    headShapeName: "",
    bodyShapeName: "",
    apexShapeName: "",
    distributorName: "",
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

  const [removedImages, setRemovedImages] = useState({
    image1: false,
    image2: false,
    image3: false,
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
    return nextMaster;
  };

  const sanitizeFkList = (arr) =>
    Array.isArray(arr)
      ? arr.filter(
          (item) =>
            item &&
            (item.id || item.idcompany || item.idlevel || item.idcountry) &&
            item.name &&
            item.status !== "Inactive"
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
      ? arr
          .map((item) => ({
            id: item.id,
            name: item.name,
            status: item.status || "Active",
          }))
          .filter((item) => item && item.name && item.status !== "Inactive")
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
              brandId: toNumberOrNull(apiImplant.brandId),
              slug: apiImplant.slug || "",
              companyId: toNumberOrNull(
                apiImplant.companyId || apiImplant.company?.id
              ),
              levelId: toNumberOrNull(
                apiImplant.levelId || apiImplant.level?.id
              ),
              countryId: toNumberOrNull(
                apiImplant.countryId || apiImplant.country?.id
              ),
              countryText: apiImplant.countryText || "",
              website: apiImplant.website || "",
              brandDescription: apiImplant.brandDescription || "",
              connectionType: apiImplant.connectionType || "",
              connectionTypeId: toNumberOrNull(apiImplant.connectionTypeId),
              connectionShape: apiImplant.connectionShape || "",
              connectionShapeId: toNumberOrNull(apiImplant.connectionShapeId),
              screwdriverShape: apiImplant.screwdriverShape || "",
              screwdriverShapeId: toNumberOrNull(apiImplant.screwdriverShapeId),
              headShape: apiImplant.headShape || "",
              headShapeId: toNumberOrNull(apiImplant.headShapeId),
              bodyShape: apiImplant.bodyShape || "",
              bodyShapeId: toNumberOrNull(apiImplant.bodyShapeId),
              apexShape: apiImplant.apexShape || "",
              apexShapeId: toNumberOrNull(apiImplant.apexShapeId),
              officialDistributor: apiImplant.officialDistributor || "",
              distributorId: toNumberOrNull(apiImplant.distributorId),
              status: apiImplant.status || "Active",
              image1Message: apiImplant.image1Message || "",
              image2Message: apiImplant.image2Message || "",
              image3Message: apiImplant.image3Message || "",
            });

            setCurrentLabels({
              companyName: apiImplant.company?.name || "",
              levelName: apiImplant.level?.name || "",
              countryName: apiImplant.country?.name || "",
              brandName: apiImplant.brand || "",
              connectionTypeName: apiImplant.connectionType || "",
              connectionShapeName: apiImplant.connectionShape || "",
              screwdriverShapeName: apiImplant.screwdriverShape || "",
              headShapeName: apiImplant.headShape || "",
              bodyShapeName: apiImplant.bodyShape || "",
              apexShapeName: apiImplant.apexShape || "",
              distributorName: apiImplant.officialDistributor || "",
            });

            setImagePreviews({
              image1: resolveImageUrl(
                apiImplant.image1 ||
                  apiImplant.image_url ||
                  apiImplant.image ||
                  apiImplant.imageDataUrl
              ),
              image2: resolveImageUrl(apiImplant.image2),
              image3: resolveImageUrl(apiImplant.image3),
            });

            setImageFiles({
              image1: null,
              image2: null,
              image3: null,
            });

            setRemovedImages({
              image1: false,
              image2: false,
              image3: false,
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

    return () => {
      setImagePreviews((prev) => {
        Object.values(prev).forEach((src) => {
          if (typeof src === "string" && src.startsWith("blob:")) {
            URL.revokeObjectURL(src);
          }
        });
        return prev;
      });
    };
  }, [id, isEdit]);

  const setField = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));

  const canSave = useMemo(() => {
    return (
      form.name.trim() &&
      Number(form.companyId) > 0 &&
      Number(form.levelId) > 0
    );
  }, [form]);

  const withCurrentIdOption = (list, currentId, currentName) => {
    const safe = Array.isArray(list) ? list : [];
    if (!currentId) return safe;

    const exists = safe.some((item) => Number(item.id) === Number(currentId));
    if (exists) return safe;

    return [
      ...safe,
      {
        id: currentId,
        name: currentName || `Current (${currentId})`,
        __current: true,
      },
    ];
  };

  const companyOptions = useMemo(() => {
    return withCurrentIdOption(
      masterData.companies,
      form.companyId,
      currentLabels.companyName
    );
  }, [masterData.companies, form.companyId, currentLabels.companyName]);

  const levelOptions = useMemo(() => {
    return withCurrentIdOption(
      masterData.levels,
      form.levelId,
      currentLabels.levelName
    );
  }, [masterData.levels, form.levelId, currentLabels.levelName]);

  const countryOptions = useMemo(() => {
    return withCurrentIdOption(
      masterData.countries,
      form.countryId,
      currentLabels.countryName
    );
  }, [masterData.countries, form.countryId, currentLabels.countryName]);

  // Show all brands, with company name in parentheses for clarity
  const filteredBrands = useMemo(() => {
    return (masterData.brands || []).map((item) => ({
      ...item,
      label: item.companyName ? `${item.name} (${item.companyName})` : item.name,
    }));
  }, [masterData.brands]);

  const withCurrentTextIdOption = (list, currentId, currentName) => {
    const safe = Array.isArray(list) ? list : [];
    if (!currentId) return safe;

    const exists = safe.some((item) => Number(item.id) === Number(currentId));
    if (exists) return safe;

    return [
      ...safe,
      {
        id: currentId,
        name: currentName || `Current (${currentId})`,
        __current: true,
      },
    ];
  };

  const connectionTypeOptions = useMemo(
    () =>
      withCurrentTextIdOption(
        masterData.connectionTypes,
        form.connectionTypeId,
        currentLabels.connectionTypeName
      ),
    [
      masterData.connectionTypes,
      form.connectionTypeId,
      currentLabels.connectionTypeName,
    ]
  );

  const connectionShapeOptions = useMemo(
    () =>
      withCurrentTextIdOption(
        masterData.connectionShapes,
        form.connectionShapeId,
        currentLabels.connectionShapeName
      ),
    [
      masterData.connectionShapes,
      form.connectionShapeId,
      currentLabels.connectionShapeName,
    ]
  );

  const screwdriverShapeOptions = useMemo(
    () =>
      withCurrentTextIdOption(
        masterData.screwdriverShapes,
        form.screwdriverShapeId,
        currentLabels.screwdriverShapeName
      ),
    [
      masterData.screwdriverShapes,
      form.screwdriverShapeId,
      currentLabels.screwdriverShapeName,
    ]
  );

  const headShapeOptions = useMemo(
    () =>
      withCurrentTextIdOption(
        masterData.headShapes,
        form.headShapeId,
        currentLabels.headShapeName
      ),
    [masterData.headShapes, form.headShapeId, currentLabels.headShapeName]
  );

  const bodyShapeOptions = useMemo(
    () =>
      withCurrentTextIdOption(
        masterData.bodyShapes,
        form.bodyShapeId,
        currentLabels.bodyShapeName
      ),
    [masterData.bodyShapes, form.bodyShapeId, currentLabels.bodyShapeName]
  );

  const apexShapeOptions = useMemo(
    () =>
      withCurrentTextIdOption(
        masterData.apexShapes,
        form.apexShapeId,
        currentLabels.apexShapeName
      ),
    [masterData.apexShapes, form.apexShapeId, currentLabels.apexShapeName]
  );

  const officialDistributorOptions = useMemo(
    () =>
      withCurrentTextIdOption(
        masterData.officialDistributors,
        form.distributorId,
        currentLabels.distributorName
      ),
    [
      masterData.officialDistributors,
      form.distributorId,
      currentLabels.distributorName,
    ]
  );

  const onPickImage = (key, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFiles((prev) => ({
      ...prev,
      [key]: file,
    }));

    setRemovedImages((prev) => ({
      ...prev,
      [key]: false,
    }));

    setImagePreviews((prev) => {
      const next = { ...prev };

      if (next[key] && next[key].startsWith("blob:")) {
        URL.revokeObjectURL(next[key]);
      }

      next[key] = URL.createObjectURL(file);
      return next;
    });
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

    setRemovedImages((prev) => ({
      ...prev,
      [key]: true,
    }));

    setImagePreviews((prev) => {
      const next = { ...prev };

      if (next[key] && next[key].startsWith("blob:")) {
        URL.revokeObjectURL(next[key]);
      }

      next[key] = "";
      return next;
    });

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
    } catch (err) {
      alert(formatAddOptionError(err, labelMap[type]));
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

      setField("brandId", brandItem.id);
      setField("brand", brandItem.name);
      setCurrentLabels((prev) => ({ ...prev, brandName: brandItem.name }));
    } catch (err) {
      alert(formatAddOptionError(err, "Brand"));
    }
  };

  const formatAddOptionError = (err, label) => {
    const message = err?.message || "";

    if (
      /(^|[^0-9])409([^0-9]|$)|already exists|duplicate|unique|ข้อมูลที่ป้อนมีอยู่แล้ว/i.test(
        message
      )
    ) {
      return "ข้อมูลที่ป้อนมีอยู่แล้ว";
    }

    return `Failed to add ${label}: ${message || "Unknown error"}`;
  };

  const addTextMasterOption = async ({
    label,
    stateKey,
    localKey,
    idFieldName,
    textFieldName,
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

      setField(idFieldName, item.id);
      setField(textFieldName, item.name);
    } catch (err) {
      alert(formatAddOptionError(err, label));
    }
  };

  const addConnectionType = () =>
    addTextMasterOption({
      label: "Connection Type",
      stateKey: "connectionTypes",
      localKey: "connectionType",
      idFieldName: "connectionTypeId",
      textFieldName: "connectionType",
      createApi: masterDataAPI.createConnectionType,
    });

  const addConnectionShape = () =>
    addTextMasterOption({
      label: "Connection Shape",
      stateKey: "connectionShapes",
      localKey: "connectionShape",
      idFieldName: "connectionShapeId",
      textFieldName: "connectionShape",
      createApi: masterDataAPI.createConnectionShape,
    });

  const addScrewdriverShape = () =>
    addTextMasterOption({
      label: "Screwdriver Shape",
      stateKey: "screwdriverShapes",
      localKey: "screwdriverShape",
      idFieldName: "screwdriverShapeId",
      textFieldName: "screwdriverShape",
      createApi: masterDataAPI.createScrewdriverShape,
    });

  const addHeadShape = () =>
    addTextMasterOption({
      label: "Head Shape",
      stateKey: "headShapes",
      localKey: "headShape",
      idFieldName: "headShapeId",
      textFieldName: "headShape",
      createApi: masterDataAPI.createHeadShape,
    });

  const addBodyShape = () =>
    addTextMasterOption({
      label: "Body Shape",
      stateKey: "bodyShapes",
      localKey: "bodyShape",
      idFieldName: "bodyShapeId",
      textFieldName: "bodyShape",
      createApi: masterDataAPI.createBodyShape,
    });

  const addApexShape = () =>
    addTextMasterOption({
      label: "Apex Shape",
      stateKey: "apexShapes",
      localKey: "apexShape",
      idFieldName: "apexShapeId",
      textFieldName: "apexShape",
      createApi: masterDataAPI.createApexShape,
    });

  const addOfficialDistributor = () =>
    addTextMasterOption({
      label: "Official Distributor",
      stateKey: "officialDistributors",
      localKey: "officialDistributor",
      idFieldName: "distributorId",
      textFieldName: "officialDistributor",
      createApi: masterDataAPI.createDistributor,
    });

  const save = async () => {
    if (!canSave) {
      setSaveError("Please fill all required fields");
      return;
    }

    const validCompany = companyOptions.some(
      (c) => Number(c.id) === Number(form.companyId)
    );
    const validLevel = levelOptions.some(
      (l) => Number(l.id) === Number(form.levelId)
    );
    const validCountry =
      !form.countryId ||
      countryOptions.some((c) => Number(c.id) === Number(form.countryId));

    if (!validCompany) {
      setSaveError("Selected Company does not exist");
      return;
    }

    if (!validLevel) {
      setSaveError("Selected Level does not exist");
      return;
    }

    if (!validCountry) {
      setSaveError("Selected Country does not exist");
      return;
    }

    try {
      setSaving(true);
      setSaveError("");

      const payload = {
        ...form,
        companyId: toNumberOrNull(form.companyId),
        levelId: toNumberOrNull(form.levelId),
        countryId: toNumberOrNull(form.countryId),
        brandId: toNumberOrNull(form.brandId),
        connectionTypeId: toNumberOrNull(form.connectionTypeId),
        connectionShapeId: toNumberOrNull(form.connectionShapeId),
        screwdriverShapeId: toNumberOrNull(form.screwdriverShapeId),
        headShapeId: toNumberOrNull(form.headShapeId),
        bodyShapeId: toNumberOrNull(form.bodyShapeId),
        apexShapeId: toNumberOrNull(form.apexShapeId),
        distributorId: toNumberOrNull(form.distributorId),

        // สำคัญ: ถ้าไม่ได้แตะรูปเดิม ให้เป็น undefined
        // จะได้ไม่ถูก api.js แปลงเป็น "" แล้วลบรูปทิ้ง
        image1: removedImages.image1
          ? ""
          : imageFiles.image1
          ? imageFiles.image1
          : undefined,
        image2: removedImages.image2
          ? ""
          : imageFiles.image2
          ? imageFiles.image2
          : undefined,
        image3: removedImages.image3
          ? ""
          : imageFiles.image3
          ? imageFiles.image3
          : undefined,
        image1Message: form.image1Message,
        image2Message: form.image2Message,
        image3Message: form.image3Message,
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
      // ส่ง custom event พร้อม implant ที่เพิ่ม/แก้ไข
      window.dispatchEvent(
        new CustomEvent(IMPLANTS_UPDATED_EVENT, { detail: { implant: apiResult } })
      );
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
        {isMasterEdit ? " (Master editable)" : ""}
      </h2>

      <div style={{marginBottom: 10, color: '#b73232', fontWeight: 700, fontSize: 13}}> Fields marked with an asterisk (*) are required.</div>

      {saveError && <div className="saveWarning">{saveError}</div>}

      <div className="newGrid">
        <div className="imgCard">
          {["image1", "image2", "image3"].map((key, idx) => {
            const current = imagePreviews[key];
            const msgKey = `${key}Message`;
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
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="placeholder">
                      <div className="phIcon">
                        <ImageUploadIcon />
                      </div>
                      <div className="phText">Image {idx + 1}</div>
                      <div className="phSubText">Add photo</div>
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
                <input
                  className="input"
                  type="text"
                  placeholder={`Image ${idx + 1} message (optional)`}
                  value={form[msgKey] || ""}
                  onChange={e => setField(msgKey, e.target.value)}
                  style={{ marginTop: 6, fontSize: 13 }}
                />
              </div>
            );
          })}
        </div>

        <div className="formCard">
          <div className="twoCol">
            <Field label={<><span>Name</span><span style={{color:'#b73232', fontSize:'1.3em', marginLeft:4, fontWeight:900, textShadow:'0 1px 2px #fff,0 0 2px #b73232'}}> *</span></>}>
              <input
                className="input"
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
                placeholder="Name"
              />
            </Field>

            <Field label={<><span>Brand</span><span style={{color:'#b73232', fontSize:'1.3em', marginLeft:4, fontWeight:900, textShadow:'0 1px 2px #fff,0 0 2px #b73232'}}> *</span></>}>
              {form.companyId ? (
                <div className="selectRow">
                  <select
                    className="input"
                    value={form.brandId || ""}
                    onChange={(e) => {
                      const value = e.target.value ? Number(e.target.value) : null;
                      const found = filteredBrands.find(
                        (b) => Number(b.id) === Number(value)
                      );
                      setField("brandId", value);
                      setField("brand", found?.name || "");
                      setCurrentLabels((prev) => ({
                        ...prev,
                        brandName: found?.name || prev.brandName,
                      }));
                    }}
                  >
                    <option value="">Choose Brand</option>
                    {filteredBrands.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.__current ? `Current: ${b.name}` : b.name}
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

            <Field label={<><span>Slug</span><span style={{color:'#b73232', fontSize:'1.3em', marginLeft:4, fontWeight:900, textShadow:'0 1px 2px #fff,0 0 2px #b73232'}}> *</span></>}>
              <input
                className="input"
                value={form.slug}
                onChange={(e) => setField("slug", e.target.value)}
                placeholder="Slug"
              />
            </Field>

            <Field label={<><span>Level</span><span style={{color:'#b73232', fontSize:'1.3em', marginLeft:4, fontWeight:900, textShadow:'0 1px 2px #fff,0 0 2px #b73232'}}> *</span></>}>
              <div className="selectRow">
                <select
                  className="input"
                  value={form.levelId || ""}
                  onChange={(e) => {
                    const value = e.target.value ? Number(e.target.value) : null;
                    setField("levelId", value);
                    const found = levelOptions.find(
                      (item) => Number(item.id) === Number(value)
                    );
                    setCurrentLabels((prev) => ({
                      ...prev,
                      levelName: found?.name || prev.levelName,
                    }));
                  }}
                >
                  <option value="">Choose Level</option>
                  {levelOptions.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.__current ? `Current: ${l.name}` : l.name}
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

            <Field label={<><span>Company</span><span style={{color:'#b73232', fontSize:'1.3em', marginLeft:4, fontWeight:900, textShadow:'0 1px 2px #fff,0 0 2px #b73232'}}> *</span></>}>
              <div className="selectRow">
                <select
                  className="input"
                  value={form.companyId || ""}
                  onChange={(e) => {
                    const value = e.target.value ? Number(e.target.value) : null;
                    setField("companyId", value);
                    setField("brandId", null);
                    setField("brand", "");
                    const found = companyOptions.find(
                      (item) => Number(item.id) === Number(value)
                    );
                    setCurrentLabels((prev) => ({
                      ...prev,
                      companyName: found?.name || prev.companyName,
                    }));
                  }}
                >
                  <option value="">Choose Company</option>
                  {companyOptions.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.__current ? `Current: ${c.name}` : c.name}
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

            <Field label={<><span>Country (select)</span><span style={{color:'#b73232', fontSize:'1.3em', marginLeft:4, fontWeight:900, textShadow:'0 1px 2px #fff,0 0 2px #b73232'}}> *</span></>}>
              <div className="selectRow">
                <select
                  className="input"
                  value={form.countryId || ""}
                  onChange={(e) => {
                    const value = e.target.value ? Number(e.target.value) : null;
                    setField("countryId", value);
                    const found = countryOptions.find(
                      (item) => Number(item.id) === Number(value)
                    );
                    setCurrentLabels((prev) => ({
                      ...prev,
                      countryName: found?.name || prev.countryName,
                    }));
                  }}
                >
                  <option value="">Choose Country</option>
                  {countryOptions.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.__current ? `Current: ${c.name}` : c.name}
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

            <Field label={<><span>Country (text, optional)</span><span style={{color:'#b73232', fontSize:'1.3em', marginLeft:4, fontWeight:900, textShadow:'0 1px 2px #fff,0 0 2px #b73232'}}> *</span></>}>
              <input
                className="input"
                value={form.countryText}
                onChange={(e) => setField("countryText", e.target.value)}
                placeholder="Headquarters / Manufacturer"
              />
            </Field>

            <Field label={<><span>Website</span><span style={{color:'#b73232', fontSize:'1.3em', marginLeft:4, fontWeight:900, textShadow:'0 1px 2px #fff,0 0 2px #b73232'}}> *</span></>}>
              <input
                className="input"
                value={form.website}
                onChange={(e) => setField("website", e.target.value)}
                placeholder="https://"
              />
            </Field>

            <Field label={<><span>Brand Description</span><span style={{color:'#b73232', fontSize:'1.3em', marginLeft:4, fontWeight:900, textShadow:'0 1px 2px #fff,0 0 2px #b73232'}}> *</span></>}>
              <textarea
                className="input"
                value={form.brandDescription}
                onChange={(e) => setField("brandDescription", e.target.value)}
                placeholder="Brand description"
              />
            </Field>

            <Field label={<><span>Connection Type</span><span style={{color:'#b73232', fontSize:'1.3em', marginLeft:4, fontWeight:900, textShadow:'0 1px 2px #fff,0 0 2px #b73232'}}> *</span></>}>
              <div className="selectRow">
                <select
                  className="input"
                  value={form.connectionTypeId || ""}
                  onChange={(e) => {
                    const value = e.target.value ? Number(e.target.value) : null;
                    const found = connectionTypeOptions.find(
                      (item) => Number(item.id) === Number(value)
                    );
                    setField("connectionTypeId", value);
                    setField("connectionType", found?.name || "");
                    setCurrentLabels((prev) => ({
                      ...prev,
                      connectionTypeName:
                        found?.name || prev.connectionTypeName,
                    }));
                  }}
                >
                  <option value="">Choose Connection Type</option>
                  {connectionTypeOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.__current ? `Current: ${opt.name}` : opt.name}
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

            <Field label={<><span>Connection Shape</span><span style={{color:'#b73232', fontSize:'1.3em', marginLeft:4, fontWeight:900, textShadow:'0 1px 2px #fff,0 0 2px #b73232'}}> *</span></>}>
              <div className="selectRow">
                <select
                  className="input"
                  value={form.connectionShapeId || ""}
                  onChange={(e) => {
                    const value = e.target.value ? Number(e.target.value) : null;
                    const found = connectionShapeOptions.find(
                      (item) => Number(item.id) === Number(value)
                    );
                    setField("connectionShapeId", value);
                    setField("connectionShape", found?.name || "");
                    setCurrentLabels((prev) => ({
                      ...prev,
                      connectionShapeName:
                        found?.name || prev.connectionShapeName,
                    }));
                  }}
                >
                  <option value="">Choose Connection Shape</option>
                  {connectionShapeOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.__current ? `Current: ${opt.name}` : opt.name}
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

            <Field label={<><span>Screwdriver Shape</span><span style={{color:'#b73232', fontSize:'1.3em', marginLeft:4, fontWeight:900, textShadow:'0 1px 2px #fff,0 0 2px #b73232'}}> *</span></>}>
              <div className="selectRow">
                <select
                  className="input"
                  value={form.screwdriverShapeId || ""}
                  onChange={(e) => {
                    const value = e.target.value ? Number(e.target.value) : null;
                    const found = screwdriverShapeOptions.find(
                      (item) => Number(item.id) === Number(value)
                    );
                    setField("screwdriverShapeId", value);
                    setField("screwdriverShape", found?.name || "");
                    setCurrentLabels((prev) => ({
                      ...prev,
                      screwdriverShapeName:
                        found?.name || prev.screwdriverShapeName,
                    }));
                  }}
                >
                  <option value="">Choose Screwdriver Shape</option>
                  {screwdriverShapeOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.__current ? `Current: ${opt.name}` : opt.name}
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

            <Field label={<><span>Head Shape</span><span style={{color:'#b73232', fontSize:'1.3em', marginLeft:4, fontWeight:900, textShadow:'0 1px 2px #fff,0 0 2px #b73232'}}> *</span></>}>
              <div className="selectRow">
                <select
                  className="input"
                  value={form.headShapeId || ""}
                  onChange={(e) => {
                    const value = e.target.value ? Number(e.target.value) : null;
                    const found = headShapeOptions.find(
                      (item) => Number(item.id) === Number(value)
                    );
                    setField("headShapeId", value);
                    setField("headShape", found?.name || "");
                    setCurrentLabels((prev) => ({
                      ...prev,
                      headShapeName: found?.name || prev.headShapeName,
                    }));
                  }}
                >
                  <option value="">Choose Head Shape</option>
                  {headShapeOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.__current ? `Current: ${opt.name}` : opt.name}
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

            <Field label={<><span>Body Shape</span><span style={{color:'#b73232', fontSize:'1.3em', marginLeft:4, fontWeight:900, textShadow:'0 1px 2px #fff,0 0 2px #b73232'}}> *</span></>}>
              <div className="selectRow">
                <select
                  className="input"
                  value={form.bodyShapeId || ""}
                  onChange={(e) => {
                    const value = e.target.value ? Number(e.target.value) : null;
                    const found = bodyShapeOptions.find(
                      (item) => Number(item.id) === Number(value)
                    );
                    setField("bodyShapeId", value);
                    setField("bodyShape", found?.name || "");
                    setCurrentLabels((prev) => ({
                      ...prev,
                      bodyShapeName: found?.name || prev.bodyShapeName,
                    }));
                  }}
                >
                  <option value="">Choose Body Shape</option>
                  {bodyShapeOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.__current ? `Current: ${opt.name}` : opt.name}
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

            <Field label={<><span>Apex Shape</span><span style={{color:'#b73232', fontSize:'1.3em', marginLeft:4, fontWeight:900, textShadow:'0 1px 2px #fff,0 0 2px #b73232'}}> *</span></>}>
              <div className="selectRow">
                <select
                  className="input"
                  value={form.apexShapeId || ""}
                  onChange={(e) => {
                    const value = e.target.value ? Number(e.target.value) : null;
                    const found = apexShapeOptions.find(
                      (item) => Number(item.id) === Number(value)
                    );
                    setField("apexShapeId", value);
                    setField("apexShape", found?.name || "");
                    setCurrentLabels((prev) => ({
                      ...prev,
                      apexShapeName: found?.name || prev.apexShapeName,
                    }));
                  }}
                >
                  <option value="">Choose Apex Shape</option>
                  {apexShapeOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.__current ? `Current: ${opt.name}` : opt.name}
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

            <Field label={<><span>Official Distributor</span><span style={{color:'#b73232', fontSize:'1.3em', marginLeft:4, fontWeight:900, textShadow:'0 1px 2px #fff,0 0 2px #b73232'}}> *</span></>}>
              <div className="selectRow">
                <select
                  className="input"
                  value={form.distributorId || ""}
                  onChange={(e) => {
                    const value = e.target.value ? Number(e.target.value) : null;
                    const found = officialDistributorOptions.find(
                      (item) => Number(item.id) === Number(value)
                    );
                    setField("distributorId", value);
                    setField("officialDistributor", found?.name || "");
                    setCurrentLabels((prev) => ({
                      ...prev,
                      distributorName: found?.name || prev.distributorName,
                    }));
                  }}
                >
                  <option value="">Choose Distributor</option>
                  {officialDistributorOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.__current ? `Current: ${opt.name}` : opt.name}
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

            <Field label={<><span>Status</span><span style={{color:'#b73232', fontSize:'1.3em', marginLeft:4, fontWeight:900, textShadow:'0 1px 2px #fff,0 0 2px #b73232'}}> *</span></>}>
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
