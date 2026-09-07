import React, { useEffect, useMemo, useState } from "react";
import "./Profile.css";
import AdminSearchBar from "../components/AdminSearchBar.jsx";
import Breadcrumb from "../components/Breadcrumb.jsx";
import CustomSelect from "../components/CustomSelect.jsx";
import { profileAPI } from "../../services/api.js";

const ROLE_OPTIONS = ["Admin", "Editor", "Distributor"];
const JOB_OPTIONS = ["Dentist", "Dental", "Marketing"];
const LEVEL_OPTIONS = ["1"];

const mapRoleIdToLabel = (roleId, userRole) => {
  if (Number(roleId) === 1 || userRole === "admin") return "Admin";
  if (Number(roleId) === 2) return "Editor";
  if (Number(roleId) === 3) return "Distributor";
  return userRole === "admin" ? "Admin" : "Editor";
};

const mapJobTitleIdToLabel = (jobTitleId) => {
  if (Number(jobTitleId) === 1) return "Dentist";
  if (Number(jobTitleId) === 2) return "Dental";
  if (Number(jobTitleId) === 3) return "Marketing";
  return "Dental";
};

const mapRoleLabelToId = (role) => {
  if (role === "Admin") return 1;
  if (role === "Editor") return 2;
  if (role === "Distributor") return 3;
  return 1;
};

const mapJobTitleLabelToId = (jobTitle) => {
  if (jobTitle === "Dentist") return 1;
  if (jobTitle === "Dental") return 2;
  if (jobTitle === "Marketing") return 3;
  return 2;
};

const buildAdminUserPayload = (user, userProfile) => {
  const first = userProfile?.name || "";
  const last = userProfile?.surname || "";
  const fullName = `${first} ${last}`.trim();

  return {
    id: user?.id,
    username: user?.username || "",
    email: user?.email || "",
    role: user?.role || "admin",
    name: fullName || user?.username || "Admin",
    image_url: userProfile?.image_url || "",
  };
};

const persistAdminUser = (user, userProfile) => {
  const payload = buildAdminUserPayload(user, userProfile);
  localStorage.setItem("admin_user", JSON.stringify(payload));
  window.dispatchEvent(
    new CustomEvent("admin-user-updated", { detail: payload })
  );
};

export default function Profile() {
  const [edit, setEdit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [profile, setProfile] = useState({
    username: "",
    email: "",
    fullName: "",
    role: "Admin",
    jobTitle: "Dental",
    level: "1",
    profileImage: "",
  });

  const canSave = useMemo(() => {
    return (
      profile.fullName?.trim() &&
      profile.username?.trim() &&
      profile.email?.trim() &&
      profile.role &&
      profile.jobTitle &&
      profile.level
    );
  }, [profile]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const result = await profileAPI.getMe();
      const user = result?.user || {};
      const userProfile = result?.profile || {};

      const fullName = [userProfile.name || "", userProfile.surname || ""]
        .join(" ")
        .trim();

      setProfile({
        username: user.username || "",
        email: user.email || "",
        fullName: fullName || user.username || "",
        role: mapRoleIdToLabel(userProfile.role_id, user.role),
        jobTitle: mapJobTitleIdToLabel(userProfile.job_title_id),
        level: String(userProfile.level_id || 1),
        profileImage: userProfile.image_url || "",
      });

      persistAdminUser(user, userProfile);
    } catch (err) {
      setError(err?.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const save = async () => {
    if (!canSave) return;

    try {
      setSaving(true);
      setError("");

      const nameParts = String(profile.fullName || "")
        .trim()
        .split(/\s+/)
        .filter(Boolean);

      const name = nameParts[0] || "";
      const surname = nameParts.slice(1).join(" ");

      const role_id = mapRoleLabelToId(profile.role);
      const level_id = Number(profile.level || 1);
      const job_title_id = mapJobTitleLabelToId(profile.jobTitle);

      const result = await profileAPI.updateMe({
        username: profile.username.trim(),
        email: profile.email.trim().toLowerCase(),
        name,
        surname,
        role_id,
        level_id,
        job_title_id,
        image_url: profile.profileImage,
      });

      if (result?.user && result?.profile) {
        persistAdminUser(result.user, result.profile);
      }

      setEdit(false);
      await loadProfile();
    } catch (err) {
      setError(err?.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      setError("Image is too large. Please choose an image smaller than 2MB.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const imageData = String(reader.result || "");
      setProfile((prev) => ({
        ...prev,
        profileImage: imageData,
      }));
      setError("");
    };

    reader.onerror = () => {
      setError("Failed to read image file");
    };

    reader.readAsDataURL(file);
  };

  if (loading) {
    return (
      <div className="pfWrap">
        <h2 className="pageTitle">👤 My Profile</h2>
        <div className="pfCard">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="pfWrap">
      <AdminSearchBar
        placeholder="Search…"
        value=""
        onChangeQ={() => {}}
        onSearch={() => {}}
      />

      <Breadcrumb
        items={[
          { label: "Home", href: "/admin" },
          { label: "Profile" },
        ]}
      />

      <h2 className="pageTitle">👤 My Profile</h2>

      <div className="pfCard">
        {error ? <div className="error">{error}</div> : null}

        <button className="pfEdit" onClick={() => setEdit(true)} type="button">
          ✎ <span>Edit</span>
        </button>

        <div className="pfAvatar">
          <label className={`pfImageUpload ${!edit ? "pfImageDisabled" : ""}`}>
            {profile.profileImage ? (
              <img src={profile.profileImage} alt="profile" className="pfImg" />
            ) : (
            <div className="pfCircle">
              <span>
                {profile.fullName?.charAt(0)?.toUpperCase() || "A"}
                </span>
                </div>
              )}

            {edit && (
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={handleImageChange}
              />
            )}
          </label>
        </div>

        <div className="pfLabel">Name &nbsp;Surname</div>
        <div className="pfName">{profile.fullName || "-"}</div>

        {!edit ? (
          <>
            <div className="pfGroup">
              <div className="pfSmallLabel">Username</div>
              <div className="pfValue">{profile.username || "-"}</div>
            </div>

            <div className="pfGroup">
              <div className="pfSmallLabel">Email</div>
              <div className="pfValue">{profile.email || "-"}</div>
            </div>

            <div className="pfGroup">
              <div className="pfSmallLabel">Role</div>
              <div className="pfValue">{profile.role}</div>
            </div>

            <div className="pfGroup">
              <div className="pfSmallLabel">Level</div>
              <div className="pfValue">{profile.level}</div>
            </div>

            <div className="pfGroup">
              <div className="pfSmallLabel">Job Title</div>
              <div className="pfValue">{profile.jobTitle}</div>
            </div>
          </>
        ) : (
          <>
            <div className="pfEditRow">
              <div className="pfField">
                <div className="pfSmallLabel">Full Name</div>
                <input
                  className="pfSelect"
                  value={profile.fullName}
                  onChange={(e) =>
                    setProfile((prev) => ({
                      ...prev,
                      fullName: e.target.value,
                    }))
                  }
                  placeholder="Enter full name"
                />
              </div>

              <div className="pfField">
                <div className="pfSmallLabel">Username</div>
                <input
                  className="pfSelect"
                  value={profile.username}
                  onChange={(e) =>
                    setProfile((prev) => ({
                      ...prev,
                      username: e.target.value,
                    }))
                  }
                  placeholder="Enter username"
                />
              </div>
            </div>

            <div className="pfEditRow">
              <div className="pfField">
                <div className="pfSmallLabel">Email</div>
                <input
                  className="pfSelect"
                  value={profile.email}
                  onChange={(e) =>
                    setProfile((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  placeholder="Enter email"
                />
              </div>

              <div className="pfField">
                <div className="pfSmallLabel">Role</div>
                <CustomSelect
                  value={profile.role}
                  onChange={(val) =>
                    setProfile((prev) => ({
                      ...prev,
                      role: val,
                    }))
                  }
                  options={ROLE_OPTIONS}
                  placeholder="Select role"
                />
              </div>
            </div>

            <div className="pfEditRow">
              <div className="pfField">
                <div className="pfSmallLabel">Level</div>
                <CustomSelect
                  value={profile.level}
                  onChange={(val) =>
                    setProfile((prev) => ({
                      ...prev,
                      level: val,
                    }))
                  }
                  options={LEVEL_OPTIONS}
                  placeholder="Select level"
                />
              </div>

              <div className="pfField">
                <div className="pfSmallLabel">Job Title</div>
                <CustomSelect
                  value={profile.jobTitle}
                  onChange={(val) =>
                    setProfile((prev) => ({
                      ...prev,
                      jobTitle: val,
                    }))
                  }
                  options={JOB_OPTIONS}
                  placeholder="Select job title"
                />
              </div>
            </div>

            <button
              className="pfSave"
              onClick={save}
              disabled={!canSave || saving}
              type="button"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}