import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./NewImplant.css";
import AdminSearchBar from "../components/AdminSearchBar.jsx";
import Breadcrumb from "../components/Breadcrumb.jsx";
import { implantsAPI, masterDataAPI } from "../../services/api.js";
import { loadMaster, saveMaster } from "./masterDataStore.js";

const IMPLANTS_KEY = "admin_implants_v1";

export default function NewImplant() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [masterData, setMasterData] = useState({ companies: [], levels: [], countries: [] });
  const [masterLocal, setMasterLocal] = useState(loadMaster());
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
    image1: "",
    image2: "",
    image3: "",
    status: "Active",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saveError, setSaveError] = useState("");
  const fileInputs = useRef({});

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        
        // โหลดข้อมูลจาก localStorage ก่อน
        const localMaster = loadMaster();
        const localCompanies = Array.isArray(localMaster.company) ? localMaster.company : [];
        const localLevels = Array.isArray(localMaster.level) ? localMaster.level : [];
        const localCountries = Array.isArray(localMaster.country) ? localMaster.country : [];
        
        console.log("📦 Local Master Data:", {
          companies: localCompanies.length,
          levels: localLevels.length,
          countries: localCountries.length
        });
        
        // โหลดข้อมูลจาก API (ทำให้ fail ก็ไม่เป็นไร เพราะจะใช้ localStorage แทน)
        let apiCompanies = [];
        let apiLevels = [];
        let apiCountries = [];
        
        try {
          [apiCompanies, apiLevels, apiCountries] = await Promise.all([
            masterDataAPI.getCompanies(),
            masterDataAPI.getLevels(),
            masterDataAPI.getCountries(),
          ]);
        } catch (apiErr) {
          console.warn("⚠️ API call failed, will try fallback: ", apiErr.message);
          apiCompanies = [];
          apiLevels = [];
          apiCountries = [];
        }
        
        // กรองค่าที่ไม่ต้องการ (เช่น hatyai) และผสมข้อมูลจาก API+local
        const sanitize = (arr) => Array.isArray(arr)
          ? arr.filter(item => item && item.name && item.name.toLowerCase() !== 'hatyai')
          : [];

        const mergeData = (apiData, localData, filterByStatus = true) => {
          const map = new Map();
          
          apiData.forEach(item => {
            if (item && item.name) {
              map.set(item.name.toLowerCase(), item);
            }
          });
          
          localData.forEach(item => {
            if (item && item.name && !map.has(item.name.toLowerCase())) {
              map.set(item.name.toLowerCase(), item);
            }
          });
          
          let result = Array.from(map.values());
          result = sanitize(result);
          
          console.log("🔸 Before filter:", { count: result.length, items: result.map(r => ({ name: r.name, status: r.status })) });
          
          // ถ้า filterByStatus = true ให้แสดงแค่ Active, ถ้า false ให้แสดงทั้งหมด
          if (filterByStatus) {
            // result = result.filter(item => item.status === "Active"); // DEBUG: disabled
          }
          
          console.log("🔹 After filter:", { count: result.length, filterByStatus });
          
          return result;
        };
        
        // Company: แสดงเฉพาะ Active (status = 'Active')
        // Level: แสดงเฉพาะ Active (status = 'Active')
        // Country: แสดงทั้งหมด (Active และ Inactive)
        const mergedCompanies = mergeData(apiCompanies, localCompanies, true);
        const mergedLevels = mergeData(apiLevels, localLevels, true);
        const mergedCountries = mergeData(apiCountries, localCountries, false); // แสดงทั้งหมด
        
        console.log("✅ Merged Master Data:", {
          companies: mergedCompanies.map(c => c.name),
          levels: mergedLevels.map(l => l.name),
          countries: mergedCountries.length
        });
        
        setMasterData({ 
          companies: mergedCompanies, 
          levels: mergedLevels, 
          countries: mergedCountries 
        });
        
        setMasterLocal(localMaster);

        if (isEdit) {
          // Load from localStorage first
          const localRaw = localStorage.getItem(IMPLANTS_KEY);
          let implants = [];
          try {
            implants = localRaw ? JSON.parse(localRaw) : [];
          } catch {}
          
          const localData = implants.find(imp => String(imp.id) === String(id));
          
          if (localData) {
            setForm({
              name: localData.name || "",
              brand: localData.brand || "",
              slug: localData.slug || "",
              companyId: localData.companyId || null,
              levelId: localData.levelId || null,
              countryId: localData.countryId || null,
              countryText: localData.countryText || "",
              website: localData.website || "",
              brandDescription: localData.brandDescription || "",
              connectionType: localData.connectionType || "",
              connectionShape: localData.connectionShape || "",
              screwdriverShape: localData.screwdriverShape || "",
              headShape: localData.headShape || "",
              bodyShape: localData.bodyShape || "",
              apexShape: localData.apexShape || "",
              officialDistributor: localData.officialDistributor || "",
              image1: localData.image1 || "",
              image2: localData.image2 || "",
              image3: localData.image3 || "",
              status: localData.status || "Active",
            });
          }
        }
      } catch (err) {
        setError(err.message || "Failed to load form");
      } finally {
        setLoading(false);
      }
    }
    load();
    
    // ฟังการเปลี่ยนแปลงของ Master Data (เช่น เมื่อลบจากหน้า Master Data)
    const handleStorageChange = () => {
      load();
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleStorageChange);
    };
  }, [id, isEdit]);

  const setField = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));

  const canSave = useMemo(() => {
    return form.name.trim() && form.companyId && form.levelId && (form.countryId || form.countryText);
  }, [form]);

  // 🚀 Cache filtered brands to prevent lag on every keystroke
  const filteredBrands = useMemo(() => {
    if (!form.companyId || !masterLocal.brand) return [];
    return masterLocal.brand.filter(b => b.companyId === form.companyId);
  }, [form.companyId, masterLocal.brand]);

  // 🚀 Cache master data arrays for dropdown rendering
  const connectionTypes = useMemo(() => masterLocal.connectionType || [], [masterLocal.connectionType]);
  const connectionShapes = useMemo(() => masterLocal.connectionShape || [], [masterLocal.connectionShape]);
  const screwdriverShapes = useMemo(() => masterLocal.screwdriverShape || [], [masterLocal.screwdriverShape]);
  const headShapes = useMemo(() => masterLocal.headShape || [], [masterLocal.headShape]);
  const bodyShapes = useMemo(() => masterLocal.bodyShape || [], [masterLocal.bodyShape]);
  const apexShapes = useMemo(() => masterLocal.apexShape || [], [masterLocal.apexShape]);
  const officialDistributors = useMemo(() => masterLocal.officialDistributor || [], [masterLocal.officialDistributor]);

  const onPickImage = (key, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setField(key, String(reader.result || ""));
    reader.readAsDataURL(file);
  };

  const openPicker = (key) => {
    const el = fileInputs.current[key];
    if (el) el.click();
  };

  const addOption = async (type) => {
    const labelMap = { levels: "Level", companies: "Company", countries: "Country" };
    const fieldMap = { levels: "levelId", companies: "companyId", countries: "countryId" };
    const masterKeyMap = { levels: "level", companies: "company", countries: "country" };
    const apiMap = {
      levels: masterDataAPI.createLevel,
      companies: masterDataAPI.createCompany,
      countries: masterDataAPI.createCountry,
    };

    const value = prompt(`เพิ่ม ${labelMap[type]} ใหม่:`);
    if (!value || !value.trim()) return;

    try {
      let newItem = { id: Date.now(), name: value.trim(), status: "Active" };
      
      // พยายามสร้างใน backend ก่อน
      try {
        const created = await apiMap[type]({ name: value.trim(), status: "Active" });
        if (created && created.id) {
          newItem = created;
        }
      } catch (apiErr) {
        console.warn(`API ไม่ตอบสนอง จะบันทึกแบบ local:`, apiErr);
      }
      
      // บันทึกลง Master Data Storage (localStorage)
      const currentMaster = loadMaster();
      const masterKey = masterKeyMap[type];
      const existingItems = Array.isArray(currentMaster[masterKey]) ? currentMaster[masterKey] : [];
      
      // เช็คว่ามีชื่อซ้ำหรือไม่
      const isDuplicate = existingItems.some(item => 
        item.name.toLowerCase().trim() === value.trim().toLowerCase()
      );
      
      if (isDuplicate) {
        alert(`มี ${labelMap[type]} ชื่อ "${value.trim()}" อยู่แล้ว!`);
        return;
      }
      
      // เพิ่มข้อมูลใหม่เข้าไป
      const updatedMaster = {
        ...currentMaster,
        [masterKey]: [newItem, ...existingItems]
      };
      
      saveMaster(updatedMaster);
      
      // ⭐ Trigger storage event เพื่อบอกหน้าอื่นๆ (เช่น Master Data) ให้รีเฟรช
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'admin_masterdata_v1',
        newValue: JSON.stringify(updatedMaster),
        storageArea: localStorage
      }));
      
      // อัพเดท state ในหน้านี้
      setMasterData((prev) => ({
        ...prev,
        [type]: [newItem, ...(prev[type] || [])],
      }));
      
      // เลือกรายการที่เพิ่มใหม่ทันที
      setField(fieldMap[type], newItem.id);
      alert(`เพิ่ม ${labelMap[type]} "${value.trim()}" สำเร็จ!`);
      
    } catch (err) {
      console.error(`Error adding ${labelMap[type]}:`, err);
      alert(`เกิดข้อผิดพลาด: ${err.message}`);
    }
  };

  const addBrand = async () => {
    if (!form.companyId) {
      alert("กรุณาเลือก Company ก่อน");
      return;
    }

    const brandName = prompt("เพิ่ม Brand ใหม่:");
    if (!brandName || !brandName.trim()) return;

    try {
      let newBrand = { id: Date.now(), name: brandName.trim(), status: "Active", companyId: form.companyId };
      
      // บันทึกลง Master Data Storage
      const currentMaster = loadMaster();
      const existingBrands = Array.isArray(currentMaster.brand) ? currentMaster.brand : [];
      
      // เช็คว่ามี Brand ชื่อเดียวกันในบริษัทนี้หรือไม่
      const isDuplicate = existingBrands.some(b => 
        b.name.toLowerCase().trim() === brandName.trim().toLowerCase() && 
        b.companyId === form.companyId
      );
      
      if (isDuplicate) {
        alert(`Brand "${brandName.trim()}" มีอยู่แล้วในบริษัทนี้!`);
        return;
      }
      
      // เพิ่ม Brand ใหม่
      const updatedMaster = {
        ...currentMaster,
        brand: [newBrand, ...existingBrands]
      };
      
      saveMaster(updatedMaster);
      
      // Trigger storage event
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'admin_masterdata_v1',
        newValue: JSON.stringify(updatedMaster),
        storageArea: localStorage
      }));
      
      // อัพเดท state
      setMasterLocal(updatedMaster);
      setField("brand", newBrand.name);
      alert(`เพิ่ม Brand "${brandName.trim()}" สำเร็จ!`);
      
    } catch (err) {
      console.error("Error adding brand:", err);
      alert(`เกิดข้อผิดพลาด: ${err.message}`);
    }
  };

  const save = async () => {
    if (!canSave) {
      console.warn("Missing required fields: Name, Company, Level, Country");
      return;
    }
    try {
      setSaving(true);
      setSaveError("");
      
      // Read all implants from localStorage
      const localRaw = localStorage.getItem(IMPLANTS_KEY);
      let implants = [];
      try {
        implants = localRaw ? JSON.parse(localRaw) : [];
        if (!Array.isArray(implants)) implants = [];
      } catch {
        implants = [];
      }
      
      if (isEdit) {
        // Try to update in API first (primary storage)
        let apiResult = null;
        let apiError = null;
        try {
          apiError = apiErr;
          console.error("API update failed:", apiErr);
        } catch (apiErr) {
          apiError = apiErr;
          console.error("API update failed:", apiErr);
        }
        
        if (apiResult) {
          // API success - store in localStorage too
          const updated = implants.map((imp) =>
            String(imp.id) === String(id) ? apiResult : imp
          );
          localStorage.setItem(IMPLANTS_KEY, JSON.stringify(updated));
          // Notify other tabs/components to refresh
          window.dispatchEvent(new Event('storage'));
          window.dispatchEvent(new StorageEvent('storage', {
            key: IMPLANTS_KEY,
            newValue: JSON.stringify(updated),
            storageArea: localStorage
          }));
          console.log('✅ Updated successfully');
        } else {
          // API failed - silently save to localStorage
          console.warn('⚠️ API update failed');
          const updated = implants.map((imp) =>
            String(imp.id) === String(id) ? { ...imp, ...form, id: imp.id } : imp
          );
          localStorage.setItem(IMPLANTS_KEY, JSON.stringify(updated));
          window.dispatchEvent(new Event('storage'));
          window.dispatchEvent(new StorageEvent('storage', {
            key: IMPLANTS_KEY,
            newValue: JSON.stringify(updated),
            storageArea: localStorage
          }));
          if (apiError) {
            setSaveError("บันทึกข้อมูลลงเซิร์ฟเวอร์ไม่สำเร็จ ระบบบันทึกชั่วคราวไว้ในเครื่องแล้ว กรุณาตรวจสอบการเชื่อมต่อฐานข้อมูล");
          }
        }
      } else {
        // Try to create in API first (primary storage)
        let apiResult = null;
        let apiError = null;
        try {
          apiResult = await implantsAPI.create(form);
        } catch (apiErr) {
          apiError = apiErr;
          console.error("API create failed:", apiErr);
        }
        
        if (apiResult) {
          // API success - store in localStorage too
          const updated = [apiResult, ...implants];
          localStorage.setItem(IMPLANTS_KEY, JSON.stringify(updated));
          // Notify other tabs/components to refresh
          window.dispatchEvent(new Event('storage'));
          window.dispatchEvent(new StorageEvent('storage', {
            key: IMPLANTS_KEY,
            newValue: JSON.stringify(updated),
            storageArea: localStorage
          }));
          console.log('✅ Created successfully');
        } else {
          // API failed - silently save to localStorage
          console.warn('⚠️ API create failed');
          // Create only in localStorage as fallback
          const newImplant = { id: Date.now(), ...form };
          const updated = [newImplant, ...implants];
          localStorage.setItem(IMPLANTS_KEY, JSON.stringify(updated));
          window.dispatchEvent(new Event('storage'));
          window.dispatchEvent(new StorageEvent('storage', {
            key: IMPLANTS_KEY,
            newValue: JSON.stringify(updated),
            storageArea: localStorage
          }));
          if (apiError) {
            setSaveError("สร้างข้อมูลบนเซิร์ฟเวอร์ไม่สำเร็จ ระบบบันทึกชั่วคราวไว้ในเครื่องแล้ว กรุณาตรวจสอบการเชื่อมต่อฐานข้อมูล");
          }
        }
      }
      
      navigate("/admin/implants");
    } catch (err) {
      console.error("Save failed:", err.message);
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
      <h2 className="pageTitle">{isEdit ? "Edit" : "New"} Implant</h2>

      {saveError && (
        <div className="saveWarning" role="alert">
          {saveError}
        </div>
      )}

      <div className="newGrid">
        <div className="imgCard">
          {["image1", "image2", "image3"].map((key, idx) => {
            const current = form[key];
            return (
              <div className="imgField" key={key}>
                <div className="imgBox" onClick={() => openPicker(key)} style={{ cursor: "pointer", position: "relative" }}>
                  {current ? (
                    <img className="preview" src={current} alt={`preview ${idx + 1}`} />
                  ) : (
                    <div className="placeholder">
                      <div className="phIcon">🖼️</div>
                      <div className="phText">Add image {idx + 1}</div>
                    </div>
                  )}

                  <div className="imgActions">
                    <button type="button" className="imgBtn" onClick={(e) => { e.stopPropagation(); openPicker(key); }}>Change</button>
                    {current && (
                      <button type="button" className="imgBtn danger" onClick={(e) => { e.stopPropagation(); setField(key, ""); }}>Remove</button>
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
              <input className="input" value={form.name} onChange={(e) => setField("name", e.target.value)} placeholder="Name" />
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
                  <button type="button" className="btnAddOption" onClick={() => addBrand()} title="เพิ่ม Brand ใหม่">
                    + Add
                  </button>
                </div>
              ) : (
                <div className="note">⚠️ Please select Company first</div>
              )}
            </Field>

            <Field label="Slug">
              <input className="input" value={form.slug} onChange={(e) => setField("slug", e.target.value)} placeholder="Slug" />
            </Field>

            <Field label="Level">
              <div className="selectRow">
                <select
                  className="input"
                  value={form.levelId || ""}
                  onChange={(e) => setField("levelId", e.target.value ? Number(e.target.value) : null)}
                >
                  <option value="">Choose Level</option>
                  {masterData.levels.map((l, idx) => (
                    <option key={`level-${l.id}-${idx}`} value={l.id}>
                      {l.name}
                    </option>
                  ))}
                </select>
                <button type="button" className="btnAddOption" onClick={() => addOption("levels")} title="เพิ่ม Level ใหม่">
                  + Add
                </button>
              </div>
            </Field>

            <Field label="Company">
              <div className="selectRow">
                <select
                  className="input"
                  value={form.companyId || ""}
                  onChange={(e) => setField("companyId", e.target.value ? Number(e.target.value) : null)}
                >
                  <option value="">Choose Company</option>
                  {masterData.companies.map((c, idx) => (
                    <option key={`company-${c.id}-${idx}`} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <button type="button" className="btnAddOption" onClick={() => addOption("companies")} title="เพิ่ม Company ใหม่">
                  + Add
                </button>
              </div>
            </Field>

            <Field label="Country (select)">
              <div className="selectRow">
                <select
                  className="input"
                  value={form.countryId || ""}
                  onChange={(e) => setField("countryId", e.target.value ? Number(e.target.value) : null)}
                >
                  <option value="">Choose Country</option>
                  {masterData.countries.map((c, idx) => (
                    <option key={`country-${c.id}-${idx}`} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <button type="button" className="btnAddOption" onClick={() => addOption("countries")} title="เพิ่ม Country ใหม่">
                  + Add
                </button>
              </div>
            </Field>

            <Field label="Country (text, optional)">
              <input className="input" value={form.countryText} onChange={(e) => setField("countryText", e.target.value)} placeholder="Headquarters / Manufacturer" />
            </Field>

            <Field label="Website">
              <input className="input" value={form.website} onChange={(e) => setField("website", e.target.value)} placeholder="https://" />
            </Field>

            <Field label="Brand Description">
              <textarea className="input" value={form.brandDescription} onChange={(e) => setField("brandDescription", e.target.value)} placeholder="Brand description" />
            </Field>

            <Field label="Connection Type">
              <select
                className="input"
                value={form.connectionType || ""}
                onChange={(e) => setField("connectionType", e.target.value)}
              >
                <option value="">Choose Connection Type</option>
                {connectionTypes.map((opt) => (
                  <option key={opt.id} value={opt.name}>{opt.name}</option>
                ))}
                {form.connectionType && !connectionTypes.some((o) => o.name === form.connectionType) && (
                  <option value={form.connectionType}>Current: {form.connectionType}</option>
                )}
              </select>
            </Field>

            <Field label="Connection Shape">
              <select
                className="input"
                value={form.connectionShape || ""}
                onChange={(e) => setField("connectionShape", e.target.value)}
              >
                <option value="">Choose Connection Shape</option>
                {connectionShapes.map((opt) => (
                  <option key={opt.id} value={opt.name}>{opt.name}</option>
                ))}
                {form.connectionShape && !connectionShapes.some((o) => o.name === form.connectionShape) && (
                  <option value={form.connectionShape}>Current: {form.connectionShape}</option>
                )}
              </select>
            </Field>

            <Field label="Screwdriver Shape">
              <select
                className="input"
                value={form.screwdriverShape || ""}
                onChange={(e) => setField("screwdriverShape", e.target.value)}
              >
                <option value="">Choose Screwdriver Shape</option>
                {screwdriverShapes.map((opt) => (
                  <option key={opt.id} value={opt.name}>{opt.name}</option>
                ))}
                {form.screwdriverShape && !screwdriverShapes.some((o) => o.name === form.screwdriverShape) && (
                  <option value={form.screwdriverShape}>Current: {form.screwdriverShape}</option>
                )}
              </select>
            </Field>

            <Field label="Head Shape">
              <select
                className="input"
                value={form.headShape || ""}
                onChange={(e) => setField("headShape", e.target.value)}
              >
                <option value="">Choose Head Shape</option>
                {headShapes.map((opt) => (
                  <option key={opt.id} value={opt.name}>{opt.name}</option>
                ))}
                {form.headShape && !headShapes.some((o) => o.name === form.headShape) && (
                  <option value={form.headShape}>Current: {form.headShape}</option>
                )}
              </select>
            </Field>

            <Field label="Body Shape">
              <select
                className="input"
                value={form.bodyShape || ""}
                onChange={(e) => setField("bodyShape", e.target.value)}
              >
                <option value="">Choose Body Shape</option>
                {bodyShapes.map((opt) => (
                  <option key={opt.id} value={opt.name}>{opt.name}</option>
                ))}
                {form.bodyShape && !bodyShapes.some((o) => o.name === form.bodyShape) && (
                  <option value={form.bodyShape}>Current: {form.bodyShape}</option>
                )}
              </select>
            </Field>

            <Field label="Apex Shape">
              <select
                className="input"
                value={form.apexShape || ""}
                onChange={(e) => setField("apexShape", e.target.value)}
              >
                <option value="">Choose Apex Shape</option>
                {apexShapes.map((opt) => (
                  <option key={opt.id} value={opt.name}>{opt.name}</option>
                ))}
                {form.apexShape && !apexShapes.some((o) => o.name === form.apexShape) && (
                  <option value={form.apexShape}>Current: {form.apexShape}</option>
                )}
              </select>
            </Field>

            <Field label="Official Distributor">
              <select
                className="input"
                value={form.officialDistributor || ""}
                onChange={(e) => setField("officialDistributor", e.target.value)}
              >
                <option value="">Choose Distributor</option>
                {officialDistributors.map((opt) => (
                  <option key={opt.id} value={opt.name}>{opt.name}</option>
                ))}
                {form.officialDistributor && !officialDistributors.some((o) => o.name === form.officialDistributor) && (
                  <option value={form.officialDistributor}>Current: {form.officialDistributor}</option>
                )}
              </select>
            </Field>

            <Field label="Status">
              <select className="input" value={form.status} onChange={(e) => setField("status", e.target.value)}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </Field>
          </div>

          <div className="formActions">
            <button className="btnSave" onClick={save} disabled={!canSave || saving}>
              {saving ? "Saving…" : isEdit ? "Save Changes" : "Create Implant"}
            </button>
            <button className="btnCancel" onClick={() => navigate("/admin/implants")}>
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

