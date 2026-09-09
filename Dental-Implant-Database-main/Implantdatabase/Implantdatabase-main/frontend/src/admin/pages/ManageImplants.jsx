import React, { useMemo, useState, useEffect, useCallback } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import "./ManageImplants.css";
const MySwal = withReactContent(Swal);
import { useNavigate, useLocation } from "react-router-dom";
import AdminSearchBar from "../components/AdminSearchBar.jsx";
import Breadcrumb from "../components/Breadcrumb.jsx";
import {
  implantsAPI,
  masterDataAPI,
  resolveImageUrl,
} from "../../services/api.js";

const IMPLANTS_UPDATED_EVENT = "implants:updated";

const ImagePlaceholderIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="rowImageSvg">
    <path d="M5 5.5h14v13H5v-13Z" />
    <path d="m7.5 16 3.4-4 2.5 2.8 1.4-1.6 1.8 2.8" />
    <path d="M15.7 9.3h.1" />
  </svg>
);

const PaginationArrow = ({ direction }) => (
  <svg viewBox="0 0 20 20" aria-hidden="true" className="paginationIcon">
    <path d={direction === "prev" ? "M12.5 4.5 7 10l5.5 5.5" : "M7.5 4.5 13 10l-5.5 5.5"} />
  </svg>
);

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

export default function ManageImplants() {
  const navigate = useNavigate();
  const location = useLocation();

  const [q, setQ] = useState("");
  const [rows, setRows] = useState([]);
  const [master, setMaster] = useState({
    companies: [],
    levels: [],
    countries: [],
  });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const ITEMS_PER_PAGE = 8;

  const loadData = useCallback(async () => {
    setLoading(true);

    try {
      const fetched = await implantsAPI.getAll();
      const safeRows = Array.isArray(fetched) ? fetched : [];
      setRows(safeRows);
      return safeRows;
    } catch (err) {
      console.error("Error loading implants:", err);
      setRows([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
  loadData();

  const handleImplantsUpdated = (e) => {
    if (e && e.detail && e.detail.implant) {
      setRows((prev) => {
        // ลบ implant เดิมออกก่อน (ถ้ามี)
        const filtered = prev.filter((r) => String(r.id) !== String(e.detail.implant.id));
        // ใส่ implant ใหม่ไว้บนสุด
        return [e.detail.implant, ...filtered];
      });
    } else {
      loadData();
    }
  };

  window.addEventListener(IMPLANTS_UPDATED_EVENT, handleImplantsUpdated);

  return () => {
    window.removeEventListener(IMPLANTS_UPDATED_EVENT, handleImplantsUpdated);
  };
}, [loadData]);

  useEffect(() => {
    const params = new URLSearchParams(location.search || "");
    const qp = params.get("q") || "";
    setQ(qp);
  }, [location.search]);

  useEffect(() => {
    async function loadMasterData() {
      try {
        const [companies, levels, countries] = await Promise.all([
          masterDataAPI.getCompanies().catch(() => []),
          masterDataAPI.getLevels().catch(() => []),
          masterDataAPI.getCountries().catch(() => []),
        ]);

        setMaster({
          companies: Array.isArray(companies) ? companies : [],
          levels: Array.isArray(levels) ? levels : [],
          countries: Array.isArray(countries) ? countries : [],
        });
      } catch (err) {
        console.error("Error loading master data:", err);
        setMaster({
          companies: [],
          levels: [],
          countries: [],
        });
      }
    }

    loadMasterData();
  }, []);

  const getName = (type, id) => {
    if (!id) return "-";

    const list =
      type === "company"
        ? master.companies
        : type === "level"
        ? master.levels
        : master.countries;

    const found =
      list?.find(
        (x) =>
          Number(x.id) === Number(id) ||
          Number(x.idcompany) === Number(id) ||
          Number(x.idlevel) === Number(id) ||
          Number(x.idcountry) === Number(id)
      ) || null;

    return (
      found?.name ||
      found?.company_name ||
      found?.level_name ||
      found?.country_name ||
      "-"
    );
  };

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;

    return rows.filter((r) => {
      const companyName =
        r?.company?.name ||
        r?.company ||
        getName("company", r.companyId) ||
        "";

      const levelName =
        r?.level?.name ||
        r?.level ||
        getName("level", r.levelId) ||
        "";

      const countryName =
        r?.country?.name ||
        r?.country ||
        getName("country", r.countryId) ||
        r?.countryText ||
        "";

      const brandName =
        r?.brand?.name ||
        r?.brandName ||
        r?.brand ||
        "";

      const modelName =
        r?.model?.name ||
        r?.modelName ||
        r?.model ||
        r?.series ||
        "";

      const connectionTypeName =
        r?.connectionType?.name ||
        r?.connectionTypeName ||
        r?.connection_type ||
        r?.connectionType ||
        "";

      const connectionShapeName =
        r?.connectionShape?.name ||
        r?.connectionShapeName ||
        r?.connection_shape ||
        r?.connectionShape ||
        "";

      return [
        r?.name,
        r?.title,
        brandName,
        modelName,
        companyName,
        levelName,
        countryName,
        connectionTypeName,
        connectionShapeName,
        r?.source,
        r?.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(s);
    });
  }, [q, rows, master]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1;

  const pagedRows = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, page]);

  useEffect(() => {
    setPage(1);
  }, [q]);

  const toggleStatus = async (id, current) => {
    try {
      const next = current === "Active" ? "Inactive" : "Active";
      const updatedRow = await implantsAPI.update(id, { status: next });

      setRows((prev) =>
        prev.map((r) =>
          String(r.id) === String(id)
            ? { ...r, ...(updatedRow || {}), status: next }
            : r
        )
      );
    } catch (err) {
      alert("Failed to update status: " + (err.message || ""));
    }
  };

  const delImplant = async (id) => {
    const implant = rows.find((r) => String(r.id) === String(id));
    const name = implant ? implant.name : "this implant";
    const result = await MySwal.fire({
      title: "Are you sure you want to delete?",
      html: `<div class="swal2-imp-message">Do you want to delete <strong>"${escapeHtml(name)}"</strong>?<br><span>Once deleted, it cannot be undone!</span></div>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#3085d6",
      focusCancel: true,
      customClass: {
        popup: 'swal2-imp-popup',
        title: 'swal2-imp-title',
        htmlContainer: 'swal2-imp-html',
        confirmButton: 'swal2-imp-confirm',
        cancelButton: 'swal2-imp-cancel',
      },
    });
    if (!result.isConfirmed) return;

    try {
      await implantsAPI.delete(id);
      setRows((prev) => prev.filter((r) => String(r.id) !== String(id)));
      await MySwal.fire({
        icon: "success",
        title: "Data deleted successfully",
        showConfirmButton: false,
        timer: 1500,
        customClass: {
          popup: 'swal2-imp-popup',
          title: 'swal2-imp-title',
        },
      });
    } catch (err) {
      await MySwal.fire({
        icon: "error",
        title: "An error occurred while deleting",
        html: `<div class="swal2-imp-message">${escapeHtml(err.message || "Please try again later")}</div>`,
        customClass: {
          popup: 'swal2-imp-popup',
          title: 'swal2-imp-title',
          htmlContainer: 'swal2-imp-html',
        },
      });
    }
  };

  const formatDate = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  };

  const getRowImage = (row) => {
    return resolveImageUrl(
      row?.image1 ||
        row?.image2 ||
        row?.image3 ||
        row?.image_url ||
        row?.image ||
        row?.imageDataUrl ||
        row?.imageUrl
    );
  };

  if (loading) {
    return <div className="impWrap">Loading implants…</div>;
  }

  return (
    <div className="impWrap">
      <AdminSearchBar
        placeholder="Search implants, brand, model, shape..."
        value={q}
        onChangeQ={setQ}
        onSearch={setQ}
      />

      <Breadcrumb
        items={[
          { label: "Home", href: "/admin" },
          { label: "Implants Management" },
        ]}
      />

      <div className="impTopBar">
        <h1 className="pageTitle">IMPLANT MANAGEMENT</h1>

        <div className="impTopActions">
          <button
            className="addBtnImp"
            onClick={() => navigate("/admin/implants/new")}
          >
            + Add New Implant
          </button>
        </div>
      </div>

      <div className="panelImp blogLikePanel">
        <div className="sectionTitle">RECENTLY ADDED IMPLANTS</div>

        <div className="blogLikeTableHead">
          <div>Image</div>
          <div>Title</div>
          <div>Company / Level</div>
          <div>Date</div>
          <div>Status</div>
          <div className="headActions">Actions</div>
        </div>

        {pagedRows.length === 0 ? (
          <div className="emptyStateCard">
            <div className="emptyTitle">No implants found</div>
            <div className="emptySub">No implant data available yet.</div>
          </div>
        ) : (
          pagedRows.map((r) => {
            const imageUrl = getRowImage(r);
            const isMaster = r.source === "master";

            const companyName =
              r?.company?.name ||
              r?.company ||
              getName("company", r.companyId) ||
              "-";

            const levelName =
              r?.level?.name ||
              r?.level ||
              getName("level", r.levelId) ||
              "-";

            const brandText =
              r?.brand?.name ||
              r?.brandName ||
              r?.brand ||
              "No brand";

            return (
              <div className="blogLikeRow" key={r.id}>
                <div className="rowImageCol">
                  {imageUrl ? (
                    <>
                      <img
                        src={imageUrl}
                        alt={r.name || "implant"}
                        className="rowImage"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          const fallback = e.currentTarget.parentElement?.querySelector(
                            ".rowImageFallback"
                          );
                          if (fallback) {
                            fallback.style.display = "flex";
                          }
                        }}
                      />
                      <div
                        className="rowImageFallback"
                        style={{ display: "none" }}
                        title="No image"
                      >
                        <ImagePlaceholderIcon />
                      </div>
                    </>
                  ) : (
                    <div
                      className="rowImageFallback"
                      style={{ display: "flex" }}
                      title="No image"
                    >
                      <ImagePlaceholderIcon />
                    </div>
                  )}
                </div>

                <div className="rowTitleCol">
                  <div className="rowMainTitle">{r.name || "-"}</div>
                  <div className="rowSubText">Brand: {brandText}</div>
                </div>


                <div className="rowMetaCol">
                  <div className="rowMetaMain">{companyName}</div>
                  <div className="rowMetaSub">{levelName}</div>
                </div>

                <div className="rowDateCol">
                  {formatDate(r.createdAt || r.updatedAt)}
                </div>

                <div className="rowStatusCol">
                  <button
                    className={`statusPill ${
                      r.status === "Active" ? "open" : "closed"
                    }`}
                    onClick={() => toggleStatus(r.id, r.status)}
                    title="Click to toggle status"
                  >
                    <span className="statusDot" />
                    {r.status === "Active" ? "Open" : "Closed"}
                  </button>
                </div>

                <div className="rowActionsCol">
                  <button
                    className="actionBtn editBtn"
                    onClick={() => navigate(`/admin/implants/edit/${r.id}`)}
                  >
                    Edit
                  </button>

                  <button
                    className="actionBtn deleteBtn"
                    onClick={() => delImplant(r.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })
        )}

        {filtered.length > ITEMS_PER_PAGE && (
          <div className="paginationWrap">
            <button
              className="paginationBtn"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <PaginationArrow direction="prev" />
              <span>Previous</span>
            </button>

            <span className="paginationText">
              Page {page} of {totalPages}
            </span>

            <button
              className="paginationBtn"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              <span>Next</span>
              <PaginationArrow direction="next" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
