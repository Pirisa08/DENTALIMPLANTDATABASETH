import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./MasterData.css";
import { getTypeLabel, loadMaster, saveMaster } from "./masterDataStore.js";
import AdminSearchBar from "../components/AdminSearchBar.jsx";
import Breadcrumb from "../components/Breadcrumb.jsx";

export default function MasterDataList() {
  const navigate = useNavigate();
  const { type } = useParams();
  const label = getTypeLabel(type);

  const [q, setQ] = useState("");
  const [master, setMaster] = useState(loadMaster());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openCountries, setOpenCountries] = useState({});
  const [openBrands, setOpenBrands] = useState({});
  const [quickCountrySearch, setQuickCountrySearch] = useState("");
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [quickDistributorCountrySearch, setQuickDistributorCountrySearch] = useState("");
  const [showDistributorCountryDropdown, setShowDistributorCountryDropdown] = useState(false);
  const [showAddIntro, setShowAddIntro] = useState(false);

  // Load data from Local Storage
  useEffect(() => {
    setMaster(loadMaster());
    const refresh = () => setMaster(loadMaster());
    window.addEventListener("focus", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("focus", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const list = Array.isArray(master[type]) ? master[type] : [];

  const updateItem = (nextList) => {
    const nextMaster = { ...master, [type]: nextList };
    saveMaster(nextMaster);
    setMaster(nextMaster);
  };

  const toggleStatus = (id) => {
    const item = list.find(x => String(x.id) === String(id));
    if (!item) return;
    
    const newStatus = item.status === "Active" ? "Inactive" : "Active";
    const next = list.map(x =>
      String(x.id) === String(id) ? { ...x, status: newStatus } : x
    );
    updateItem(next);
  };

  // Filter countries for dropdown search
  const filteredCountriesForSearch = useMemo(() => {
    if (type !== "country") return [];
    const search = quickCountrySearch.toLowerCase();
    if (!search) return list;
    return list.filter(c => c.name.toLowerCase().includes(search));
  }, [list, type, quickCountrySearch]);

  // Filter countries for official distributor dropdown search
  const filteredDistributorCountries = useMemo(() => {
    if (type !== "officialDistributor") return [];
    const countriesData = Array.isArray(master.country) ? master.country : [];
    const search = quickDistributorCountrySearch.toLowerCase();
    if (!search) return countriesData;
    return countriesData.filter(c => c.name.toLowerCase().includes(search));
  }, [master, type, quickDistributorCountrySearch]);

  // ✅ Special handling for brand: show companies
  if (type === "brand") {
    const brands = list;

    const filtered = useMemo(() => {
      const s = q.trim().toLowerCase();
      const companiesData = Array.isArray(master.company) ? master.company : [];
      const brandsData = Array.isArray(master.brand) ? master.brand : [];
      
      const companiesWithCount = companiesData.map((company) => {
        const count = brandsData.filter((b) => b.companyId === company.id).length;
        return { ...company, brandCount: count };
      });
      
      if (!s) return companiesWithCount;
      return companiesWithCount.filter((x) => String(x.name || "").toLowerCase().includes(s));
    }, [q, master]);

    const toggleBrandStatus = (id) => {
      const brand = brands.find(x => x.id === id);
      if (!brand) return;
      
      const newStatus = brand.status === "Active" ? "Inactive" : "Active";
      const next = brands.map(x =>
        x.id === id ? { ...x, status: newStatus } : x
      );
      updateItem(next);
    };

    const deleteBrand = (id) => {
      const brand = list.find(x => x.id === id);
      const name = brand ? brand.name : 'this brand';
      if (!confirm(`Delete "${name}"? This action cannot be undone.`)) return;
      
      const next = list.filter((x) => x.id !== id);
      updateItem(next);
    };

    if (loading) return <div className="mdWrap"><div className="empty">Loading...</div></div>;

    return (
      <div className="mdWrap">
        <AdminSearchBar
          placeholder="Search companies…"
          value={q}
          onChangeQ={setQ}
          onSearch={setQ}
        />

        <Breadcrumb
          items={[
            { label: "Home", href: "/admin" },
            { label: "Master Data", href: "/admin/master" },
            { label: `${label} Data` },
          ]}
        />
        <h2 className="pageTitle">Master Data Management</h2>

        {error && <div className="empty" style={{ color: '#dc3545' }}>{error}</div>}

        <div className="panelMd">
          <div className="panelHeadRow">
            <h3 className="panelTitle">{label} by Company</h3>
            <button
              className="addBtnMd"
              onClick={() => navigate(`/admin/master/company/new?returnTo=/admin/master/brand`)}
            >
              + Add Company
            </button>
          </div>

        {filtered.length === 0 ? (
          <div className="empty">No companies found</div>
        ) : (
          <div className="mdAccordion">
            {filtered.map((company) => {
              const companyBrands = brands.filter((b) => b.companyId === company.id);
              const isOpen = openCountries[company.id] || false;
              
              return (
                <div key={company.id} className="mdAccItem">
                  <div 
                    className="mdAccHeader"
                    role="button"
                    tabIndex={0}
                    onClick={() => setOpenCountries(prev => ({ ...prev, [company.id]: !prev[company.id] }))}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        setOpenCountries(prev => ({ ...prev, [company.id]: !prev[company.id] }));
                      }
                    }}
                  >
                    <div>
                      <div className="mdAccTitle">{company.name}</div>
                      <div className="mdAccMeta">{company.brandCount || 0} brand(s)</div>
                    </div>
                    <div className="mdAccActions">
                      <button
                        className="pill ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          const brandName = prompt(`Add brand for ${company.name}:`);
                          if (!brandName || !brandName.trim()) return;
                          
                          const modelCount = prompt(`Number of models for ${brandName}:`, "0");
                          if (modelCount === null) return;
                          
                          const newBrand = {
                            id: Date.now(),
                            name: brandName.trim(),
                            status: "Active",
                            companyId: company.id,
                            modelCount: parseInt(modelCount) || 0
                          };
                          
                          const updatedBrands = [newBrand, ...brands];
                          const nextMaster = { ...master, brand: updatedBrands };
                          saveMaster(nextMaster);
                          setMaster(nextMaster);
                        }}
                      >
                        + Add brand
                      </button>
                      <div className="mdChevron">{isOpen ? "−" : "+"}</div>
                    </div>
                  </div>

                  {isOpen && (
                    <div className="mdAccBody">
                      {companyBrands.length === 0 && <div className="empty">No brands yet.</div>}
                      {companyBrands.map((brand) => {
                        const brandModels = Array.isArray(master.model) ? master.model.filter((m) => m.brandId === brand.id) : [];
                        const isBrandOpen = openBrands[brand.id] || false;
                        
                        return (
                          <div key={brand.id} className="mdBrandItem">
                            {/* Brand Row */}
                            <div 
                              className="mdBrandHeader"
                              role="button"
                              tabIndex={0}
                              onClick={() => setOpenBrands(prev => ({ ...prev, [brand.id]: !prev[brand.id] }))}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  setOpenBrands(prev => ({ ...prev, [brand.id]: !prev[brand.id] }));
                                }
                              }}
                            >
                              <div className="brandNameCell">
                                <div className="brandName">{brand.name}</div>
                                <div className="brandMeta">{brandModels.length} model(s)</div>
                              </div>
                              <div className="statusCell">
                                <button
                                  className={`statusPill ${brand.status === "Active" ? "on" : "off"}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleBrandStatus(brand.id);
                                  }}
                                  title={brand.status === "Active" ? "Click to close" : "Click to open"}
                                >
                                  <span className="statusDot" />
                                  {brand.status === "Active" ? "Open" : "Closed"}
                                </button>
                              </div>
                              <div className="actionsCol">
                                <button className="btn edit" onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/admin/master/brand/edit/${brand.id}`);
                                }}>
                                  Edit
                                </button>
                                <button className="btn del" onClick={(e) => {
                                  e.stopPropagation();
                                  deleteBrand(brand.id);
                                }}>
                                  Delete
                                </button>
                                <div className="mdChevron">{isBrandOpen ? "−" : "+"}</div>
                              </div>
                            </div>

                            {/* Models */}
                            {isBrandOpen && (
                              <div className="mdModelsBody">
                                {brandModels.length === 0 ? (
                                  <div className="empty" style={{ padding: '12px 20px', fontSize: '13px' }}>No models yet.</div>
                                ) : (
                                  brandModels.map((model) => (
                                    <div key={model.id} className="mdModelRow">
                                      <div className="modelNameCell">{model.name}</div>
                                      <div className="statusCell">
                                        <button
                                          className={`statusPill ${model.status === "Active" ? "on" : "off"}`}
                                          onClick={() => {
                                            const newStatus = model.status === "Active" ? "Inactive" : "Active";
                                            const models = Array.isArray(master.model) ? master.model : [];
                                            const next = models.map(m =>
                                              m.id === model.id ? { ...m, status: newStatus } : m
                                            );
                                            const nextMaster = { ...master, model: next };
                                            saveMaster(nextMaster);
                                            setMaster(nextMaster);
                                          }}
                                          title={model.status === "Active" ? "Click to close" : "Click to open"}
                                        >
                                          <span className="statusDot" />
                                          {model.status === "Active" ? "Open" : "Closed"}
                                        </button>
                                      </div>
                                      <div className="actionsCol">
                                        <button className="btn edit" onClick={() => navigate(`/admin/master/model/edit/${model.id}?brandId=${brand.id}`)}>
                                          Edit
                                        </button>
                                        <button className="btn del" onClick={() => {
                                          if (!confirm(`Delete "${model.name}"?`)) return;
                                          const models = Array.isArray(master.model) ? master.model : [];
                                          const next = models.filter((m) => m.id !== model.id);
                                          const nextMaster = { ...master, model: next };
                                          saveMaster(nextMaster);
                                          setMaster(nextMaster);
                                        }}>
                                          Delete
                                        </button>
                                      </div>
                                    </div>
                                  ))
                                )}
                                <button
                                  className="pill ghost addModelBtn"
                                  onClick={() => {
                                    const modelName = prompt(`Add model for ${brand.name}:`);
                                    if (!modelName || !modelName.trim()) return;
                                    
                                    const models = Array.isArray(master.model) ? master.model : [];
                                    const newModel = {
                                      id: Date.now(),
                                      name: modelName.trim(),
                                      status: "Active",
                                      brandId: brand.id
                                    };
                                    
                                    const updatedModels = [...models, newModel];
                                    const nextMaster = { ...master, model: updatedModels };
                                    saveMaster(nextMaster);
                                    setMaster(nextMaster);
                                  }}
                                >
                                  + Add model
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
        </div>
      </div>
    );
  }


  // ✅ Special handling for officialDistributor: show countries
  if (type === "officialDistributor") {
    const distributors = list;

    const filtered = useMemo(() => {
      const s = q.trim().toLowerCase();
      const countriesData = Array.isArray(master.country) ? master.country : [];
      const distributorsData = Array.isArray(master.officialDistributor) ? master.officialDistributor : [];
      
      const countriesWithCount = countriesData.map((country) => {
        const count = distributorsData.filter((d) => d.countryId === country.id).length;
        return { ...country, distributorCount: count };
      });
      
      if (!s) return countriesWithCount;
      return countriesWithCount.filter((x) => String(x.name || "").toLowerCase().includes(s));
    }, [q, master]);

    const toggleDistributorStatus = (id) => {
      const distributor = distributors.find(x => x.id === id);
      if (!distributor) return;
      
      const newStatus = distributor.status === "Active" ? "Inactive" : "Active";
      const next = distributors.map(x =>
        x.id === id ? { ...x, status: newStatus } : x
      );
      updateItem(next);
    };

    const deleteDistributor = (id) => {
      const distributor = list.find(x => x.id === id);
      const name = distributor ? distributor.name : 'this distributor';
      if (!confirm(`Delete "${name}"? This action cannot be undone.`)) return;
      
      const next = list.filter((x) => x.id !== id);
      updateItem(next);
    };

    if (loading) return <div className="mdWrap"><div className="empty">Loading...</div></div>;

    return (
      <div className="mdWrap">
        <AdminSearchBar
          placeholder="Search countries…"
          value={q}
          onChangeQ={setQ}
          onSearch={setQ}
        />

        <Breadcrumb
          items={[
            { label: "Home", href: "/admin" },
            { label: "Master Data", href: "/admin/master" },
            { label: `${label} Data` },
          ]}
        />
        <h2 className="pageTitle">Master Data Management</h2>

        {error && <div className="empty" style={{ color: '#dc3545' }}>{error}</div>}

        <div className="panelMd">
          <div className="panelHeadRow">
            <h3 className="panelTitle">{label} by Country</h3>
            <button
              className="addBtnMd"
              onClick={() => navigate(`/admin/master/country/new?returnTo=/admin/master/officialDistributor`)}
            >
              + Add Country
            </button>
          </div>

          {type === "officialDistributor" && (
            <div className="inlineCreate">
              <div style={{ position: "relative", flex: 1, maxWidth: "400px" }}>
                <input
                  className="mdInput"
                  value={quickDistributorCountrySearch}
                  onChange={(e) => setQuickDistributorCountrySearch(e.target.value)}
                  onFocus={() => setShowDistributorCountryDropdown(true)}
                  onBlur={() => setTimeout(() => setShowDistributorCountryDropdown(false), 200)}
                  placeholder="Search country..."
                />
                {showDistributorCountryDropdown && (
                  <div style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    right: 0,
                    background: "#fff",
                    border: "1px solid #d1d7e6",
                    borderTop: "none",
                    borderRadius: "0 0 8px 8px",
                    maxHeight: "400px",
                    overflowY: "auto",
                    zIndex: 10,
                    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                    marginTop: "8px"
                  }}>
                    {filteredDistributorCountries.map(country => (
                      <div
                        key={country.id}
                        style={{
                          padding: "10px 14px",
                          margin: "8px 10px",
                          fontSize: "13px",
                          transition: "all 0.2s",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          borderRadius: "8px",
                          border: "1px solid #e0e6f2",
                          backgroundColor: "#fff"
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "#f0f4ff";
                          e.currentTarget.style.borderColor = "#5b7adb";
                          e.currentTarget.style.boxShadow = "0 2px 6px rgba(91, 122, 219, 0.15)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "#fff";
                          e.currentTarget.style.borderColor = "#e0e6f2";
                          e.currentTarget.style.boxShadow = "none";
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <span>{country.name}</span>
                          <span style={{ 
                            fontSize: "11px", 
                            color: country.status === "Active" ? "#28a745" : "#dc3545",
                            fontWeight: "700",
                            textTransform: "uppercase",
                            marginLeft: "12px"
                          }}>
                            {country.status === "Active" ? "Open" : "Closed"}
                          </span>
                        </div>
                        <div style={{ display: "flex", gap: "6px", marginLeft: "12px" }}>
                          <button
                            className="btn edit"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/admin/master/officialDistributor/${country.id}/new`);
                              setQuickDistributorCountrySearch("");
                              setShowDistributorCountryDropdown(false);
                            }}
                            style={{ padding: "4px 10px", fontSize: "12px" }}
                          >
                            Add Distributor
                          </button>
                        </div>
                      </div>
                    ))}
                    {filteredDistributorCountries.length === 0 && (
                      <div style={{ padding: "12px 14px", color: "#6b7a99", fontSize: "13px", textAlign: "center" }}>
                        No countries found
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="mdAccordion">
            {filtered.map((x) => {
              const child = distributors.filter((d) => d.countryId === x.id);
              const isOpen = !!openCountries[x.id];
              return (
                <div className="mdAccItem" key={x.id}>
                  <div
                    className="mdAccHeader"
                    role="button"
                    tabIndex={0}
                    onClick={() => setOpenCountries((prev) => ({ ...prev, [x.id]: !prev[x.id] }))}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        setOpenCountries((prev) => ({ ...prev, [x.id]: !prev[x.id] }));
                      }
                    }}
                  >
                    <div>
                      <div className="mdAccTitle">{x.name}</div>
                      <div className="mdAccMeta">{child.length} distributor(s)</div>
                    </div>
                    <div className="mdAccActions">
                      <button
                        className="pill ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/admin/master/officialDistributor/${x.id}/new`);
                        }}
                      >
                        + Add distributor
                      </button>
                      <div className="mdChevron">{isOpen ? "−" : "+"}</div>
                    </div>
                  </div>

                  {isOpen && (
                    <div className="mdAccBody">
                      {child.length === 0 && <div className="empty">No distributors yet.</div>}
                      {child.map((d) => (
                        <div className="mdSubRow" key={d.id}>
                          <div className="nameCell">{d.name}</div>
                          <div className="statusCell">
                            <button
                              className={`statusPill ${d.status === "Active" ? "on" : "off"}`}
                              onClick={() => toggleDistributorStatus(d.id)}
                              title={d.status === "Active" ? "Click to close" : "Click to open"}
                            >
                              <span className="statusDot" />
                              {d.status === "Active" ? "Open" : "Closed"}
                            </button>
                          </div>
                          <div className="actionsCol">
                            <button
                              className="btn edit"
                              onClick={() => navigate(`/admin/master/officialDistributor/${x.id}/edit/${d.id}`)}
                            >
                              Edit
                            </button>
                            <button className="btn del" onClick={() => deleteDistributor(d.id)}>
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {filtered.length === 0 && <div className="empty">No countries found.</div>}
          </div>
        </div>
      </div>
    );
  }

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return list;
    return list.filter((x) => String(x.name || "").toLowerCase().includes(s));
  }, [q, list]);

  const delItem = (id) => {
    if (!confirm("Delete this item?")) return;
    const next = list.filter((x) => x.id !== id);
    updateItem(next);
  };

  if (loading) return <div className="mdWrap"><div className="empty">Loading...</div></div>;

  return (
    <div className="mdWrap">
      <AdminSearchBar
        placeholder="Search items…"
        value={q}
        onChangeQ={setQ}
        onSearch={setQ}
      />

      <Breadcrumb
        items={[
          { label: "Home", href: "/admin" },
          { label: "Master Data", href: "/admin/master" },
          { label: `${label} Data` },
        ]}
      />
      <h2 className="pageTitle">Master Data Management</h2>

      {error && <div className="empty" style={{ color: '#dc3545' }}>{error}</div>}

      <div className="panelMd">
        <div className="panelHeadRow">
          <h3 className="panelTitle">{label} Data</h3>
          <button className="addBtnMd" onClick={() => setShowAddIntro(true)}>
            + Add new
          </button>
        </div>

        {type === "country" && (
          <div className="inlineCreate">
            <div style={{ position: "relative", flex: 1, maxWidth: "400px" }}>
              <input
                className="mdInput"
                value={quickCountrySearch}
                onChange={(e) => setQuickCountrySearch(e.target.value)}
                onFocus={() => setShowCountryDropdown(true)}
                onBlur={() => setTimeout(() => setShowCountryDropdown(false), 200)}
                placeholder="Search country..."
              />
              {showCountryDropdown && (
                <div style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  right: 0,
                  background: "#fff",
                  border: "1px solid #d1d7e6",
                  borderTop: "none",
                  borderRadius: "0 0 8px 8px",
                  maxHeight: "400px",
                  overflowY: "auto",
                  zIndex: 10,
                  boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                  marginTop: "8px"
                }}>
                  {filteredCountriesForSearch.map(country => (
                    <div
                      key={country.id}
                      style={{
                        padding: "10px 14px",
                        margin: "8px 10px",
                        fontSize: "13px",
                        transition: "all 0.2s",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        borderRadius: "8px",
                        border: "1px solid #e0e6f2",
                        backgroundColor: "#fff"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#f0f4ff";
                        e.currentTarget.style.borderColor = "#5b7adb";
                        e.currentTarget.style.boxShadow = "0 2px 6px rgba(91, 122, 219, 0.15)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "#fff";
                        e.currentTarget.style.borderColor = "#e0e6f2";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <span>{country.name}</span>
                        <span style={{ 
                          fontSize: "11px", 
                          color: country.status === "Active" ? "#28a745" : "#dc3545",
                          fontWeight: "700",
                          textTransform: "uppercase",
                          marginLeft: "12px"
                        }}>
                          {country.status === "Active" ? "Open" : "Closed"}
                        </span>
                      </div>
                      <div style={{ display: "flex", gap: "6px", marginLeft: "12px" }}>
                        <button
                          className="btn edit"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/admin/master/country/edit/${country.id}`);
                          }}
                          style={{ padding: "4px 10px", fontSize: "12px" }}
                        >
                          Edit
                        </button>
                        <button
                          className="btn del"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Delete "${country.name}"? This action cannot be undone.`)) {
                              delItem(country.id);
                              setQuickCountrySearch("");
                              setShowCountryDropdown(false);
                            }
                          }}
                          style={{ padding: "4px 10px", fontSize: "12px" }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                  {filteredCountriesForSearch.length === 0 && (
                    <div style={{ padding: "12px 14px", color: "#6b7a99", fontSize: "13px", textAlign: "center" }}>
                      No countries found
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mdTable">
          <div className="mdHead detail">
            <div>ID</div>
            <div>Name</div>
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
                  onClick={() => toggleStatus(x.id)}
                  title={x.status === "Active" ? "Click to close" : "Click to open"}
                >
                  <span className="statusDot" />
                  {x.status === "Active" ? "Open" : "Closed"}
                </button>
              </div>
              <div className="actionsCol">
                <button className="btn edit" onClick={() => navigate(`/admin/master/${type}/edit/${x.id}`)}>
                  Edit
                </button>
                <button className="btn del" onClick={() => delItem(x.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}

          {filtered.length === 0 && <div className="empty">No items found.</div>}
        </div>
      </div>

      {showAddIntro && (
        <div className="modalOverlay" onClick={() => setShowAddIntro(false)}>
          <div className="modalCard" onClick={(e) => e.stopPropagation()}>
            <div className="modalHead">
              <h3 className="modalTitle">Add New {label}</h3>
              <button className="modalClose" onClick={() => setShowAddIntro(false)}>×</button>
            </div>
            <div className="modalBody">
              <p className="modalText">Please review recent items before adding. This helps avoid duplicates and keeps data consistent.</p>
              <div className="mdPreviewList">
                {(Array.isArray(list) ? list.slice(0, 3) : []).map((x) => (
                  <div className="mdPreviewRow" key={x.id}>
                    <span className="dot" />
                    <div className="previewText">{x.name}</div>
                    <div className="statusTiny">{x.status === "Active" ? "Open" : "Closed"}</div>
                  </div>
                ))}
                {(!Array.isArray(list) || list.length === 0) && (
                  <div className="empty">No items yet.</div>
                )}
              </div>
            </div>
            <div className="modalActions">
              <button className="btn save" onClick={() => navigate(`/admin/master/${type}/new`)}>Continue</button>
              <button className="btn cancel" onClick={() => setShowAddIntro(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
